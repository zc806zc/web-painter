let React = require('react');
let htmlTemplate = require('./../../../../../../htmlTemplates/patterns/structure/one-piece.html');
require('./../../../../../../htmlTemplates/patterns/structure/one-piece.scss');

import Pattern from './../../pattern'

export default class OnePiecePattern extends Pattern {
  constructor(props) {
    super(props);
    this.tag = 'one-piece'
  }
  renderSample() {
    return (
      <div className="one-piece pattern-element" style={{
        position: 'absolute',
        borderWidth: 1,
        borderStyle: 'solid',
        width: 'calc(100% - 40px)',
        height: 'calc(100% - 40px)',
        top: 20,
        left: 20
      }}></div>
    )
  }

  // page editor function
  getPlainHtmlText() {
    return htmlTemplate;
  }
}
OnePiecePattern.patternTag = 'one-piece';