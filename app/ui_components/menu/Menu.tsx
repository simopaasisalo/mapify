import * as React from 'react';
import {LayerMenu} from './LayerMenu';
import {ColorMenu} from './ColorMenu';
import {SymbolMenu} from './SymbolMenu';
import {FilterMenu} from './FilterMenu';
import {LegendMenu} from './LegendMenu';
import {LayerTypes} from '../common_items/common';

let Select = require('react-select');
let Menu = require('impromptu-react-sidemenu');

export class MapifyMenu extends React.Component<IMenuProps, IMenuStates>{
    componentWillMount() {
        this.state = {
            colorOptionsShown: false,
            symbolOptionsShown: false,
            layerOptionsShown: false,
            filterOptionsShown: false,
            legendOptionsShown: false,
            activeLayer: this.props.layers ? this.props.layers[0] : null,
        };
    }
    componentWillReceiveProps(nextProps: IMenuProps) {
        this.setState({
            activeLayer: this.state.activeLayer ? this.state.activeLayer : nextProps.layers ? nextProps.layers[0] : null
        });
    }
    shouldComponentUpdate(nextProps: IMenuProps, nextState: IMenuStates) {

        return this.props.layers !== nextProps.layers ||
            this.props.visible !== nextProps.visible ||
            this.state.colorOptionsShown !== nextState.colorOptionsShown ||
            this.state.symbolOptionsShown !== nextState.symbolOptionsShown ||
            this.state.layerOptionsShown !== nextState.layerOptionsShown ||
            this.state.filterOptionsShown !== nextState.filterOptionsShown ||
            this.state.legendOptionsShown !== nextState.legendOptionsShown ||
            this.state.activeLayer !== nextState.activeLayer;
    }

    componentWillUpdate(nextProps: IMenuProps, nextState: IMenuStates) {
        if (nextProps.layers.length === 0) {
            this.setState({
                colorOptionsShown: false,
                symbolOptionsShown: false,
                activeLayer: null,
            })
        }
    }

    handleSelection(item) {

        switch (item) {
            case 0:
                this.setState({
                    layerOptionsShown: !this.state.layerOptionsShown,
                    colorOptionsShown: false,
                    symbolOptionsShown: false,
                    filterOptionsShown: false,
                    legendOptionsShown: false,
                });
                break;
            case 1:
                this.setState({
                    layerOptionsShown: false,
                    colorOptionsShown: !this.state.colorOptionsShown,
                    symbolOptionsShown: false,
                    filterOptionsShown: false,
                    legendOptionsShown: false,
                });
                break;
            case 2:
                this.setState({
                    layerOptionsShown: false,
                    colorOptionsShown: false,
                    symbolOptionsShown: !this.state.symbolOptionsShown,
                    filterOptionsShown: false,
                    legendOptionsShown: false,
                });
                break;
            case 3:
                this.setState({
                    layerOptionsShown: false,
                    colorOptionsShown: false,
                    symbolOptionsShown: false,
                    filterOptionsShown: !this.state.filterOptionsShown,
                    legendOptionsShown: false,
                });
                break;
            case 4:
                this.setState({
                    layerOptionsShown: false,
                    colorOptionsShown: false,
                    symbolOptionsShown: false,
                    filterOptionsShown: false,
                    legendOptionsShown: !this.state.legendOptionsShown
                });
                break;
        }

    }
    activeLayerChanged(val: { label: string, value: ILayerData }) {
        this.setState({
            colorOptionsShown: false,
            symbolOptionsShown: false,
            layerOptionsShown: false,
            activeLayer: val.value,
        });

    }


    deleteLayer(id: number) {
        this.props.deleteLayer(id);
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
        lyr.visOptions.pointToLayer = (function(feature, latlng: L.LatLng) {
            return L.circleMarker(latlng, options)
        });
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
    layerOrderChanged(order: number[]) {
        this.props.changeLayerOrder(order);
    }
    showLayerNameOnMenu(option) {

        return option ? option.layerName : '';
    }

    addFilterToMap(info: IFilter) {
        info.layerData = this.state.activeLayer;
        this.props.createFilter(info);
    }

    legendStatusChanged(info: ILegend) {
        this.props.legendStatusChanged(info);
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
                <Menu.Item>
                    <p className="fa fa-map" onClick = {this.handleSelection.bind(this, 0) }>Layers </p>
                    <LayerMenu
                        isVisible = {this.state.layerOptionsShown}
                        layers={this.props.layers}
                        saveOrder={this.layerOrderChanged.bind(this) }
                        addNewLayer = {this.addNewLayer.bind(this) }
                        deleteLayer = {this.deleteLayer.bind(this) }
                        />

                </Menu.Item>
                <Menu.Item>
                    <p className="fa fa-paint-brush" onClick = {this.handleSelection.bind(this, 1) }> Colors </p>
                    <ColorMenu
                        headers = {this.state.activeLayer ? this.state.activeLayer.headers.filter(function(val) { return val.type === 'number' }) : []}
                        saveValues = {this.refreshColorOptions.bind(this) }
                        isVisible = {this.state.colorOptionsShown}
                        prevOptions = {this.state.activeLayer ? this.state.activeLayer.visOptions.colorOptions : null}
                        isChoropleth = {this.state.activeLayer ? this.state.activeLayer.layerType === LayerTypes.ChoroplethMap : false}
                        />
                </Menu.Item>
                {this.state.activeLayer && this.state.activeLayer.layerType != LayerTypes.ChoroplethMap ?
                    <Menu.Item >
                        <p className="fa fa-map-marker" onClick = {this.handleSelection.bind(this, 2) }> Symbols </p>
                        <SymbolMenu
                            headers = {this.state.activeLayer ? this.state.activeLayer.headers.filter(function(val) { return val.type === 'number' }) : []}
                            saveValues = {this.refreshSymbolOptions.bind(this) }
                            isVisible = {this.state.symbolOptionsShown}
                            prevOptions = {this.state.activeLayer ? this.state.activeLayer.visOptions.symbolOptions : null}
                            />
                    </Menu.Item>
                    : <div/>
                }
                <Menu.Item>
                    <p className="fa " onClick = {this.handleSelection.bind(this, 3) }> Filters </p>

                    <FilterMenu
                        headers = {this.state.activeLayer ? this.state.activeLayer.headers.filter(function(val) { return val.type === 'number' }) : []}
                        addFilterToMap = {this.addFilterToMap.bind(this) }
                        isVisible = {this.state.filterOptionsShown}/>
                </Menu.Item>
                <Menu.Item>
                    <p className="fa " onClick = {this.handleSelection.bind(this, 4) }> Legend </p>
                    <LegendMenu
                        valuesChanged={this.legendStatusChanged.bind(this) }
                        isVisible = {this.state.legendOptionsShown}/>


                </Menu.Item >


            </Menu.Menu >
        );
    }
}
