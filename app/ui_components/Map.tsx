declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { AppState, ImportWizardState, SaveState } from './Stores/States';
import { Layer, ColorOptions, SymbolOptions } from './Stores/Layer';
import { Legend } from './Stores/Legend';
import { LayerImportWizard } from './import_wizard/LayerImportWizard';
import { MapifyMenu } from './menu/Menu';
import { MapInitModel } from '../models/MapInitModel';
import { LayerTypes, SymbolTypes, GetSymbolSize, LoadSavedMap } from './common_items/common';
import { OnScreenFilter } from './misc/OnScreenFilter';
import { OnScreenLegend } from './misc/OnScreenLegend';
import { WelcomeScreen } from './misc/WelcomeScreen';
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


    componentWillMount() {
        let map = this.getUrlParameter("map");
        if (map)
            this.props.state.embed = true;
    }

    componentDidMount() {
        _mapInitModel.InitCustomProjections();
        this.initMap();
        let map = this.getUrlParameter("map");
        let path = this.getUrlParameter("path");
        if (map) {
            LoadSavedMap(map, this.loadSavedMap.bind(this, true), path);
        }
    }

    /**
     * Get URL parameter value
     *
     * http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js/21903119#21903119
     * @param  sParam   parameter to look for
     * @return false when not found, value when found
     */
    getUrlParameter(sParam: string) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? false : sParameterName[1];
            }
        }
    };

    /**
     * initMap - Initializes the map with basic options
     */
    initMap() {
        let baseLayers: any = _mapInitModel.InitBaseMaps();
        this.props.state.map = L.map('map', {
            layers: baseLayers,

        }).setView([0, 0], 2);

        this.props.state.map.doubleClickZoom.disable();
        this.props.state.map.on('contextmenu', function(e) { //disable context menu opening on right-click
            return;
        });
    }

    startLayerImport() {
        this.props.state.importWizardShown = true;
        this.props.state.welcomeShown = false;
        this.props.state.menuShown = false;
    }

    cancelLayerImport() {
        this.props.state.importWizardShown = false;
        this.props.state.menuShown = true;
        if (this.props.state.layers.length == 0)
            this.props.state.welcomeShown = true;
    }

    /**
     * layerImportSubmit - Layer importing was completed -> draw to map
     *
     * @param  {ILayerData} layerData contains layer name and GeoJSON object
     */
    layerImportSubmit(l: Layer) {
        l.appState = this.props.state;
        l.id = _currentLayerId++;
        this.props.state.layers.push(l);
        this.props.state.layerMenuState.order.push({ name: l.name, id: l.id });
        this.props.state.importWizardShown = false;
        this.props.state.editingLayer = l;
        this.props.state.menuShown = true;
    }

    loadSavedMap(embed: boolean, saved: SaveState) {

        this.props.state.legend = new Legend(saved.legend);
        this.props.state.filters = saved.filters ? saved.filters : [];

        for (let i in saved.layers) {

            let lyr = saved.layers[i];
            let newLayer = new Layer(this.props.state);

            newLayer.id = _currentLayerId++;
            newLayer.name = lyr.name
            newLayer.headers = lyr.headers;
            newLayer.popupHeaders = lyr.popupHeaders;
            newLayer.layerType = lyr.layerType;
            newLayer.heatMapVariable = lyr.heatMapVariable;
            newLayer.geoJSON = lyr.geoJSON;
            newLayer.colorOptions = new ColorOptions(lyr.colorOptions);
            newLayer.symbolOptions = new SymbolOptions(lyr.symbolOptions);
            newLayer.blockUpdate = false;
            this.props.state.layers.push(newLayer);

            this.props.state.layerMenuState.order.push({ name: newLayer.name, id: newLayer.id });
        }
        this.props.state.welcomeShown = false;
        this.props.state.editingLayer = this.props.state.layers[0];
        this.props.state.menuShown = !embed;


    }

    /**
     * changeLayerOrder - Redraws the layers in the order given
     *
     * @param   order   the array of layer ids
     */
    changeLayerOrder() {
        for (let i of this.props.state.layerMenuState.order) {
            let layer = this.props.state.layers.filter(lyr => lyr.id == i.id)[0];
            if (layer.layer) {
                if (layer.layerType !== LayerTypes.HeatMap) {
                    (layer.layer as any).bringToFront();
                }
                else {
                    this.props.state.map.removeLayer(layer.layer);
                    console.log('removed')
                    this.props.state.map.addLayer(layer.layer);
                    console.log('added')

                }
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
     * deleteLayer - Removes a layer from the map and layer list
     *
     * @param  id   The unique id of the LayerInfo to remove
     */
    deleteLayer(id: number) {
        let layerInfo = this.props.state.layers.filter(lyr => lyr.id == id)[0];
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
                {this.props.state.embed ? null :
                    <div>
                        <Modal
                            isOpen={this.props.state.welcomeShown}
                            style = {modalStyle}>
                            <WelcomeScreen
                                loadMap={this.loadSavedMap.bind(this)}
                                openLayerImport={this.startLayerImport.bind(this)}
                                />
                        </Modal>

                        <Modal
                            isOpen={this.props.state.importWizardShown}
                            style = {modalStyle}>
                            <LayerImportWizard
                                state={new ImportWizardState()}
                                appState={this.props.state}
                                submit={this.layerImportSubmit.bind(this)}
                                cancel={this.cancelLayerImport.bind(this)}
                                />
                        </Modal>
                        <MapifyMenu
                            state = {this.props.state}
                            refreshMap={this.reloadLayer.bind(this)}
                            addLayer = {this.startLayerImport.bind(this)}
                            deleteLayer={this.deleteLayer.bind(this)}
                            deleteFilter={this.deleteFilter.bind(this)}
                            changeLayerOrder ={this.changeLayerOrder.bind(this)}
                            saveImage ={this.saveImage}
                            saveFile = {this.saveFile.bind(this)}
                            />
                    </div>
                }
                {this.getFilters()}
                {this.showLegend()}
            </div>
        );
    }


};
// import DevTools from 'mobx-react-devtools';
//
// class MyApp extends React.Component<{}, {}> {
//     render() {
//         return (
//             <div>
//                 ...
//                 <DevTools />
//             </div>
//         );
//     }
// }

var Map = MapMain;
const state = new AppState();
ReactDOM.render(
    <Map state={state}/>, document.getElementById('content')
);
