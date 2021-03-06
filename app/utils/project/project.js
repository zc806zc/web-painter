import Page from './page'
import $ from 'jquery';

import {getPatternFrom$dom} from './utils'
import ProjectAssetList from './asset'
import ColorList from './colors'
import { defaultColor } from './colors'

const ipc = require('electron').ipcRenderer

export default class Project {
  constructor(pageEditor) {
    this.pageEditor = pageEditor;
    // 用来保存filepath
    this.filepath = null;

    // 页面
    this.pages = [];
    this.currentPage = null;

    // pieces
    this.headerPiece = null;
    this.bodyPiece = null;
    this.footerPiece = null;

    // asset
    this.assets = new ProjectAssetList(this);
    this.colors = new ColorList(defaultColor);

    this.initEvent();
    ipc.emit('update-project-path', null, ipc.sendSync('get-project-path'));
  }

  init() {
    // set public pieces
    this.headerPiece = this.pageEditor.getPiece('header');
    this.bodyPiece = this.pageEditor.getPiece('body');
    this.footerPiece = this.pageEditor.getPiece('footer');

    let page = this.addNewPage({
      name: 'HOME',
      title: 'Home Page',
      fileName: 'index'
    });

  }

  initEvent() {
    exEventEmitter.on('selectProjectPage', (name) => {
      this.selectPage(name);
    });
    exEventEmitter.on('createProjectPage', (name) => {
      let pageinfo = {
        name: name,
        fileName: name.toLowerCase()
      }
      this.addNewPage(pageinfo);
    });
    ipc.on('update-project-path', (event, filename) => {
      this.filepath = filename;
      if (filename == null) {
        filename = 'Untitled'
      }
      document.title = `${filename} - Web Painter`;
    });
  }

  addNewPage(obj) {
    let page = new Page(obj.name, this);
    Object.keys(obj).map((key) => {
      page[key] = obj[key];
    });
    this.pages.push(page);
    exEventEmitter.emit('selectProjectPage', page.name);
    return page;
  }

  updatePageInfo(name, obj) {
    delete obj.name;
    let page = this.pages.find((p) => p.name == name);
    Object.keys(obj).map((key) => {
      page[key] = obj[key];
    });
  }

  selectPage(name) {
    let page = this.pages.find((p) => p.name == name);
    this.currentPage = page;
    this.bodyPiece.replacePatterns(this.currentPage.patterns);
    exEventEmitter.emit('projectPageInfoChange', this);
    exEventEmitter.emit('cancelSelectd');
  }

  setCurrentPagePatterns(patterns) {
    // 若整个Pattern被替换的话，这个函数就必要了，若操作同一个pattern，则这个函数事实上不变
    this.currentPage.patterns = patterns;
  }

  // save project
  getMetaInfo() {
    let ret = {};

    // public pieces
    ret.headerPiece = this.headerPiece.$piece[0].innerHTML;
    ret.footerPiece = this.footerPiece.$piece[0].innerHTML;

    // page body pieces
    ret.pages = this.pages.map((p) => {
      return p.getMetaInfo();
    });

    // colors
    ret.colors = this.colors;
    
    return ret;
  }

  importFromMetaInfo(info) {
    // header piece
    let headerPiecePatterns = $.makeArray($(info.headerPiece).map((index, p) => {
      return getPatternFrom$dom($(p), this.headerPiece, index);
    }));
    this.headerPiece.replacePatterns(headerPiecePatterns);
    // footer piece
    let footerPiecePatterns = $.makeArray($(info.footerPiece).map((index, p) => {
      return getPatternFrom$dom($(p), this.footerPiece, index);
    }));
    this.footerPiece.replacePatterns(footerPiecePatterns);
    // pages
    let pages = info.pages.map((p) => {
      let page = new Page(p.name, this);
      page.importFromMetaInfo(p);
      return page;
    });
    // colors
    this.colors = new ColorList(info.colors);
    exEventEmitter.emit('projectColorsDidUpdate');

    this.pages = pages;
    this.selectPage(pages[0].name);
  }
}