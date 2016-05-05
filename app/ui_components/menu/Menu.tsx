import * as React from 'react';
import {LayerMenu} from './LayerMenu';
import {ColorMenu} from './ColorMenu';
import {SymbolMenu} from './SymbolMenu';
import {FilterMenu} from './FilterMenu';
import {LegendMenu} from './LegendMenu';
import {PopUpMenu} from './PopUpMenu';
import {LayerTypes, SymbolTypes} from '../common_items/common';

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
            popupOptionsShown: false,
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
            this.state.popupOptionsShown !== nextState.popupOptionsShown ||
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

    changeActiveMenu(item) {
        switch (item) {
            case 0:
                this.setState({
                    layerOptionsShown: !this.state.layerOptionsShown,
                    colorOptionsShown: false,
                    symbolOptionsShown: false,
                    filterOptionsShown: false,
                    legendOptionsShown: false,
                    popupOptionsShown: false,
                });
                break;
            case 1:
                this.setState({
                    layerOptionsShown: false,
                    colorOptionsShown: !this.state.colorOptionsShown,
                    symbolOptionsShown: false,
                    filterOptionsShown: false,
                    legendOptionsShown: false,
                    popupOptionsShown: false,
                });
                break;
            case 2:
                this.setState({
                    layerOptionsShown: false,
                    colorOptionsShown: false,
                    symbolOptionsShown: !this.state.symbolOptionsShown,
                    filterOptionsShown: false,
                    legendOptionsShown: false,
                    popupOptionsShown: false,
                });
                break;
            case 3:
                this.setState({
                    layerOptionsShown: false,
                    colorOptionsShown: false,
                    symbolOptionsShown: false,
                    filterOptionsShown: !this.state.filterOptionsShown,
                    legendOptionsShown: false,
                    popupOptionsShown: false,
                });
                break;
            case 4:
                this.setState({
                    layerOptionsShown: false,
                    colorOptionsShown: false,
                    symbolOptionsShown: false,
                    filterOptionsShown: false,
                    legendOptionsShown: !this.state.legendOptionsShown,
                    popupOptionsShown: false,
                });
                break;
            case 5:
                this.setState({
                    layerOptionsShown: false,
                    colorOptionsShown: false,
                    symbolOptionsShown: false,
                    filterOptionsShown: false,
                    legendOptionsShown: false,
                    popupOptionsShown: !this.state.popupOptionsShown,
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

    changePopUpHeaders(headers: IHeader[]) {
        let lyr: ILayerData = this.state.activeLayer;
        lyr.visOptions.onEachFeature = addPopupsToLayer;

        function addPopupsToLayer(feature, layer: L.GeoJSON) {
            var popupContent = '';
            for (var prop in feature.properties) {
                let index = headers.map(function(h) { return h.label; }).indexOf(prop);
                if (index != -1) {
                    popupContent += prop + ": " + feature.properties[prop];
                    popupContent += "<br />";
                }
            }
            if (popupContent != '')
                layer.bindPopup(popupContent);
        }
        this.setState({
            activeLayer: lyr
        })
        this.refreshMap();
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
                <Menu.Item>
                    <p
                        className="menuHeader fa fa-bars"
                        onClick = {this.changeActiveMenu.bind(this, 0) }
                        style={{ backgroundColor: this.state.layerOptionsShown ? '#1a263f' : '#293c60' }}> Layers </p>
                    <LayerMenu
                        isVisible = {this.state.layerOptionsShown}
                        layers={this.props.layers}
                        saveOrder={this.layerOrderChanged.bind(this) }
                        addNewLayer = {this.addNewLayer.bind(this) }
                        deleteLayer = {this.deleteLayer.bind(this) }
                        />

                </Menu.Item>
                <Select
                    options={layers}
                    onChange = {this.activeLayerChanged.bind(this) }
                    value = {this.state.activeLayer}
                    valueRenderer = {this.showLayerNameOnMenu}
                    clearable={false}
                    />

                <Menu.Item>
                    <p
                        className="menuHeader fa fa-paint-brush"
                        onClick = {this.changeActiveMenu.bind(this, 1) }
                        style={{ backgroundColor: this.state.colorOptionsShown ? '#1a263f' : '#293c60' }}> Colors </p>
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
                        <p
                            className="menuHeader fa fa-map-marker"
                            onClick = {this.changeActiveMenu.bind(this, 2) }
                            style={{ backgroundColor: this.state.symbolOptionsShown ? '#1a263f' : '#293c60' }}> Symbols </p>
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
                    <p
                        className="menuHeader fa fa-sliders"
                        onClick = {this.changeActiveMenu.bind(this, 3) }
                        style={{ backgroundColor: this.state.filterOptionsShown ? '#1a263f' : '#293c60' }}> Filters </p>

                    <FilterMenu
                        headers = {this.state.activeLayer ? this.state.activeLayer.headers.filter(function(val) { return val.type === 'number' }) : []}
                        addFilterToMap = {this.addFilterToMap.bind(this) }
                        isVisible = {this.state.filterOptionsShown}/>
                </Menu.Item>
                <Menu.Item>
                    <p
                        className="menuHeader fa fa-map-o"
                        onClick = {this.changeActiveMenu.bind(this, 4) }
                        style={{ backgroundColor: this.state.legendOptionsShown ? '#1a263f' : '#293c60' }}> Legend </p>
                    <LegendMenu
                        valuesChanged={this.legendStatusChanged.bind(this) }
                        isVisible = {this.state.legendOptionsShown}/>


                </Menu.Item >
                <Menu.Item>
                    <p
                        className="menuHeader fa fa-newspaper-o"
                        onClick = {this.changeActiveMenu.bind(this, 5) }
                        style={{ backgroundColor: this.state.popupOptionsShown ? '#1a263f' : '#293c60' }}> Pop-ups </p>
                    <PopUpMenu
                        headers = {this.state.activeLayer ? this.state.activeLayer.headers : []}
                        saveSelection = {this.changePopUpHeaders.bind(this) }
                        isVisible = {this.state.popupOptionsShown}/>
                </Menu.Item>


            </Menu.Menu >
        );
    }
}
