declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observer} from 'mobx-react';

import {AppState, ImportWizardState, SaveState} from './Stores/States';
import {Layer, ColorOptions, SymbolOptions} from './Stores/Layer';
import {LayerImportWizard} from './import_wizard/LayerImportWizard';
import {MapifyMenu} from './menu/Menu';
import {MapInitModel} from '../models/MapInitModel';
import {LayerTypes, SymbolTypes, GetSymbolSize} from './common_items/common';
import {Filter} from './misc/Filter';
import {Legend} from './misc/Legend';
import {WelcomeScreen} from './misc/WelcomeScreen';
import 'leaflet';
import 'Leaflet.extra-markers';
let Modal = require('react-modal');
let d3 = require('d3');
let chroma = require('chroma-js');
let heat = require('leaflet.heat');
let domToImage = require('dom-to-image');
let topojson = require('topojson');
let reactDOMServer = require('react-dom/server');
let _mapInitModel = new MapInitModel();
let _currentLayerId: number = 0;


L.Icon.Default.imagePath = 'app/images/leaflet-images';
@observer
export class MapMain extends React.Component<{ state: AppState }, {}>{

    componentDidMount() {
        _mapInitModel.InitCustomProjections();
        this.initMap();
    }

    /**
     * initMap - Initializes the map with basic options
     *
     * @return {void}
     */
    initMap() {
        let baseLayers: any = _mapInitModel.InitBaseMaps();
        this.props.state.map = L.map('map', {
            layers: baseLayers,

        }).setView([0, 0], 2);
        this.props.state.map.doubleClickZoom.disable();

    }
    startLayerImport() {
        this.props.state.importWizardShown = true;
        this.props.state.welcomeShown = false;
    }

    cancelLayerImport() {
        this.props.state.importWizardShown = false;
        this.props.state.menuShown = true;
    }

    /**
     * layerImportSubmit - Layer importing was completed -> draw to map
     *
     * @param  {ILayerData} layerData contains layer name and GeoJSON object
     */
    layerImportSubmit(layerData: Layer) {
        layerData.map = this.props.state.map;
        layerData.id = _currentLayerId++;
        this.props.state.layers.push(layerData);
        this.props.state.importWizardShown = false;
        this.props.state.editingLayer = layerData;
        this.props.state.menuShown = true;
    }


    /**
     * changeLayerOrder - Redraws the layers in the order given
     *
     * @param   order   the array of layer ids
     */
    changeLayerOrder(order: number[]) {
        for (let i of order) {
            let layer = this.getLayerInfoById(i);
            if (layer.layer) {
                (layer.layer as any).bringToFront();
            }
        }
    }

    getLayerInfoById(id: number) {
        for (let lyr of this.props.state.layers) {
            if (lyr.id == id) {
                return lyr;
            }
        }
    }
    /**
     * reloadLayer - Update the layer on the map after the user has changed the visualization options
     * @param  layerData  The layer to update
     * @param  wasImported  Was layer imported from a previously saved map
     */
    reloadLayer(layer: Layer, wasImported: boolean = false) {
    }



    /**
     * addNewLayer - Opens the import wizard for  a new layer
     *
     */
    addNewLayer() {
        this.props.state.importWizardShown = true;
        this.props.state.menuShown = false;
    }

    /**
     * deleteLayer - Removes a layer from the map and layer list
     *
     * @param  id   The unique id of the LayerInfo to remove
     */
    deleteLayer(id: number) {
        let layerInfo = this.getLayerInfoById(id);
        if (layerInfo) {
            this.props.state.layers = this.props.state.layers.filter((lyr) => { return lyr.id != id });
            this.props.state.map.removeLayer(layerInfo.layer);
        }

    }

    /**
     * saveFilter - Creates a new filter or updates an existing one
     *
     * @param  layerUpdate   Was the update triggered by layer refresh? If so, do not reset filter
     */
    saveFilter(layerUpdate: boolean = false) {
        let filter = this.props.state.editingFilter;
        let layerData = this.props.state.layers.filter((lyr) => { return lyr.id === filter.layerId })[0];
        // if (layerData.symbolOptions.symbolType === SymbolTypes.Chart || layerData.symbolOptions.symbolType === SymbolTypes.Icon)
        //     info.remove = true; //force removal if type requires it
        // let id;
        // if (info.id != -1) { //existing filter being updated
        //     id = info.id;
        //     this.props.state.filters = this.props.state.filters.filter((f) => { return f.id !== id });
        // }
        // else {
        //     id = _currentFilterId++;
        // }
        filter.filterValues = {};
        // if (info.id !== -1 && !layerUpdate) {
        //
        //     this.filterLayer(filter.id, filter.currentMin, filter.currentMax); //hack-ish way to make sure that all of the layers are displayed after update
        // }
        if (layerData.layerType !== LayerTypes.HeatMap) {
            layerData.layer.eachLayer(function(layer) {
                let val = (layer as any).feature.properties[filter.fieldToFilter];
                if (filter.filterValues[val])
                    filter.filterValues[val].push(layer);
                else
                    filter.filterValues[val] = [layer];
            });
        }

        return filter.id;

    }

