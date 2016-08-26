import $ from 'jquery'
import PagePattern from './pagePattern'
import { PatternAttributeHandler, ElementAttributeHandler } from './attributeHandler'

require('./pagePiece.scss');

// public vars

let currentHoverElement = null;
let currentHoverType = '';
let currentHoverPosition = '';


export default class PagePiece {
  constructor(pieceReactComponent, page) {
    this.tag = 'piece';
    this.component = pieceReactComponent;
    this.pageEditor = page;
    this.$page = page.$page;
    this.patterns = [];
    this.$piece = this.initDom(pieceReactComponent);
  }

  // init
  initDom(pieceReactComponent) {
    let $piece = null;
    if ($(`.pe-piece.${pieceReactComponent.tag}`, this.$page).length > 0) {
      throw new Error(`[page editor]: already have ${pieceReactComponent.tag} piece`);
    } else {
      $piece = $(`<div class="pe-piece ${pieceReactComponent.tag}"></div>`);
      console.log(`[page editor]: add ${pieceReactComponent.tag} piece`);
    }
    $piece = this.initClick($piece);
    $piece = this.initHover($piece);
    $piece = this.initMousemove($piece);
    this.initEvent();
    return $piece;
  }

  initClick($piece) {
    // element mode: add element
    $piece.click((e) => {
      if (window._mode_ == 'select') {
        if ($(e.target).attr('wp-pattern')) {
          // select pattern
          let pagePatternIndex = parseInt($(e.target).attr('wp-pattern-index'));
          this.selectPattern(pagePatternIndex);
        } else {
          // select element
          this.selectElement(e);
        }
      }
      if (window._mode_ == 'element') {
        if (e.target == currentHoverElement) {
          this.addElement(e.target);
        }
      }
    })
    
    return $piece;
  }

  initHover($piece) {
    $piece.hover((e) => {
      console.log('in');
    }, (e) => {
      exEventEmitter.emit('cancelHoverElement', this.component.tag);
    });
    return $piece;
  }

  initMousemove($piece) {
    // element mode: hover something
    $piece.mousemove((e) => {
      let $target = $(e.target);
      if (
        window._mode_ == 'element'
        && e.target != e.currentTarget
        && !$target.hasClass('pe-pattern')
      ) {
        let p1 = $piece.offset();
        let p2 = $target.offset();
        if ($target.attr('wp-raw') == "") {
          if (currentHoverElement == e.target) return;
          currentHoverElement = e.target;
          // replace
          exEventEmitter.emit('updateHoverElement',
            'replace',
            this.component.tag,
            parseInt((p2.left - p1.left) * window._zoom_),
            parseInt((p2.top - p1.top) * window._zoom_),
            parseInt($target.outerWidth() * window._zoom_),
            parseInt($target.outerHeight() * window._zoom_)
          )
        } else {
          // insert
          let realHalfHeight = $target.outerHeight() * window._zoom_ / 2;
          let position = realHalfHeight > e.offsetY ? "top" : "bottom";
          if (currentHoverElement == e.target && currentHoverPosition == position) return;
          currentHoverElement = e.target;
          exEventEmitter.emit('updateHoverElement',
            'insert',
            this.component.tag,
            parseInt((p2.left - p1.left) * window._zoom_),
            parseInt((p2.top - p1.top) * window._zoom_),
            parseInt($target.outerWidth() * window._zoom_),
            parseInt($target.outerHeight() * window._zoom_),
            position
          )
        }
        
      } else {
        exEventEmitter.emit('cancelHoverElement', this.component.tag);
      }
    });
    return $piece;
  }

  initEvent() {
    exEventEmitter.on('cancelSelectd', () => {
      for (var i = 0; i < this.patterns.length; i++) {
        var pattern = this.patterns[i];
        pattern.selected = false;
      };
      this.updateRender();
    });
    exEventEmitter.on('cancelHoverElement', () => {
      currentHoverElement = null;
      currentHoverType = '';
      currentHoverPosition = '';
    });
    exEventEmitter.on('updateHoverElement', (type, tag, left, top, width, height, position) => {
      currentHoverType = type;
      currentHoverPosition = position;
    });
  }

  // element control
  addElement(target) {
    let elementComponent = this.pageEditor.currentSelectComponent;
    let $target = $(target);
    let $element = $(elementComponent.getPlainHtmlText());
    if (currentHoverType == 'replace') {
      // replace
      $target.after($element);
      $target.detach();
    } else if (currentHoverType == 'insert') {
      // insert
      if (currentHoverPosition == 'top') {
        $target.before($element);
      } else if (currentHoverPosition == 'bottom') {
        $target.after($element);
      }
    }
    this.updateRender();
    // 历史记录
    if (this.component.tag == 'body') {
      if (currentHoverType == 'replace') {
        exEventEmitter.emit('addHistory', 'add element', null, $element, () => {
          $element.first().before($target);
          $element.detach();
        }, () => {
          $target.after($element);
          $target.detach();
        })
      } else if (currentHoverType == 'insert') {
        let redo;
        if (currentHoverPosition == 'top') {
          redo = () => {
            $target.before($element);
          }
        } else if (currentHoverPosition == 'bottom') {
          redo = () => {
            $target.after($element);
          }
        }
        exEventEmitter.emit('addHistory', 'add element', null, $element, () => {
          $element.detach();
        }, redo)
      }
    }
    exEventEmitter.emit('cancelHoverElement', this.component.tag);
    console.log(`[page editor][${this.component.tag} piece]: add ${elementComponent.tag} element`);
  }

