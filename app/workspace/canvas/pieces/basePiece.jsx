let React = require('react');

require('./basePiece.scss');

export default class BasePiece extends React.Component{
  constructor(props) {
    super(props);
    this.tag = ''
    this.state = {
      patterns: [],
      height: 0,
    }
    // bind
    this.handleChangePatternBarState = this.handleChangePatternBarState.bind(this);
    this.addPattern = this.addPattern.bind(this);
  }
  componentDidMount() {
    pageEditor.addPiece(this);
    exEventEmitter.on('afterZoomChange', (zoom) => {
      this.updateHeight();
    });
  }
  componentWillUnmount(){
  }
  handleChangePatternBarState (index) {
    exEventEmitter.emit('changePatternBarState', this, index);
  }
  addPattern(pattern, index) {
    console.log(`[${this.tag} piece]: add ${pattern.tag} pattern into position ${index}`);
    let piece = pageEditor.getPiece(this.tag);
    piece.addPattern(pattern, index);
  }
  updateHeight(height) {
    height = height || this.state.height;
    this.setState({
      height: height
    })
  }
  render() {
    let classes = "piece " + this.tag + (this.props.active ? " active" : "");
    let pieceStyle = {
      height: this.state.height * window._zoom_
    }
    return (
      <div className={classes} style={pieceStyle}>
        {this.state.patterns.length == 0 ?
          <div className="empty" onClick={() => this.handleChangePatternBarState(0)}></div> :
          this.state.patterns.map((p, i) => 
            <div className="pattern"></div>
          )
        }
      </div>
    );
  }
}
BasePiece.defaultProps = {
  
}