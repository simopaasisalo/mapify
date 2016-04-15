import * as React from 'react';
let Select = require('react-select');
import {ColorSchemes} from './ColorSchemes';


export class  ColorMenu extends React.Component<IColorOptionsProps, IColorOptionsStates>{
  constructor(){
    super();
    this.state =
      {
        selectedVar: ''
      };
    }
  variableChanged(val){
    this.setState({
      selectedVar : val.value
    });
  }
  schemeChanged(val){

  }
  saveOptions(){

    this.props.saveValues({
      choroplethOptions : {
        valueProperty: this.state.selectedVar,
        steps : 7,
        scale : ['white','yellow','orange','red'],
        mode : 'q'

        },
      });
  }
  render(){

    return(
      <div className="mapify-options">
        <h4>Select the variable to color by</h4>
        <Select options={this.props.headers} onChange={this.variableChanged.bind(this)} value={this.state.selectedVar} />
        <h4>Select the color scale</h4>
        <Select>
          <ColorSchemes steps={7}/>
        </Select>
        <h4>Select the color steps</h4>
        <input  type="range"/>
        <button onClick={this.saveOptions.bind(this)}>Refresh map</button>
      </div>
    );
  }

}
