declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {LayerImportWizard} from './import_wizard/LayerImportWizard';
import {MapifyMenu} from './menu/Menu';
import {MapInitModel} from '../models/MapInitModel';
import {LayerTypes} from './common_items/common';
let _mapInitModel = new MapInitModel();
import 'leaflet';
import 'leaflet-choropleth';
let Modal = require('react-modal');

let defaultCircleMarkerOptions = {
    radius: 8,
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
}

let defaultChoroplethOptions: L.ChoroplethOptions = {
    valueProperty: '',
    scale: 'Greys',
    steps: 7,
    mode: 'q',
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, defaultCircleMarkerOptions);
    },
    onEachFeature: this.addPopupsToLayer
}

let defaultVisOptions: IVisualizationOptions = {
    colorOptions: {
        choroplethOptions: defaultChoroplethOptions
    },
    symbolOptions: {}
}

var map: L.Map;
L.Icon.Default.imagePath = 'app/images/leaflet-images';

export class MapMain extends React.Component<IMapMainProps, IMapMainStates>{
    constructor() {
        super();
        this.state = {
            importWizardShown: false,
            menuShown: false,
            layers: null
        };
    }
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
        map = L.map('map', {
            layers: baseLayers,

        }).setView([0, 0], 2);
        map.doubleClickZoom.disable();
        this.setState({
            importWizardShown: true,
            menuShown: false,
            layers: null,
        });

    }

    /**
     * refreshMap - Update the map after the user has changed the visualization options
     *  Gets the layer to update by the options.layerName
     * @param  {IVisualizationOptions} options  The updated visualization options
     */
    refreshMap(options: IVisualizationOptions) {

        let layerData: ILayerData;
        for (let data of this.state.layers) {
            if (data.layerName == options.layerName) {
                layerData = data;
                break;
            }
        }
        if (layerData) {
            if (layerData.layerType === LayerTypes.ChoroplethMap) {
                //For leaflet-choropleth there may be no other way than to delete->redraw
                map.removeLayer(layerData.layer);
                let layer = this.createChoroplethLayer(layerData, options.colorOptions.choroplethOptions);
                layer.addTo(map);
                layerData.layer = layer;
            }
            else if (layerData.layerType === LayerTypes.SymbolMap) {

                if (options.symbolOptions.sizeVariable) {

                    layerData.layer.eachLayer(function(layer) {
                        let val = layer.feature.properties[options.symbolOptions.sizeVariable];
                        let radius = Math.sqrt(val * 8 / Math.PI) * 2;
                        layer.setRadius(radius);
                    });
                }
            }
        }
    }

    cancelLayerImport() {
        this.setState({
            importWizardShown: false,
            menuShown: true,
        })
    }

    /**
     * layerImportSubmit - Layer importing was completed -> draw to map
     *
     * @param  {ILayerData} layerData contains layer name and GeoJSON object
     */
    layerImportSubmit(layerData: ILayerData) {
        let layer: L.GeoJSON;
        if (layerData.layerType == LayerTypes.ChoroplethMap) {
            layer = this.createChoroplethLayer(layerData, defaultChoroplethOptions);
        }
        else {
            layer = L.geoJson(layerData.geoJSON, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, defaultCircleMarkerOptions);
                },
            });
        }
        layerData.layer = layer;
        layer.addTo(map);
        map.fitBounds(layer.getBounds());

        var lyrs = this.state.layers ? this.state.layers : [];
        lyrs.push(layerData);
        this.setState({
            layers: lyrs,
            importWizardShown: false,
            menuShown: true,
        });



    }


    /**
     * createChoroplethLayer - Create a new choropleth layer by leaflet-choropleth.js
     *
     * @param  layerData               the data containing the GeoJSON string and the color variable
     * @param  visOptions   the visualization options. If empty, uses default values
     * @return {L.GeoJSON}                          the GeoJSON layer coloured according to the visOptions
     */
    createChoroplethLayer(layerData: ILayerData, options: L.ChoroplethOptions) {
        if (options.valueProperty === '') {
            options.valueProperty = layerData.headers[0].label;
        }
        if (!options.pointToLayer) {
            options.pointToLayer = defaultChoroplethOptions.pointToLayer;
        }
        if (!options.onEachFeature) {
            options.onEachFeature = defaultChoroplethOptions.onEachFeature;
        }
        return L.choropleth(layerData.geoJSON, options);
    }


    /**
     * addPopupsToLayer - adds the feature details popup to layer
     *
     * @param   feature GeoJSON features
     * @param   layer   layer to add popup to
     * @return {void}
     */
    addPopupsToLayer(feature, layer: L.GeoJSON) {
        var popupContent = '';
        for (var prop in feature.properties) {
            popupContent += prop + ": " + feature.properties[prop];
            popupContent += "<br />";
        }
        if (popupContent != '')
            layer.bindPopup(popupContent);
    }


    /**
     * addNewLayer - Opens the import wizard for  a new layer
     *
     * @return {void}
     */
    addNewLayer() {
        this.setState({
            importWizardShown: true,
            menuShown: false,
        });
    }

    render() {
        return (
            <div>
                <div id='map'/>
                <Modal isOpen={this.state.importWizardShown}>
                    <LayerImportWizard
                        submit={this.layerImportSubmit.bind(this) }
                        cancel={this.cancelLayerImport.bind(this) }/>
                </Modal>
                {this.state.menuShown ?
                    <MapifyMenu
                        layers = {this.state.layers}
                        originalOptions={defaultVisOptions}
                        refreshMap={this.refreshMap.bind(this) }
                        addLayer = {this.addNewLayer.bind(this) }/> : null}/>
            </div>
        );
    }


};
var Map = MapMain;
ReactDOM.render(
    <Map/>, document.getElementById('content')
);
