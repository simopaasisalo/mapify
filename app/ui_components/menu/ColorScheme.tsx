import * as React from 'react';
let chroma = require('chroma-js');

export class ColorScheme extends React.Component<IColorSchemeProps, {}>{

  render(){
    return <div className='gradient' key={name}>{this.getChromaScale(this.props.gradientName, this.props.steps)}</div>;
  }

  getChromaScale (chromaString: string, steps: number){
    let inDivs = [];
    let cs = chroma.scale(chromaString).mode('lab').correctLightness(true).domain([0, steps]);
    for (let i = 0; i<steps; i++){
      let style = {
        background : cs(i).hex(),
        height : 50,
        width : 180/steps, //total width of item / steps
        display : 'inline-block'
      }
      inDivs.push(<div key={cs(i)+i} style={style}/>);
    }

    return inDivs;
  }


}