  selectElement(e) {
    exEventEmitter.emit('cancelSelectd');
    exEventEmitter.emit('modeChange', 'select');
    this.updateRender(e);
    exEventEmitter.emit('selectSomething', new ElementAttributeHandler(e.target, this));
  }

  // pattern control

  addPattern(patternReactComponent, index) {
    exEventEmitter.emit('cancelSelectd');
    let pattern = new PagePattern(patternReactComponent, this, index);
    this._addPattern(pattern, index);
    // 历史记录
    if (this.component.tag == 'body') {
      exEventEmitter.emit('addHistory', 'add pattern', null, pattern, () => {
        this._deletePattern(index);
      }, () => {
        this._addPattern(pattern, index);
      })
    }
    this.component.handleChangePatternBarState(index);
    console.log(`[page editor][${this.component.tag} piece]: add ${patternReactComponent.tag} pattern at position ${index}`);
  }
  _addPattern(pattern, index) {
    let patterns = this.patterns;
    if (patterns.length == 0) {
      // empty的情况
      this.patterns.push(pattern);
      this.$piece.append(pattern.$pattern);
    } else {
      // 插入的情况
      if (index == patterns.length) {
        // 直接放到末尾
        patterns.push(pattern);
        this.$piece.append(pattern.$pattern);
      } else {
        // 插入到当前这个index前面
        patterns[index].$pattern.before(pattern.$pattern);
        patterns.splice(index, 0, pattern);
      }
    }
    // 如果是body piece则将patterns加入到当前页面数据中
    if (this.component.tag == 'body') {
      this.pageEditor.project.setCurrentPagePatterns(patterns);
    }
    this.updateRender()
  }

  deletePattern(index) {
    exEventEmitter.emit('cancelSelectd');
    if (index >= this.patterns.length) return;
    let pattern = this._deletePattern(index);
    // 历史记录
    if (this.component.tag == 'body') {
      exEventEmitter.emit('addHistory', 'delete pattern', pattern, null, () => {
        this._addPattern(pattern, index);
      }, () => {
        this._deletePattern(index);
      })
    }
  }
  _deletePattern(index) {
    let patterns = this.patterns;
    let pattern = patterns[index];
    pattern.$pattern.detach();
    patterns.splice(index, 1);
    this.pageEditor.project.setCurrentPagePatterns(this.patterns);
    this.updateRender();
    return pattern;
  }

  selectPattern(index) {
    exEventEmitter.emit('cancelSelectd');
    exEventEmitter.emit('modeChange', 'select');
    let pagePattern = this.patterns[index];
    pagePattern.selected = true;
    this.updateRender();
    exEventEmitter.emit('selectSomething', new PatternAttributeHandler(pagePattern, this));
  }

  replacePatterns(patterns) {
    this.patterns = patterns;
    this.$piece.empty();
    for (var i = 0; i < this.patterns.length; i++) {
      this.$piece.append(this.patterns[i].$pattern);
    }
    this.updateRender();
    console.log(`[page editor][${this.component.tag} piece]: update patterns`);
  }

  // update
  updateRender(e) {
    this.updatePatternInfo();
    this.updatePatterns();
    this.updateHeight();
    this.updateElement(e);
  }

  updatePatternInfo() {
    for (var i = 0; i < this.patterns.length; i++) {
      var pattern = this.patterns[i];
      pattern.updateIndex(i);
    }
  }

  updatePatterns() {
    let patterns = this.patterns.map((p) => {
      return p.getInfo();
    })
    if (patterns.length == 0) {
      this.$piece.addClass('empty');
    } else {
      this.$piece.removeClass('empty');
    }
    this.component.updatePatterns(patterns);
  }

  updateHeight() {
    this.component.updateHeight(this.$piece.outerHeight());
  }

  updateElement(e) {
    if (e) {
      let $target = $(e.target);
      let p1 = this.$piece.offset();
      let p2 = $target.offset();
      this.component.updateElementSelectedBorder({
        left: parseInt((p2.left - p1.left) * window._zoom_),
        top:  parseInt((p2.top - p1.top) * window._zoom_),
        width: parseInt($target.outerWidth() * window._zoom_),
        height: parseInt($target.outerHeight() * window._zoom_),
        opacity: 1
      });
    } else {
      this.component.updateElementSelectedBorder({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        opacity: 0
      });
    }
  }
}