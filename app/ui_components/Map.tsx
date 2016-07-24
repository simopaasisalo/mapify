declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import {AppState, ImportWizardState, SaveState} from './Stores/States';
import {Layer, ColorOptions, SymbolOptions} from './Stores/Layer';
import {LayerImportWizard} from './import_wizard/LayerImportWizard';
import {MapifyMenu} from './menu/Menu';
import {MapInitModel} from '../models/MapInitModel';
import {LayerTypes, SymbolTypes, GetSymbolSize} from './common_items/common';
import {OnScreenFilter} from './misc/OnScreenFilter';
import {OnScreenLegend} from './misc/OnScreenLegend';
import {WelcomeScreen} from './misc/WelcomeScreen';
import 'leaflet';
import 'Leaflet.extra-markers';
let Modal = require('react-modal');
let d3 = require('d3');
let chroma = require('chroma-js');
let heat = require('leaflet.heat');
let domToImage = require('dom-to-image');
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
        layerData.appState = this.props.state;
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
     * deleteFilter - Removes a filter from the map
     *
     * @param  id  The id of the layer to delete
     */
    deleteFilter(id: number) {
        let filterToDelete = this.props.state.filters.filter(function(f) { return f.id === id })[0];
        //this.filterLayer(id, filterToDelete.totalMin, filterToDelete.totalMax); //reset filter
        this.props.state.filters = this.props.state.filters.filter(function(f) { return f.id !== id });

    }



    /**
     * getFilters - Gets the currently active filters for rendering
     *
     * @return  Filters in an array
     */
    getFilters() {
        let arr: JSX.Element[] = [];
        if (this.props.state.filters && this.props.state.filters.length > 0)
            for (let key in this.props.state.filters.slice()) {
                if (this.props.state.filters[key].show) { //if filter has been properly initialized
                    arr.push(<OnScreenFilter
                        state={this.props.state.filters[key]}
                        key={key} />);
                }
            }
        return arr;
    }


    showLegend() {
        if (this.props.state.legend && this.props.state.legend.visible) {
            return <OnScreenLegend
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
        saveData.layers = saveData.layers.slice();
        saveData.layers.forEach(function(e) { delete e.appState; delete e.layer });
        saveData.filters.forEach(function(e) { delete e.appState });
        let blob = new Blob([JSON.stringify(saveData)], { type: "text/plain;charset=utf-8" });
        (window as any).saveAs(blob, 'map.mapify');
    }

    loadSavedMap(saveData: SaveState) {
        this.props.state.legend = saveData.legend;
        this.props.state.filters = saveData.filters ? saveData.filters : [];

        for (let i in saveData.layers) {

            let lyr = saveData.layers[i];
            let newLayer = new Layer(this.props.state);

            newLayer.id = lyr.id;
            newLayer.layerName = lyr.layerName
            newLayer.headers = lyr.headers;
            newLayer.popupHeaders = lyr.popupHeaders;
            newLayer.layerType = lyr.layerType;
            newLayer.heatMapVariable = lyr.heatMapVariable;
            newLayer.geoJSON = lyr.geoJSON;
            newLayer.colorOptions = lyr.colorOptions;
            newLayer.symbolOptions = lyr.symbolOptions;
            this.props.state.layers.push(newLayer);
            //this.reloadLayer(newLayer, true)
        }
        this.props.state.welcomeShown = false;
        this.props.state.editingLayer = this.props.state.layers[0];
        this.props.state.menuShown = true;


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
                <MyApp/>
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
                        appState={this.props.state}
                        submit={this.layerImportSubmit.bind(this) }
                        cancel={this.cancelLayerImport.bind(this) }
                        />
                </Modal>
                <MapifyMenu
                    state = {this.props.state}
                    refreshMap={this.reloadLayer.bind(this) }
                    addLayer = {this.addNewLayer.bind(this) }
                    deleteLayer={this.deleteLayer.bind(this) }
                    deleteFilter={this.deleteFilter.bind(this) }
                    changeLayerOrder ={this.changeLayerOrder.bind(this) }
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
class MyApp extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                ...
                <DevTools />
            </div>
        );
    }
}
ReactDOM.render(
    <Map state={state}/>, document.getElementById('content')
);
