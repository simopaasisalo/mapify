import * as React from 'react';
import {LayerMenu} from './LayerMenu';
import {ColorMenu} from './ColorMenu';
import {SymbolMenu} from './SymbolMenu';
import {FilterMenu} from './FilterMenu';
import {LegendMenu} from './LegendMenu';
import {PopUpMenu} from './PopUpMenu';
import {ExportMenu} from './ExportMenu';
import {LayerTypes, SymbolTypes} from '../common_items/common';

let Select = require('react-select');
let Menu = require('impromptu-react-sidemenu');

export class MapifyMenu extends React.Component<IMenuProps, IMenuStates>{
    componentWillMount() {
        this.state = {
            visibleOptions: 0,
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
            this.state.visibleOptions !== nextState.visibleOptions ||
            this.state.activeLayer !== nextState.activeLayer;
    }

    componentWillUpdate(nextProps: IMenuProps, nextState: IMenuStates) {
        if (nextProps.layers.length === 0) {
            this.setState({
                activeLayer: null,
            })
        }
    }

    changeActiveMenu(item) {
        if (this.state.visibleOptions === item) {
            this.setState({
                visibleOptions: 0
            });
        }
        else {
            this.setState({
                visibleOptions: item
            });
        }

    }
    activeLayerChanged(val: { label: string, value: ILayerData }) {
        this.setState({
            visibleOptions: 0,
            activeLayer: val.value,
        });

    }

    deleteLayer(id: number) {
        this.props.deleteLayer(id);
    }
    addNewLayer() {
        this.setState({
            visibleOptions: 0,

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
    saveImage(options: IExportMenuStates) {
        this.props.saveImage(options);
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
                        onClick = {this.changeActiveMenu.bind(this, 1) }
                        style={{ backgroundColor: this.state.visibleOptions === 1 ? '#1a263f' : '#293c60' }}> Layers </p>
                    <LayerMenu
                        isVisible = {this.state.visibleOptions === 1}
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
                {this.state.activeLayer && this.state.activeLayer.layerType !== LayerTypes.HeatMap ?
                    <Menu.Item>
                        <p
                            className="menuHeader fa fa-paint-brush"
                            onClick = {this.changeActiveMenu.bind(this, 2) }
                            style={{ backgroundColor: this.state.visibleOptions === 2 ? '#1a263f' : '#293c60' }}> Colors </p>
                        <ColorMenu
                            headers = {this.state.activeLayer ? this.state.activeLayer.headers.filter(function(val) { return val.type === 'number' }) : []}
                            saveValues = {this.refreshColorOptions.bind(this) }
                            isVisible = {this.state.visibleOptions === 2}
                            prevOptions = {this.state.activeLayer ? this.state.activeLayer.visOptions.colorOptions : null}
                            isChoropleth = {this.state.activeLayer ? this.state.activeLayer.layerType === LayerTypes.ChoroplethMap : false}
                            />
                    </Menu.Item>
                    : <div/>
                }
                {this.state.activeLayer && this.state.activeLayer.layerType !== LayerTypes.ChoroplethMap && this.state.activeLayer.layerType !== LayerTypes.HeatMap ?
                    <Menu.Item >
                        <p
                            className="menuHeader fa fa-map-marker"
                            onClick = {this.changeActiveMenu.bind(this, 3) }
                            style={{ backgroundColor: this.state.visibleOptions === 3 ? '#1a263f' : '#293c60' }}> Symbols </p>
                        <SymbolMenu
                            headers = {this.state.activeLayer ? this.state.activeLayer.headers.filter(function(val) { return val.type === 'number' }) : []}
                            saveValues = {this.refreshSymbolOptions.bind(this) }
                            isVisible = {this.state.visibleOptions === 3}
                            prevOptions = {this.state.activeLayer ? this.state.activeLayer.visOptions.symbolOptions : null}
                            />
                    </Menu.Item>
                    : <div/>
                }
                < Menu.Item >
                    <p
                        className="menuHeader fa fa-sliders"
                        onClick = {this.changeActiveMenu.bind(this, 4) }
                        style={{ backgroundColor: this.state.visibleOptions === 4 ? '#1a263f' : '#293c60' }}> Filters </p>

                    <FilterMenu
                        headers = {this.state.activeLayer ? this.state.activeLayer.headers.filter(function(val) { return val.type === 'number' }) : []}
                        addFilterToMap = {this.addFilterToMap.bind(this) }
                        isVisible = {this.state.visibleOptions === 4}/>
                </Menu.Item>
                <Menu.Item>
                    <p
                        className="menuHeader fa fa-map-o"
                        onClick = {this.changeActiveMenu.bind(this, 5) }
                        style={{ backgroundColor: this.state.visibleOptions === 5 ? '#1a263f' : '#293c60' }}> Legend </p>
                    <LegendMenu
                        valuesChanged={this.legendStatusChanged.bind(this) }
                        isVisible = {this.state.visibleOptions === 5}/>


                </Menu.Item >
                {this.state.activeLayer && this.state.activeLayer.layerType !== LayerTypes.HeatMap ?

                    <Menu.Item>
                        <p
                            className="menuHeader fa fa-newspaper-o"
                            onClick = {this.changeActiveMenu.bind(this, 6) }
                            style={{ backgroundColor: this.state.visibleOptions === 6 ? '#1a263f' : '#293c60' }}> Pop-ups </p>
                        <PopUpMenu
                            headers = {this.state.activeLayer ? this.state.activeLayer.headers : []}
                            saveSelection = {this.changePopUpHeaders.bind(this) }
                            isVisible = {this.state.visibleOptions === 6}/>
                    </Menu.Item>
                    : <div/>
                }
                <Menu.Item>
                    <p
                        className="menuHeader fa fa-newspaper-o"
                        onClick = {this.changeActiveMenu.bind(this, 7) }
                        style={{ backgroundColor: this.state.visibleOptions === 7 ? '#1a263f' : '#293c60' }}> Export map </p>
                    <ExportMenu
                        isVisible = {this.state.visibleOptions === 7}
                        saveImage = {this.saveImage.bind(this) }
                        />
                </Menu.Item>
            </Menu.Menu >
        );
    }
}
