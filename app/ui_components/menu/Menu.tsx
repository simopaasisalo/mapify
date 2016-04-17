import * as React from 'react';
import {ColorMenu} from './ColorMenu';
import {SymbolMenu} from './SymbolMenu';
import {LayerTypes} from '../common_items/common';

let Select = require('react-select');
let Menu = require('impromptu-react-sidemenu');

export class MapifyMenu extends React.Component<IMenuProps, IMenuStates>{
    componentWillMount() {
        this.state = {
            colorOptionsShown: false,
            symbolOptionsShown: false,
            activeLayer: this.props.layers ? this.props.layers[0] : null,
        };
    }
    shouldComponentUpdate(nextProps: IMenuProps, nextState: IMenuStates) {
        return this.props.layers !== nextProps.layers ||
            this.props.visible !== nextProps.visible ||
            this.state.colorOptionsShown !== nextState.colorOptionsShown ||
            this.state.symbolOptionsShown !== nextState.symbolOptionsShown ||
            this.state.activeLayer !== nextState.activeLayer;
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
        this.setState({
            colorOptionsShown: false,
            symbolOptionsShown: false,
            activeLayer: val.value,
        });

    }
    componentWillReceiveProps(nextProps: IMenuProps) {
        this.setState({
            activeLayer: this.state.activeLayer ? this.state.activeLayer : nextProps.layers ? nextProps.layers[0] : null
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
        let lyr: ILayerData = this.state.activeLayer;
        lyr.visOptions.colorOptions = options;

        this.setState({
            activeLayer: lyr
        })
        this.refreshMap();
    }
    refreshSymbolOptions(options: ISymbolOptions) {
        let lyr: ILayerData = this.state.activeLayer;
        lyr.visOptions.symbolOptions = options;

        this.setState({
            activeLayer: lyr
        })
        this.refreshMap();
    }
    refreshMap() {
        this.props.refreshMap(this.state.activeLayer);
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
        return (!this.props.visible ? null :
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
                        prevOptions = {this.state.activeLayer ? this.state.activeLayer.visOptions.colorOptions : null}
                        />
                </Menu.Item>
                {this.state.activeLayer && this.state.activeLayer.layerType != LayerTypes.ChoroplethMap ?
                    <Menu.Item >
                        <p className="fa fa-circle-o" onClick = {this.handleSelection.bind(this, 1) }> Symbols </p>
                        <SymbolMenu
                            headers = {this.state.activeLayer ? this.state.activeLayer.headers : []}
                            saveValues = {this.refreshSymbolOptions.bind(this) }
                            isVisible = {this.state.symbolOptionsShown}
                            prevOptions = {this.state.activeLayer ? this.state.activeLayer.visOptions.symbolOptions : null}

                            />
                    </Menu.Item>
                    : <div/>
                }


            </Menu.Menu>
        );
    }
}