    /**
     * deleteFilter - Removes a filter from the map
     *
     * @param  id  The id of the layer to delete
     */
    deleteFilter(id: number) {
        let filterToDelete = this.props.state.filters.filter(function(f) { return f.id === id })[0];
        this.filterLayer(id, filterToDelete.totalMin, filterToDelete.totalMax); //reset filter
        this.props.state.filters = this.props.state.filters.filter(function(f) { return f.id !== id });

    }

    /**
     * filterLayer - Remove or show items based on changes on a filter
     *
     * @param  id   The filter to change
     * @param  lowerLimit Current minimum value. Hide every value below this
     * @param  upperLimit Current max value. Hide every value above this
     */
    filterLayer(filterId: number, lowerLimit: any, upperLimit: any) {
        let filter: IFilter = this.props.state.filters.filter((f) => { return f.id === filterId })[0];
        if (filter) {
            filter.currentMin = lowerLimit;
            filter.currentMax = upperLimit;
            let layerData: Layer = this.props.state.layers.filter((lyr) => { return lyr.id === filter.layerId })[0];
            if (layerData.layerType !== LayerTypes.HeatMap) {
                for (let val in filter.filterValues) {
                    let filteredIndex = filter.filteredIndices.indexOf(+val); //is filtered?
                    if (filteredIndex === -1 && (val < lowerLimit || val > upperLimit)) { //If not yet filtered and values over thresholds
                        filter.filterValues[val].map(function(lyr) {
                            if (filter.remove)
                                layerData.layer.removeLayer(lyr);
                            else {

                                if (layerData.symbolOptions.symbolType === SymbolTypes.Rectangle) { //for divIcons - replace existing with a copy with new opacity
                                    let icon = (lyr as any).options.icon;
                                    let html = icon.options.html.replace('opacity:' + layerData.colorOptions.fillOpacity + ';', 'opacity:0.2;');

                                    icon.options.html = html;
                                    (lyr as any).setIcon(icon);
                                }
                                else {
                                    (lyr as any).setStyle({ fillOpacity: 0.2, opacity: 0.2 })
                                }
                            }
                        });
                        filter.filteredIndices.push(+val); //mark as filtered
                    }
                    else if (filteredIndex > -1 && (val >= lowerLimit && val <= upperLimit)) { //If filtered and withing thresholds
                        filter.filterValues[val].map(function(lyr) {
                            if (shouldLayerBeAdded.call(this, lyr)) {
                                if (filter.remove)
                                    layerData.layer.addLayer(lyr);
                                else
                                    if (layerData.symbolOptions.symbolType === SymbolTypes.Rectangle) {
                                        let icon = (lyr as any).options.icon;
                                        let html = icon.options.html.replace('opacity:0.2;', 'opacity:' + layerData.colorOptions.fillOpacity + ';');

                                        icon.options.html = html;
                                        (lyr as any).setIcon(icon);
                                    }
                                    else {
                                        (lyr as any).setStyle({ fillOpacity: layerData.colorOptions.fillOpacity, opacity: layerData.colorOptions.opacity });
                                    }
                            }
                        }, this);
                        filter.filteredIndices.splice(filteredIndex, 1);

                    }
                }

            }
            else {
                let arr: number[][] = [];
                layerData.geoJSON.features.map(function(feat) {
                    if (feat.properties[filter.fieldToFilter] > lowerLimit && feat.properties[filter.fieldToFilter] < upperLimit) {
                        let pos = [];
                        pos.push(feat.geometry.coordinates[1]);
                        pos.push(feat.geometry.coordinates[0]);
                        arr.push(pos);
                    }
                });
                layerData.layer.setLatLngs(arr);
            }
        }


        /**
         * shouldLayerBeAdded - Checks every active filter to see if a layer can be un-filtered
         *
         * @return {type}  description
         */
        function shouldLayerBeAdded(layer) {
            let filters: IFilter[] = this.props.state.filters.filter((f) => { return f.id !== filterId });
            let canUnFilter = true;
            for (let i in filters) {
                let filter = filters[i];
                let val = layer.feature.properties[filter.fieldToFilter];
                canUnFilter = val <= filter.currentMax && val >= filter.currentMin;

            }
            return canUnFilter;

        }
    }

