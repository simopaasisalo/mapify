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

var map: L.Map;
L.Icon.Default.imagePath = 'app/images/leaflet-images';

export class MapMain extends React.Component<IMapMainProps, IMapMainStates>{
    private defaultCircleMarkerOptions = {
        radius: 8,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
    }

    private defaultChoroplethOptions: L.ChoroplethOptions = {
        valueProperty: '',
        scale: 'Greys',
        steps: 7,
        mode: 'q',
    }

    private defaultVisOptions: IVisualizationOptions = {
        colorOptions: {},
        symbolOptions: {},
        onEachFeature: this.addPopupsToLayer,
        pointToLayer: this.pointsToCircleMarkers,


    }
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
    shouldComponentUpdate(nextProps: IMapMainProps, nextState: IMapMainStates) {
        return this.state.importWizardShown !== nextState.importWizardShown ||
            this.state.menuShown !== nextState.menuShown ||
            this.state.layers !== nextState.layers
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
        layerData.visOptions = this.defaultVisOptions;

        if (layerData.layerType == LayerTypes.ChoroplethMap) {
            layerData.visOptions.colorOptions.choroplethOptions = this.defaultChoroplethOptions;
            layer = this.createChoroplethLayer(layerData);

        }
        else {
            layer = L.geoJson(layerData.geoJSON, {
                pointToLayer: layerData.visOptions.pointToLayer.bind(this),
                onEachFeature: layerData.visOptions.onEachFeature.bind(this)
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
     * refreshLayer - Update the layer on the map after the user has changed the visualization options
     * @param  layerData  The layer to update
     */
    refreshLayer(layerData: ILayerData) {
        if (layerData) {
            if (layerData.layerType === LayerTypes.ChoroplethMap || layerData.visOptions.colorOptions.choroplethOptions) {
                map.removeLayer(layerData.layer);
                let layer = this.createChoroplethLayer(layerData);
                delete layerData.visOptions.colorOptions.choroplethOptions.style; //prevents an error when doing choroplethOptions->refresh->symbolOptions->refresh

                layer.addTo(map);
                layerData.layer = layer;
            }
            if (layerData.layerType === LayerTypes.SymbolMap) {
                if (layerData.visOptions.symbolOptions.sizeVariable) {
                    layerData.layer.eachLayer(function(layer) {
                        let val = layer.feature.properties[layerData.visOptions.symbolOptions.sizeVariable];
                        let radius = Math.sqrt(val * 8 / Math.PI) * 2;
                        layer.setRadius(radius);
                    });
                }
            }
        }
    }

    /**
     * createChoroplethLayer - Create a new choropleth layer by leaflet-choropleth.js
     *
     * @param  layerData    the data containing the GeoJSON string and the color variable
     * @return {L.GeoJSON}  the GeoJSON layer coloured according to the visOptions
     */
    createChoroplethLayer(layerData: ILayerData) {
        let options = layerData.visOptions.colorOptions.choroplethOptions;
        if (options.valueProperty === '') {
            options.valueProperty = layerData.headers[0].label;
        }
        if (!options.pointToLayer) {
            options.pointToLayer = this.defaultVisOptions.pointToLayer.bind(this);
        }
        if (!options.onEachFeature) {
            options.onEachFeature = this.defaultVisOptions.onEachFeature.bind(this);
        }
        return L.choropleth(layerData.geoJSON, options);
    }


    /**
     * addPopupsToLayer - adds the feature details popup to layer
     *
     * @param   feature GeoJSON feature
     * @param   layer   layer to add popup to
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

    pointsToCircleMarkers(feature, latlng: L.LatLng) {
        return L.circleMarker(latlng, this.defaultCircleMarkerOptions);
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
                        cancel={this.cancelLayerImport.bind(this) }
                        />
                </Modal>

                <MapifyMenu
                    layers = {this.state.layers}
                    refreshMap={this.refreshLayer.bind(this) }
                    addLayer = {this.addNewLayer.bind(this) }
                    visible={this.state.menuShown}
                    />
                />
            </div>
        );
    }


};
var Map = MapMain;
ReactDOM.render(
    <Map/>, document.getElementById('content')
);
