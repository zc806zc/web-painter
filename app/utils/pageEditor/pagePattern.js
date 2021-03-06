import $ from 'jquery'

export default class PagePattern {
  constructor(patternReactComponentClass, pagePiece, index, $pattern) {
    this.attributeGroups = patternReactComponentClass.attributeGroups;
    this.tag = 'pattern';
    this.pagePiece = pagePiece;
    this.index = index;
    this.selected = false;
    this.$pattern = $pattern || this.initDom(patternReactComponentClass);
  }

  // init
  initDom(patternReactComponentClass) {
    let plainHtmlText = patternReactComponentClass.plainHtmlText;
    if (typeof plainHtmlText == 'function') {
      plainHtmlText = plainHtmlText();
    }
    let $pattern = $(plainHtmlText).addClass('pe-pattern');
    if (patternReactComponentClass.domDidAdd) {
      patternReactComponentClass.domDidAdd($pattern);
    }
    $pattern.attr('wp-pattern-index', this.index);
    return $pattern;
  }

  updateIndex(index) {
    this.index = index;
    this.$pattern.attr('wp-pattern-index', this.index);
  }

  // piece control

  getInfo () {
    return {
      height: this.$pattern.outerHeight(),
      selected: this.selected
    }
  }

}