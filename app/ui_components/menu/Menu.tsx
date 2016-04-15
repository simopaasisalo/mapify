import * as React from 'react';
import {ColorMenu} from './ColorMenu';
let Select = require('react-select');


export class  MapifyMenu extends React.Component<IMenuProps, IMenuStates>{
  componentWillMount(){
    this.state = {
      colorOptionsShown : false,
      symbolOptionsShown : false,
      activeLayerName : this.props.layers[0].layerName,
      activeLayerHeaders : this.props.layers[0].headers,
      currentOptions : this.props.originalOptions,
    };
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
    this.setState({
      colorOptionsShown : false,
      symbolOptionsShown: false,
      activeLayerName : val.label
    });
  }
  refreshColorOptions(options: IColorOptions){
    let opt: IVisualizationOptions = this.state.currentOptions;
    if (!opt.layerName){
      opt.layerName = this.state.activeLayerName;
    }
    opt.colorOptions = options;
    this.setState({
      colorOptionsShown : true,
      symbolOptionsShown: false,
      currentOptions : opt,
    });
    this.refreshMap();
  }

  refreshMap(){
    this.props.refreshMap(this.state.currentOptions);
  }
  render(){
    let layers = [];
    for(let i = 0; i<this.props.layers.length; i++){
      let val = this.props.layers[i];
      layers[i]={value:val, label: val.layerName };
      }
    let Menu = require('impromptu-react-sidemenu');
    return (
      <Menu.Menu showDividers={true}>

        <Menu.Brand>
          Options
        </Menu.Brand>

        <Select options={layers} onChange = {this.activeLayerChanged.bind(this)} value = {this.state.activeLayerName}/>

        <Menu.Item>
          <p className="fa fa-paint-brush" onClick = {this.handleSelection.bind(this, 0)}> Colors </p>
          {this.state.colorOptionsShown ? <ColorMenu headers = {this.state.activeLayerHeaders} saveValues = {this.refreshColorOptions.bind(this)}/> : null }
        </Menu.Item>
        <Menu.Item >
        <p className="fa fa-circle-o" onClick = {this.handleSelection.bind(this, 1)}> Symbols </p>
        </Menu.Item>

      </Menu.Menu>
    );
  }
}