    /**
     * getFilters - Gets the currently active filters for rendering
     *
     * @return  Filters in an array
     */
    getFilters() {
        let arr: JSX.Element[] = [];
        if (this.props.state.filters.length > 0)
            for (let key in this.props.state.filters.slice()) {
                if (Object.keys(this.props.state.filters[key].filterValues).length !== 0) //if filter has been properly initialized
                    arr.push(<Filter
                        id = {this.props.state.filters[key].id}
                        title={this.props.state.filters[key].title}
                        valueChanged={this.filterLayer.bind(this) }
                        key={key} maxValue={this.props.state.filters[key].totalMax}
                        minValue={this.props.state.filters[key].totalMin}
                        steps={this.props.state.filters[key].steps}/>)
            }
        return arr;
    }


    legendPropsChanged(legend: ILegend) { //unnecessary?
        this.props.state.legend = legend;
    }

    showLegend() {
        if (this.props.state.legend && this.props.state.legend.visible) {
            return <Legend
                state={this.props.state}/>

        }
    }

    saveImage() {
        let options = this.props.state.exportMenuState;
        function filter(node) {
            if (!node.className || !node.className.indexOf)
                return true;
            else
                return (node.className.indexOf('impromptu') === -1
                    && node.className.indexOf('leaflet-control') === -1
                    && (options.showLegend || (!options.showLegend && node.className.indexOf('legend') === -1))
                    && (options.showFilters || (!options.showFilters && node.className.indexOf('filter') === -1))
                );
        }
        domToImage.toBlob(document.getElementById('content'), { filter: filter })
            .then(function(blob) {
                (window as any).saveAs(blob, 'Mapify_map.png');
            });
    }

    saveFile() {
        let saveData: SaveState = {
            layers: this.props.state.layers,
            legend: this.props.state.legend,
            filters: this.props.state.filters,
        };
        let blob = new Blob([JSON.stringify(saveData)], { type: "text/plain;charset=utf-8" });
        (window as any).saveAs(blob, 'map.mapify');
    }

    loadSavedMap(saveData: SaveState) {
        for (let i in saveData.layers) {
            let lyr = saveData.layers[i];
            let newLayer = new Layer(this.props.state.map);
            newLayer.id = lyr.id;
            newLayer.layerName = lyr.layerName
            newLayer.headers = lyr.headers;
            newLayer.popupHeaders = lyr.popupHeaders;
            newLayer.geoJSON = lyr.geoJSON;
            newLayer.layerType = lyr.layerType;
            newLayer.heatMapVariable = lyr.heatMapVariable;
            newLayer.layer = lyr.layer;
            newLayer = lyr;

            //this.reloadLayer(newLayer, true)
        }
        this.props.state.welcomeShown = false;
        this.props.state.editingLayer = this.props.state.layers[0];
        this.props.state.menuShown = true;
        this.props.state.legend = saveData.legend;
        this.props.state.filters = saveData.filters;

    }
    render() {
        let modalStyle = {
            content: {
                border: '4px solid #6891e2',
                borderRadius: '15px',
                padding: '0px',
            }
        }
        return (
            <div>
                <div id='map'/>
                <Modal
                    isOpen={this.props.state.welcomeShown}
                    style = {modalStyle}>
                    <WelcomeScreen
                        loadMap={this.loadSavedMap.bind(this) }
                        openLayerImport={this.startLayerImport.bind(this) }
                        />
                </Modal>
                <Modal
                    isOpen={this.props.state.importWizardShown}
                    style = {modalStyle}>
                    <LayerImportWizard
                        state={new ImportWizardState() }
                        submit={this.layerImportSubmit.bind(this) }
                        cancel={this.cancelLayerImport.bind(this) }
                        map = {this.props.state.map}
                        />
                </Modal>
                <MapifyMenu
                    state = {this.props.state}
                    refreshMap={this.reloadLayer.bind(this) }
                    addLayer = {this.addNewLayer.bind(this) }
                    deleteLayer={this.deleteLayer.bind(this) }
                    saveFilter ={this.saveFilter.bind(this) }
                    deleteFilter={this.deleteFilter.bind(this) }
                    changeLayerOrder ={this.changeLayerOrder.bind(this) }
                    legendStatusChanged = {this.legendPropsChanged.bind(this) }
                    saveImage ={this.saveImage}
                    saveFile = {this.saveFile.bind(this) }
                    />
                {this.getFilters() }
                {this.showLegend() }
            </div>
        );
    }


};
var Map = MapMain;
const state = new AppState();

ReactDOM.render(
    <Map state={state}/>, document.getElementById('content')
);
