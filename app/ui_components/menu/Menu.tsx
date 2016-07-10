import * as React from 'react';
import {LayerMenu} from './LayerMenu';
import {ColorMenu} from './ColorMenu';
import {SymbolMenu} from './SymbolMenu';
import {FilterMenu} from './FilterMenu';
import {LegendMenu} from './LegendMenu';
import {PopUpMenu} from './PopUpMenu';
import {ExportMenu} from './ExportMenu';
import {LayerTypes, SymbolTypes} from '../common_items/common';
import {AppState, Layer, ColorOptions, SymbolOptions} from '../Stores';
import {observer} from 'mobx-react';

let Select = require('react-select');
let Menu = require('impromptu-react-sidemenu');

@observer
export class MapifyMenu extends React.Component<{
    /** Application state*/
    state: AppState,
    /** Update the selected layer with new options*/
    refreshMap: (options: Layer) => void,
    /** Reorder the layers on the map*/
    changeLayerOrder: (order: number[]) => void,
    /** Add a new layer (by opening import wizard)*/
    addLayer: () => void,
    /** Remove a layer from the map*/
    deleteLayer: (id: number) => void,
    /** Create a new filter or replace an existing one. Returns id*/
    saveFilter: (info: IFilter) => number,
    /** Remove a filter from the map */
    deleteFilter: (id: number) => void,
    /** Update the map legend*/
    legendStatusChanged: (info: ILegend) => void,
    /** Export map as .png */
    saveImage: () => void,
    /** Export map as .mapify*/
    saveFile: () => void,
}, {}>{
    componentWillMount() {
        this.props.state.visibleMenu = 0;
        this.props.state.editingLayer = this.props.state.layers ? this.props.state.layers[this.props.state.layers.length - 1] : null;
    }
    // componentWillReceiveProps(nextProps: IMenuProps) {
    //     this.setState({
    //         selectedLayer: this.props.state.selectedLayer ? this.props.state.selectedLayer : nextProps.layers ? nextProps.layers[0] : null
    //     });
    // }
    // shouldComponentUpdate(nextProps: IMenuProps, nextState: IMenuStates) {
    //     return this.props.layers !== nextProps.layers ||
    //         this.props.visible !== nextProps.visible ||
    //         this.props.state.visibleMenu !== nextState.visibleMenu ||
    //         this.props.state.selectedLayer !== nextState.selectedLayer;
    // }
    //
    // componentWillUpdate(nextProps: IMenuProps, nextState: IMenuStates) {
    //     if (nextProps.layers.length === 0) {
    //         this.setState({
    //             selectedLayer: null,
    //         })
    //     }
    // }

    onActiveMenuChange = (item: number) => {
        this.props.state.visibleMenu = this.props.state.visibleMenu === item ? 0 : item;
    }
    onLayerSelectionChange = (val: { label: string, value: Layer }) => {
        this.props.state.visibleMenu = 0;
        this.props.state.editingLayer = val.value;
    }

    deleteLayer = (id: number) => {
        this.props.deleteLayer(id);
    }
    addNewLayer = () => {
        this.props.state.editingLayer = null;
        this.props.state.visibleMenu = 0;
        this.props.addLayer();
    }
    refreshColorOptions = (options: ColorOptions) => {

        this.props.state.editingLayer.visOptions.colorOptions = options;;

        this.refreshMap();
    }
    refreshSymbolOptions = () => {
        this.refreshMap();
    }
    refreshMap = () => {
        this.props.refreshMap(this.props.state.editingLayer);
    }
    onLayerOrderChange = (order: number[]) => {
        this.props.changeLayerOrder(order);
    }
    showLayerNameOnMenu = (option) => {

        return option ? option.layerName : '';
    }

    addFilterToMap = (info: IFilter) => {
        return this.props.saveFilter(info);
    }

    deleteFilter = (id: number) => {
        this.props.deleteFilter(id);
    }

    onLegendStatusChange = (info: ILegend) => {
        this.props.legendStatusChanged(info);
    }

    changePopUpHeaders = () => {
        let lyr: Layer = this.props.state.editingLayer;
        let headers = this.props.state.editingLayer.popupHeaders;
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
            selectedLayer: lyr
        })
        this.refreshMap();
    }
    saveImage = () => {
        this.props.saveImage();
    }
    saveFile = () => {
        this.props.saveFile();
    }

    render() {
        let layers = [];
        if (this.props.state.layers) {
            for (let layer of this.props.state.layers) {
                layers.push({ value: layer, label: layer.layerName });
            }
        }

        return (!this.props.state.menuShown ? null :
            <Menu.Menu showDividers={true}>

                <Menu.Brand>
                    Options
                </Menu.Brand>
                <Menu.Item style={{ backgroundColor: this.props.state.visibleMenu === 1 ? '#1a263f' : '#293c60' }}>
                    <p
                        className="menuHeader fa fa-bars"
                        onClick = {this.onActiveMenuChange.bind(this, 1) }
                        > Layers </p>
                    <LayerMenu
                        state={this.props.state}
                        saveOrder={this.onLayerOrderChange }
                        addNewLayer = {this.addNewLayer }
                        deleteLayer = {this.deleteLayer }
                        />

                </Menu.Item>
                <Select
                    options={layers}
                    onChange = {this.onLayerSelectionChange }
                    value = {this.props.state.editingLayer}
                    valueRenderer = {this.showLayerNameOnMenu}
                    clearable={false}
                    />
                {this.props.state.editingLayer && this.props.state.editingLayer.layerType !== LayerTypes.HeatMap ?
                    <Menu.Item>
                        <p
                            className="menuHeader fa fa-paint-brush"
                            onClick = {this.onActiveMenuChange.bind(this, 2) }
                            style={{ backgroundColor: this.props.state.visibleMenu === 2 ? '#1a263f' : '#293c60' }}> Colors </p>
                        <ColorMenu
                            state = {this.props.state}
                            saveValues = {this.refreshColorOptions }
                            visible = {this.props.state.visibleMenu === 2}
                            />
                    </Menu.Item>
                    : <div/>
                }
                {this.props.state.editingLayer && this.props.state.editingLayer.layerType !== LayerTypes.ChoroplethMap && this.props.state.editingLayer.layerType !== LayerTypes.HeatMap ?
                    <Menu.Item >
                        <p
                            className="menuHeader fa fa-map-marker"
                            onClick = {this.onActiveMenuChange.bind(this, 3) }
                            style={{ backgroundColor: this.props.state.visibleMenu === 3 ? '#1a263f' : '#293c60' }}> Symbols </p>
                        <SymbolMenu
                            state = {this.props.state}
                            saveValues = {this.refreshSymbolOptions }

                            />
                    </Menu.Item>
                    : <div/>
                }
                < Menu.Item >
                    <p
                        className="menuHeader fa fa-sliders"
                        onClick = {this.onActiveMenuChange.bind(this, 4) }
                        style={{ backgroundColor: this.props.state.visibleMenu === 4 ? '#1a263f' : '#293c60' }}> Filters </p>

                    <FilterMenu
                        state={this.props.state}
                        addFilterToMap = {this.addFilterToMap }
                        deleteFilter={this.deleteFilter }
                        />
                </Menu.Item>
                <Menu.Item>
                    <p
                        className="menuHeader fa fa-map-o"
                        onClick = {this.onActiveMenuChange.bind(this, 5) }
                        style={{ backgroundColor: this.props.state.visibleMenu === 5 ? '#1a263f' : '#293c60' }}> Legend </p>
                    <LegendMenu
                        state = {this.props.state}
                        valuesChanged={this.onLegendStatusChange }
                        />

                </Menu.Item >
                {this.props.state.editingLayer && this.props.state.editingLayer.layerType !== LayerTypes.HeatMap ?

                    <Menu.Item>
                        <p
                            className="menuHeader fa fa-newspaper-o"
                            onClick = {this.onActiveMenuChange.bind(this, 6) }
                            style={{ backgroundColor: this.props.state.visibleMenu === 6 ? '#1a263f' : '#293c60' }}> Pop-ups </p>
                        <PopUpMenu
                            state = {this.props.state}
                            saveSelection = {this.changePopUpHeaders}
                            />
                    </Menu.Item>
                    : <div/>
                }
                <Menu.Item>
                    <p
                        className="menuHeader fa fa-download"
                        onClick = {this.onActiveMenuChange.bind(this, 7) }
                        style={{ backgroundColor: this.props.state.visibleMenu === 7 ? '#1a263f' : '#293c60' }}> Export map </p>
                    <ExportMenu
                        state={this.props.state}
                        saveImage = {this.saveImage }
                        saveFile = {this.saveFile }
                        />
                </Menu.Item>
            </Menu.Menu >
        );
    }
}
