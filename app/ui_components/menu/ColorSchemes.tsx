import * as React from 'react';
import 'chroma-js';

let ChromaStrings : Array<string> = [ 'Greys', 'Reds', 'Blues', 'Greens', 'OrRd', 'YlOrRd', 'RdPu', 'PuRd', 'PuBu', 'YlGnBu'];
export class ColorSchemes extends React.Component<IColorSchemeProps, {}>{

  render(){
    console.log('asd?')
    return <div>
      {this.createGradients()}
    </div>
  }
  createGradients(){
    let gradients = [];
    for (let name in ChromaStrings){
      gradients.push(<div className='gradient'>{this.getChromaScale(name, this.props.steps)}</div>);
    }
    console.log(gradients);
    return gradients;
  }
  getChromaScale (chromaString: string, steps: number){
    let inDivs = [];

    let cs = chroma.scale(chromaString).mode('lab').correctLightness(true).domain([0, steps]);
    for (let i = 0; i<steps; i++){
      inDivs.push(<div background={cs(i).hex()} width={100/steps}/>);
    }
    return inDivs;
  }


}
