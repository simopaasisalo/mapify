import * as React from 'react';
import {ColorMenu} from './ColorMenu';
import {SymbolMenu} from './SymbolMenu';
import {LayerTypes} from '../common_items/common';

let Select = require('react-select');
let Menu = require('impromptu-react-sidemenu');
let _currentOptions : IVisualizationOptions;

export class  MapifyMenu extends React.Component<IMenuProps, IMenuStates>{
  componentWillMount(){
    this.state = {
      colorOptionsShown : false,
      symbolOptionsShown : false,
      activeLayer : this.props.layers[0],
    };
    _currentOptions = this.props.originalOptions;
    _currentOptions.layerName = this.state.activeLayer.layerName;
  }
  handleSelection(item){

    switch (item) {
      case 0:
        this.setState({
          colorOptionsShown: !this.state.colorOptionsShown,
          symbolOptionsShown : false,
        });
        break;
      case 1:
        this.setState({
          colorOptionsShown : false,
          symbolOptionsShown: !this.state.symbolOptionsShown,
        });
        break;
    }
  }
  activeLayerChanged(val:{label: string, value:ILayerData}){
    _currentOptions.layerName = val.label;
    this.setState({
      colorOptionsShown : false,
      symbolOptionsShown: false,
      activeLayer: val.value,
    });
  }
  refreshColorOptions(options: IColorOptions){

    _currentOptions.colorOptions = options;
    this.refreshMap();
  }
  refreshSymbolOptions(options: ISymbolOptions){
    _currentOptions.symbolOptions = options;
    this.refreshMap();
  }
  refreshMap(){
    this.props.refreshMap(_currentOptions);
  }
  render(){
    let layers = [];
    for(let layer of this.props.layers){
      layers.push({value:layer.layerName, label: layer.layerName });
      }
    return (
      <Menu.Menu showDividers={true}>

        <Menu.Brand>
          Options
        </Menu.Brand>

        <Select
          options={layers}
          onChange = {this.activeLayerChanged.bind(this)}
          value = {this.state.activeLayer.layerName}/>
        <Menu.Item>
          <p className="fa fa-paint-brush" onClick = {this.handleSelection.bind(this, 0)}> Colors </p>
          {this.state.colorOptionsShown ? <ColorMenu headers = {this.state.activeLayer.headers} saveValues = {this.refreshColorOptions.bind(this)}/> : null }
        </Menu.Item>
        {this.state.activeLayer.layerType != LayerTypes.ChoroplethMap ?
          <Menu.Item >
          <p className="fa fa-circle-o" onClick = {this.handleSelection.bind(this, 1)}> Symbols </p>
            {this.state.symbolOptionsShown ? <SymbolMenu headers = {this.state.activeLayer.headers} saveValues = {this.refreshSymbolOptions.bind(this)}/> : null }
          </Menu.Item>
          : <div/>
        }


      </Menu.Menu>
    );
  }
}
