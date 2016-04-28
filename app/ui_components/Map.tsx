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
let chroma = require('chroma-js');
let _mapInitModel = new MapInitModel();
let _currentLayerId: number, _currentFilterId: number = 0;

let _map: L.Map;

L.Icon.Default.imagePath = 'app/images/leaflet-images';

export class MapMain extends React.Component<IMapMainProps, IMapMainStates>{


    private defaultColorOptions: IColorOptions = {
        fillColor: '#E0E62D',
        fillOpacity: 1,
        color: '#000',
        choroplethFieldName: '',
        colorScheme: 'Greys',
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
            layers: null,
            filters: {}
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
            let layers = this.state.layers.filter((lyr) => { return lyr.id != layerData.id });

            if (layerData.layerType === LayerTypes.ChoroplethMap || layerData.visOptions.colorOptions.choroplethFieldName !== '') {

                _map.removeLayer(layerData.layer);

                let layer = this.createChoroplethLayer(layerData);
                delete (layerData.visOptions.colorOptions as any).style; //prevents an error when doing choroplethOptions->refresh->symbolOptions->refresh
                delete (layerData.visOptions.colorOptions as any).onEachFeature;
                delete (layerData.visOptions.colorOptions as any).pointToLayer;
                layer.addTo(_map);
                layerData.layer = layer;

            }
            if (layerData.layerType === LayerTypes.SymbolMap) {
                layerData.layer.setStyle(layerData.visOptions.colorOptions);

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
                        //calculate min and max values and radii
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
            layers.push(layerData);
            this.setState({
                layers: layers,
            });
        }
        //this.refreshFilterLayers(layerData);

    }



    /**
     * createChoroplethLayer - Create a new choropleth layer by leaflet-choropleth.js
     *
     * @param  layerData    the data containing the GeoJSON string and the color variable
     * @return {L.GeoJSON}  the GeoJSON layer coloured according to the visOptions
     */
    createChoroplethLayer(layerData: ILayerData) {
        let opts = layerData.visOptions.colorOptions;
        if (opts.choroplethFieldName === '') {
            layerData.headers.map(function(h) {
                if (h.type == 'number') {
                    opts.choroplethFieldName = h.label;
                }
            })
            if (opts.choroplethFieldName === '')
                opts.choroplethFieldName = layerData.headers[0].label;
        }
        let values = (layerData.geoJSON as any).features.map(function(item) {
            return item.properties[opts.choroplethFieldName];
        });

        opts.limits = chroma.limits(values, opts.mode, opts.steps);
        opts.colors = chroma.scale(opts.colorScheme).colors(opts.steps);
        let style = function(feature) {
            function getColor(value: number) {
                if (!isNaN(value)) {
                    for (var i = 0; i < opts.limits.length; i++) {

                        if (value == opts.limits[opts.limits.length - 1]) { //color the last item correctly
                            return opts.colors[opts.colors.length - 1]
                        }
                        if (opts.limits[i] <= value && value <= opts.limits[i + 1]) {

                            return opts.colors[i];
                        }
                    }
                }
            }
            return {
                fillOpacity: opts.fillOpacity,
                opacity: opts.opacity,
                fillColor: getColor(feature.properties[opts.choroplethFieldName]),


            }
        }
    
        let options: L.GeoJSONOptions = {
    pointToLayer: layerData.visOptions.pointToLayer.bind(this),
    onEachFeature: this.defaultVisOptions.onEachFeature,
    style: style,
}
console.log(options)

return L.geoJson(layerData.geoJSON, options);
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
    let filters: { [title: string]: IFilter } = this.state.filters;
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
    filters[info.title] = { id: _currentFilterId++, title: info.title, layerData: info.layerData, filterValues: filterValues, fieldToFilter: info.fieldToFilter, minValue: minVal, maxValue: maxVal };
    this.setState({
        filters: filters,
        importWizardShown: this.state.importWizardShown,
        menuShown: this.state.menuShown,
    })

}


/**
 * filterLayer - Remove or show items based on changes on a filter
 *
 * @param  title   The filter to change
 * @param  lowerLimit Current minimum value. Hide every value below this
 * @param  upperLimit Current max value. Hide every value above this
 */
filterLayer(title: string, lowerLimit: any, upperLimit: any) {
    let filter = this.state.filters[title];
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
 * getFilters - Gets the currently active filters for rendering
 *
 * @return  Filters in an array
 */
getFilters() {
    let arr: JSX.Element[] = [];
    for (let key in this.state.filters) {
        arr.push(<Filter
            title={key}
            valueChanged={this.filterLayer.bind(this) }
            key={key} maxValue={this.state.filters[key].maxValue}
            minValue={this.state.filters[key].minValue}/>)
    }
    return arr;
}


legendStatusChanged(legend: ILegend) {
    this.setState({
        legend: legend,
        menuShown: this.state.menuShown,
        importWizardShown: this.state.importWizardShown,
    })
}

showLegend() {
    if (this.state.legend && this.state.legend.visible) {
        return <Legend mapLayers={this.state.layers} horizontal={this.state.legend.horizontal}/>

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
                legendStatusChanged = {this.legendStatusChanged.bind(this) }
                visible={this.state.menuShown}
                />
            {this.getFilters() }
            {this.showLegend() }
        </div>
    );
}


};
var Map = MapMain;
ReactDOM.render(
    <Map/>, document.getElementById('content')
);
