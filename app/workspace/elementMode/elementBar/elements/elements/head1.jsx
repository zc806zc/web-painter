let React = require('react');
let htmlTemplate = require('./../../../../../htmlTemplates/elements/head1.html');

import Element from './../element'

export default class Head1Element extends Element{
  constructor(props) {
    super(props);
    this.tag = 'head1';
    // bind
  }
  // page editor function
  getPlainHtmlText() {
    return htmlTemplate;
  }
}
Head1Element.elementTag = 'head1';