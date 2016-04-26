declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {LayerImportWizard} from './import_wizard/LayerImportWizard';
import {MapifyMenu} from './menu/Menu';
import {MapInitModel} from '../models/MapInitModel';
import {LayerTypes} from './common_items/common';
import {Filter} from './misc/Filter';
import {Legend} from './misc/Legend';
import 'leaflet';
import 'leaflet-choropleth';
let Modal = require('react-modal');
let _mapInitModel = new MapInitModel();
let _currentLayerId: number = 0;
let _map: L.Map;
let _filters: { [title: string]: IFilter; } = {};

L.Icon.Default.imagePath = 'app/images/leaflet-images';

export class MapMain extends React.Component<IMapMainProps, IMapMainStates>{


    private defaultColorOptions: IColorOptions = {
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        valueProperty: '',
        scale: 'Greys',
        steps: 7,
        mode: 'q',
    }

    private defaultVisOptions: IVisualizationOptions = {
        colorOptions: this.defaultColorOptions,
        symbolOptions: {},
        onEachFeature: this.addPopupsToLayer,
        pointToLayer: (function(feature, latlng: L.LatLng) {
            return L.circleMarker(latlng, this.defaultColorOptions)
        }),


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
            layer = this.createChoroplethLayer(layerData);
            delete (layerData.visOptions.colorOptions as any).style; //prevents an error when doing choroplethOptions->refresh->symbolOptions->refresh
            delete (layerData.visOptions.colorOptions as any).onEachFeature;
            delete (layerData.visOptions.colorOptions as any).pointToLayer;
        }
        else {
            layer = L.geoJson(layerData.geoJSON, {
                pointToLayer: layerData.visOptions.pointToLayer.bind(this),
                onEachFeature: layerData.visOptions.onEachFeature.bind(this),
            });
        }
        layerData.layer = layer;
        layer.addTo(_map);
        console.log(layer);
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
            if (layerData.layerType === LayerTypes.ChoroplethMap || layerData.visOptions.colorOptions.valueProperty !== '') {

                _map.removeLayer(layerData.layer);

                let layer = this.createChoroplethLayer(layerData);
                delete (layerData.visOptions.colorOptions as any).style; //prevents an error when doing choroplethOptions->refresh->symbolOptions->refresh
                delete (layerData.visOptions.colorOptions as any).onEachFeature;
                delete (layerData.visOptions.colorOptions as any).pointToLayer;
                layer.addTo(_map);
                layerData.layer = layer;
            }
            if (layerData.layerType === LayerTypes.SymbolMap) {
                let opt = layerData.visOptions.symbolOptions;
                if (opt.sizeVariable) {
                    (layerData.layer as any).eachLayer(function(layer) {
                        let val = layer.feature.properties[opt.sizeVariable];
                        let radius = Math.sqrt(val * opt.sizeMultiplier / Math.PI) * 2;
                        if (radius < opt.sizeLowerLimit)
                            radius = opt.sizeLowerLimit;
                        else if (radius > opt.sizeUpperLimit)
                            radius = opt.sizeUpperLimit;
                        layer.setRadius(radius);
                        if (!opt.actualMaxValue && !opt.actualMinValue) {
                            opt.actualMinValue = val;
                            opt.actualMaxValue = val;
                            opt.actualMaxRadius = radius;
                            opt.actualMinRadius = radius;
                        }
                        else {
                            if (val > opt.actualMaxValue) {
                                opt.actualMaxRadius = radius;
                                opt.actualMaxValue = val;
                            }
                            if (radius < opt.actualMinRadius) {
                                opt.actualMinRadius = radius;
                                opt.actualMinValue = val;
                            }

                        }
                    });
                }
            }
        }
        this.refreshFilterLayers(layerData);
        this.forceUpdate();

    }



    /**
     * createChoroplethLayer - Create a new choropleth layer by leaflet-choropleth.js
     *
     * @param  layerData    the data containing the GeoJSON string and the color variable
     * @return {L.GeoJSON}  the GeoJSON layer coloured according to the visOptions
     */
    createChoroplethLayer(layerData: ILayerData) {

        let options = layerData.visOptions.colorOptions;
        if (options.valueProperty === '') {
            layerData.headers.map(function(h) {
                if (h.type == 'number') {
                    options.valueProperty = h.label;
                }
            })
            if (options.valueProperty === '')
                options.valueProperty = layerData.headers[0].label;
        }
        options['pointToLayer'] = layerData.visOptions.pointToLayer.bind(this);
        options['onEachFeature'] = this.defaultVisOptions.onEachFeature;

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




    /**
     * addNewLayer - Opens the import wizard for  a new layer
     *
     */
    addNewLayer() {
        this.setState({
            importWizardShown: true,
            menuShown: false,
        });
    }


    /**
     * deleteLayer - Removes a layer from the map and layer list
     *
     * @param  id   The unique id of the LayerInfo to remove
     */
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


    /**
     * createFilterToLayer - Creates a new filter and calculates its values
     *
     * @param  info   The IFilter description of the new filter
     */
    createFilterToLayer(info: IFilter) {
        let maxVal, minVal;
        let filterValues: { [index: number]: L.ILayer[] } = {};
        info.layerData.layer.eachLayer(function(layer) {
            let val = (layer as any).feature.properties[info.fieldToFilter];
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
        _filters[info.title] = { title: info.title, layerData: info.layerData, filterValues: filterValues, fieldToFilter: info.fieldToFilter, minValue: minVal, maxValue: maxVal };
        this.forceUpdate();

    }


    /**
     * filterLayer - Remove or show items based on changes on a filter
     *
     * @param  title   The filter to change
     * @param  lowerLimit Current minimum value. Hide every value below this
     * @param  upperLimit Current max value. Hide every value above this
     */
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
    }

    /**
     * refreshFilterLayers - Keep the filter up-to-date when layers change
     * Replaces an existing filter by a new one with the updated settings
     * @param  data   The changed ILayerData
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


    /**
     * getFilters - Gets the currently active filters for rendering
     *
     * @return  Filters in an array
     */
    getFilters() {
        let arr: JSX.Element[] = [];
        for (let key in _filters) {
            arr.push(<Filter title={key} valueChanged={this.filterLayer.bind(this) } key={key} maxValue={_filters[key].maxValue} minValue={_filters[key].minValue}/>)
        }
        return arr;
    }

    /**
     * createLegend - Initializes the map legend based on this.state.layers
     *
     * @return  Legend element
     */
    createLegend() {
        if (this.state.layers) {

            return <Legend mapLayers={this.state.layers} horizontal={true}/>
        }
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
                {this.createLegend() }
            </div>
        );
    }


};
var Map = MapMain;
ReactDOM.render(
    <Map/>, document.getElementById('content')
);
