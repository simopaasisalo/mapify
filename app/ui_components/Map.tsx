declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {LayerImportWizard} from './import_wizard/LayerImportWizard';
import {MapifyMenu} from './menu/Menu';
import {MapInitModel} from '../models/MapInitModel';
import {LayerTypes} from './common_items/common';
import {Filter} from './Filter';
import 'leaflet';
import 'leaflet-choropleth';
let Modal = require('react-modal');
let _mapInitModel = new MapInitModel();
let _currentLayerId: number = 0;
let _map: L.Map;
let _filters: { [title: string]: IFilter; } = {};

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
        filter: (function(feature, layer) { return true }),


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
        _map = L.map('map', {
            layers: baseLayers,

        }).setView([0, 0], 2);
        _map.doubleClickZoom.disable();
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
        layerData.id = _currentLayerId;
        _currentLayerId++;
        if (layerData.layerType == LayerTypes.ChoroplethMap) {
            layerData.visOptions.colorOptions.choroplethOptions = this.defaultChoroplethOptions;
            layer = this.createChoroplethLayer(layerData);
            delete layerData.visOptions.colorOptions.choroplethOptions.style; //prevents an error when doing choroplethOptions->refresh->symbolOptions->refresh

        }
        else {
            layer = L.geoJson(layerData.geoJSON, {
                pointToLayer: layerData.visOptions.pointToLayer.bind(this),
                onEachFeature: layerData.visOptions.onEachFeature.bind(this),
                filter: layerData.visOptions.filter.bind(this),
            });
        }
        layerData.layer = layer;
        layer.addTo(_map);

        _map.fitBounds(layer.getBounds());

        var lyrs = this.state.layers ? this.state.layers : [];
        lyrs.push(layerData);
        this.setState({
            layers: lyrs,
            importWizardShown: false,
            menuShown: true,
        });
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
        for (let lyr of this.state.layers) {
            if (lyr.id == id) {
                return lyr;
            }
        }
    }
    /**
     * refreshLayer - Update the layer on the map after the user has changed the visualization options
     * @param  layerData  The layer to update
     */
    refreshLayer(layerData: ILayerData) {
        if (layerData) {
            if (layerData.layerType === LayerTypes.ChoroplethMap || layerData.visOptions.colorOptions.choroplethOptions) {
                _map.removeLayer(layerData.layer);
                let layer = this.createChoroplethLayer(layerData);
                delete layerData.visOptions.colorOptions.choroplethOptions.style; //prevents an error when doing choroplethOptions->refresh->symbolOptions->refresh

                layer.addTo(_map);
                layerData.layer = layer;
            }
            if (layerData.layerType === LayerTypes.SymbolMap) {
                if (layerData.visOptions.symbolOptions.sizeVariable) {
                    (layerData.layer as any).eachLayer(function(layer) {
                        let val = layer.feature.properties[layerData.visOptions.symbolOptions.sizeVariable];
                        let radius = Math.sqrt(val * 8 / Math.PI) * 2;
                        layer.setRadius(radius);
                    });
                }
            }
        }
        this.refreshFilterLayers(layerData);
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

    deleteLayer(id: number) {
        let layerInfo = this.getLayerInfoById(id);
        if (layerInfo) {
            let currLayers = this.state.layers.filter((lyr) => { return lyr.id != id });
            _map.removeLayer(layerInfo.layer);
            this.setState({
                layers: currLayers,
                importWizardShown: false,
                menuShown: true,
            })
        }

    }

    createFilterToLayer(info: IFilter) {
        let maxVal, minVal;
        let filterValues: { [index: number]: L.ILayer[] } = {};
        info.layerData.layer.eachLayer(function(layer) {
            let val = +(layer as any).feature.properties[info.fieldToFilter];
            if (!minVal && !maxVal) { //initialize min and max values as the first value
                minVal = val;
                maxVal = val;
            }
            else {
                if (val < minVal)
                    minVal = val;
                if (val > maxVal)
                    maxVal = val;
            }
            if (filterValues[val])
                filterValues[val].push(layer);
            else
                filterValues[val] = [layer];
        })
        // lyrs.sort(function(a, b) { //sort into ascending order based on value
        //     //TODO: check for types besides number
        //     return (a as any).feature.properties[info.fieldToFilter] - (b as any).feature.properties[info.fieldToFilter];
        // })
        _filters[info.title] = { title: info.title, layerData: info.layerData, filterValues: filterValues, fieldToFilter: info.fieldToFilter, minValue: minVal, maxValue: maxVal };
        this.forceUpdate();

    }

    filterLayer(title: string, lowerLimit: any, upperLimit: any) {

        let filter = _filters[title];
        for (let val in filter.filterValues) {
            if (val < lowerLimit || val > upperLimit) {
                filter.filterValues[val].map(function(lyr) {
                    filter.layerData.layer.removeLayer(lyr);

                });

            }
            else {
                filter.filterValues[val].map(function(lyr) {
                    filter.layerData.layer.addLayer(lyr);

                });
            }
        }
        // filter.layerData.layer.eachLayer(function(lyr) {
        //     let val = (lyr as any).feature.properties[filter.fieldToFilter];
        //
        // });
        // for (let layer of filter.removedFeatures) { //re-add previous deleted layers
        //     let val = (layer as any).feature.properties[filter.fieldToFilter];
        //     if (val > lowerLimit && val < upperLimit) {
        //         filter.layerData.layer.addLayer(layer);
        //         filter.removedFeatures = filter.removedFeatures.filter((lyr) => { return lyr !== layer });
        //     }

        // }
    }

    /**
     * refreshFilterLayers - If the layers were updated, keep the filter up-to-date
     *
     * @param  data   The changed layer
     */
    refreshFilterLayers(data: ILayerData) {
        let filter: IFilter = null;
        for (let f in _filters) {
            if (_filters[f].layerData.id === data.id) {
                let foundFilter = _filters[f];
                let info: IFilter = {
                    title: foundFilter.title,
                    layerData: data,
                    fieldToFilter: foundFilter.fieldToFilter,
                    filterValues: [],
                    maxValue: foundFilter.maxValue,
                    minValue: foundFilter.minValue
                }
                this.createFilterToLayer(info);
                break;
            }
        }
    }

    getFilters() {
        let arr = [];
        for (let key in _filters) {
            arr.push(<Filter title={key} valueChanged={this.filterLayer.bind(this) } key={key} maxValue={_filters[key].maxValue} minValue={_filters[key].minValue}/>)
        }
        return arr;
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
                    deleteLayer={this.deleteLayer.bind(this) }
                    createFilter ={this.createFilterToLayer.bind(this) }
                    changeLayerOrder ={this.changeLayerOrder.bind(this) }
                    visible={this.state.menuShown}
                    />
                {this.getFilters() }
            </div>
        );
    }


};
var Map = MapMain;
ReactDOM.render(
    <Map/>, document.getElementById('content')
);
