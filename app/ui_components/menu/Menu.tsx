import * as React from 'react';
import {ColorMenu} from './ColorMenu';
import {SymbolMenu} from './SymbolMenu';
import {LayerTypes} from '../common_items/common';

let Select = require('react-select');
let Menu = require('impromptu-react-sidemenu');
let _currentOptions: IVisualizationOptions;

export class MapifyMenu extends React.Component<IMenuProps, IMenuStates>{
    componentWillMount() {
        this.state = {
            colorOptionsShown: false,
            symbolOptionsShown: false,
            activeLayer: this.props.layers ? this.props.layers[0] : null,
        };
        _currentOptions = this.props.originalOptions;
        _currentOptions.layerName = this.state.activeLayer ? this.state.activeLayer.layerName : '';
    }
    handleSelection(item) {

        switch (item) {
            case 0:
                this.setState({
                    colorOptionsShown: !this.state.colorOptionsShown,
                    symbolOptionsShown: false,
                });
                break;
            case 1:
                this.setState({
                    colorOptionsShown: false,
                    symbolOptionsShown: !this.state.symbolOptionsShown,
                });
                break;
        }
    }
    activeLayerChanged(val: { label: string, value: ILayerData }) {
        _currentOptions.layerName = val.label;
        this.setState({
            colorOptionsShown: false,
            symbolOptionsShown: false,
            activeLayer: val.value,
        });

    }
    deleteLayer(e: Event) {
        e.preventDefault();
        console.log(e);
    }
    addNewLayer() {
        this.setState({
            colorOptionsShown: false,
            symbolOptionsShown: false,
        });
        this.props.addLayer();
    }
    refreshColorOptions(options: IColorOptions) {

        _currentOptions.colorOptions = options;
        this.refreshMap();
    }
    refreshSymbolOptions(options: ISymbolOptions) {
        _currentOptions.symbolOptions = options;
        this.refreshMap();
    }
    refreshMap() {
        this.props.refreshMap(_currentOptions);
    }
    showLayerNameOnMenu(option) {

        return option ? option.layerName : '';
    }
    renderOption(option) {
        return <span>{option ? option.layerName : ''}<button onClick={this.deleteLayer}>d </button></span>;
    }

    render() {
        let layers = [];
        if (this.props.layers) {
            for (let layer of this.props.layers) {
                layers.push({ value: layer, label: layer.layerName });
            }
        }
        return (
            <Menu.Menu showDividers={true}>

                <Menu.Brand>
                    Options
                </Menu.Brand>

                <Select
                    options={layers}
                    onChange = {this.activeLayerChanged.bind(this) }
                    value = {this.state.activeLayer}
                    valueRenderer = {this.showLayerNameOnMenu}
                    clearable={false}
                    />
                <button onClick={this.addNewLayer.bind(this) }>Add new layer</button>
                <Menu.Item>
                    <p className="fa fa-paint-brush" onClick = {this.handleSelection.bind(this, 0) }> Colors </p>
                    <ColorMenu
                        headers = {this.state.activeLayer ? this.state.activeLayer.headers : []}
                        saveValues = {this.refreshColorOptions.bind(this) }
                        isVisible = {this.state.colorOptionsShown}
                        />
                </Menu.Item>
                {this.state.activeLayer && this.state.activeLayer.layerType != LayerTypes.ChoroplethMap ?
                    <Menu.Item >
                        <p className="fa fa-circle-o" onClick = {this.handleSelection.bind(this, 1) }> Symbols </p>
                        <SymbolMenu
                            headers = {this.state.activeLayer ? this.state.activeLayer.headers : []}
                            saveValues = {this.refreshSymbolOptions.bind(this) }
                            isVisible = {this.state.symbolOptionsShown}
                            />
                    </Menu.Item>
                    : <div/>
                }


            </Menu.Menu>
        );
    }
}
