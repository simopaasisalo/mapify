declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';

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
let _mapInitModel = new MapInitModel();
let _currentLayerId: number = 0;
let _currentFilterId: number = 0;

let _map: L.Map;

L.Icon.Default.imagePath = 'app/images/leaflet-images';

export class MapMain extends React.Component<{}, IMapMainStates>{


    private defaultColorOptions: IColorOptions = {
        fillColor: '#E0E62D',
        fillOpacity: 0.8,
        opacity: 0.8,
        color: '#000',
        choroplethField: '',
        colorScheme: 'Greys',
        steps: 7,
        mode: 'q',
        iconTextColor: '#FFF',
        revert: false
    }
    private defaultVisOptions: IVisualizationOptions = {
        colorOptions: this.defaultColorOptions,
        symbolOptions: { symbolType: SymbolTypes.Circle },
        onEachFeature: this.addPopupsToLayer,
        pointToLayer: function(feature, latlng: L.LatLng) {
            return L.circleMarker(latlng, this.defaultColorOptions)
        }.bind(this),
    }
    constructor() {
        super();
        this.state = {
            welcomeShown: true,
            importWizardShown: false,
            menuShown: false,
            layers: null,
            filters: []
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

    }
    startLayerImport() {
        this.setState({
            importWizardShown: true,
            welcomeShown: false,
        })
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
        let layer;
        layerData.visOptions = JSON.parse(JSON.stringify(this.defaultVisOptions));
        layerData.visOptions.onEachFeature = this.defaultVisOptions.onEachFeature;
        layerData.visOptions.pointToLayer = this.defaultVisOptions.pointToLayer;
        layerData.id = _currentLayerId;
        _currentLayerId++;
        if (layerData.layerType === LayerTypes.ChoroplethMap) {
            layer = this.createChoroplethLayer(layerData);
        }
        else if (layerData.layerType === LayerTypes.HeatMap) {
            layer = this.createHeatLayer(layerData);
        }
        else {
            layer = L.geoJson(layerData.geoJSON, layerData.visOptions);
        }
        layerData.layer = layer;
        layer.addTo(_map);
        _map.fitBounds(layerData.layerType === LayerTypes.HeatMap ? (layer as any)._latlngs : layer.getBounds()); //leaflet.heat doesn't utilize getBounds, so get it directly

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
     * reloadhLayer - Update the layer on the map after the user has changed the visualization options
     * @param  layerData  The layer to update
     * @param  wasImported  Was layer imported from a previously saved map
     */
    reloadLayer(layerData: ILayerData, wasImported: boolean = false) {
        if (layerData) {
            let filter = this.state.filters.filter((f) => { return f.layerDataId === layerData.id })[0];
            let col = layerData.visOptions.colorOptions;
            let sym = layerData.visOptions.symbolOptions;
            if (!wasImported)
                _map.removeLayer(layerData.layer);
            if (layerData.layerType !== LayerTypes.HeatMap) {
                layerData.visOptions.pointToLayer = (function(feature, latlng: L.LatLng) {
                    if (sym.symbolType === SymbolTypes.Icon) {
                        let icon, shape, val;
                        for (let i in sym.iconLimits) {
                            if (+i !== sym.iconLimits.length - 1) {
                                val = feature.properties[sym.iconField];
                                if (val < sym.iconLimits[i]) {
                                    icon = sym.icons[i].fa;
                                    shape = sym.icons[i].shape;
                                    break;
                                }
                            }
                        }
                        let customIcon = L.ExtraMarkers.icon({
                            icon: icon ? icon : sym.icons[0].fa,
                            prefix: 'fa',
                            markerColor: col.choroplethField ? this.getChoroplethColor(col.limits, col.colors, feature.properties[col.choroplethField]) : col.fillColor,
                            svg: true,
                            svgBorderColor: col.color,
                            svgOpacity: col.fillOpacity,
                            shape: shape ? shape : sym.icons[0].shape,
                            iconColor: col.iconTextColor,
                        });
                        return L.marker(latlng, { icon: customIcon });
                    }
                    else if (sym.symbolType === SymbolTypes.Rectangle) {

                        let fillColor = col.fillColor ? col.fillColor : this.getChoroplethColor(col.limits, col.colors, feature.properties[col.choroplethField]);
                        let borderColor = col.color;
                        let x: number = sym.sizeXVar ? GetSymbolSize(feature.properties[sym.sizeXVar], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 10;
                        let y: number = sym.sizeYVar ? GetSymbolSize(feature.properties[sym.sizeYVar], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 10;
                        let html = '<div style="height: ' + y + 'px; width: ' + x + 'px; opacity:' + col.opacity + '; background-color:' + fillColor + '; border: 1px solid ' + borderColor + '"/>';
                        let rectMarker = L.divIcon({ iconAnchor: L.point(feature.geometry[0], feature.geometry[1]), html: html, className: '' });
                        return L.marker(latlng, { icon: rectMarker });
                    }
                    else if (sym.symbolType === SymbolTypes.Chart) {
                        let colors = ['#6bbc60', '#e2e236', '#e28c36', '#36a6e2', '#e25636', '#36e2c9', '#364de2', '#e236c9', '#51400e', '#511f0e', '#40510e'];
                        let vals = [];
                        let i = 0;
                        sym.chartFields.map(function(e) {
                            vals.push({ feat: e, val: feature.properties[e.value], color: colors[i] });
                            i++;
                        });
                        let radius = sym.sizeXVar ? GetSymbolSize(feature.properties[sym.sizeXVar], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 30;
                        let html = makePieChart({
                            fullCircle: sym.chartType === 'pie',
                            data: vals,
                            valueFunc: function(d) { return d.val; },
                            strokeWidth: 1,
                            outerRadius: radius,
                            innerRadius: radius / 3,
                            pieClass: function(d) { return d.data.feat },
                            pathFillFunc: function(d) { return d.data.color },
                        });
                        let marker = L.divIcon({ iconAnchor: L.point(feature.geometry[0], feature.geometry[1]), html: html, className: '' });
                        return L.marker(latlng, { icon: marker });
                    }
                    else {
                        return L.circleMarker(latlng, layerData.visOptions.colorOptions);
                    }
                });
            }
            let layer;
            if (layerData.layerType === LayerTypes.ChoroplethMap || col.choroplethField !== '') {
                layer = this.createChoroplethLayer(layerData);
            }
            else if (layerData.layerType === LayerTypes.SymbolMap) {
                layer = L.geoJson(layerData.geoJSON, layerData.visOptions);
            }
            else if (layerData.layerType === LayerTypes.HeatMap) {
                layer = this.createHeatLayer(layerData);
            }

            layer.addTo(_map);
            if (wasImported)
                _map.fitBounds(layerData.layerType === LayerTypes.HeatMap ? (layer as any)._latlngs : layer.getBounds()); //leaflet.heat doesn't utilize getBounds, so get it directly

            layerData.layer = layer;
            let layers = this.state.layers ? this.state.layers.filter((lyr) => { return lyr.id != layerData.id }) : [];
            if (layerData.layerType === LayerTypes.SymbolMap) {
                let opt = layerData.visOptions.symbolOptions;
                //if needs to scale and is of scalable type
                if (opt.sizeXVar || opt.sizeYVar && (opt.symbolType === SymbolTypes.Circle || opt.symbolType === SymbolTypes.Rectangle)) {
                    scaleSymbolLayerSize(opt);
                }
            }
            layers.push(layerData);
            this.setState({
                layers: layers,
            });


            if (filter)
                this.saveFilter(filter, true);
        }

        function scaleSymbolLayerSize(opt: ISymbolOptions) {
            (layerData.layer as any).eachLayer(function(layer) {
                let xVal = layer.feature.properties[opt.sizeXVar];
                let yVal = layer.feature.properties[opt.sizeYVar];
                let r = 10;
                if (opt.sizeXVar) {
                    r = GetSymbolSize(xVal, opt.sizeMultiplier, opt.sizeLowLimit, opt.sizeUpLimit);
                    if (opt.symbolType === SymbolTypes.Circle) {
                        layer.setRadius(r);
                    }
                    //calculate min and max values and -size
                    if (!opt.actualMaxXValue && !opt.actualMinXValue) {
                        opt.actualMinXValue = xVal;
                        opt.actualMaxXValue = xVal;
                        opt.actualMaxX = r;
                        opt.actualMinX = r;

                    }
                    else {
                        if (xVal > opt.actualMaxXValue) {
                            opt.actualMaxX = r;
                            opt.actualMaxXValue = xVal;
                        }
                        else if (xVal < opt.actualMinXValue) {
                            opt.actualMinX = r;
                            opt.actualMinXValue = xVal;
                        }

                    }
                }
                if (opt.sizeYVar) {
                    r = GetSymbolSize(yVal, opt.sizeMultiplier, opt.sizeLowLimit, opt.sizeUpLimit);
                    if (opt.symbolType === SymbolTypes.Circle) {
                        layer.setRadius(r);
                    }
                    //calculate min and max values and -size
                    if (!opt.actualMaxYValue && !opt.actualMinYValue) {
                        opt.actualMinYValue = yVal;
                        opt.actualMaxYValue = yVal;
                        opt.actualMaxY = r;
                        opt.actualMinY = r;

                    }
                    else {
                        if (yVal > opt.actualMaxYValue) {
                            opt.actualMaxY = r;
                            opt.actualMaxYValue = yVal;
                        }
                        if (yVal < opt.actualMinY) {
                            opt.actualMinY = r;
                            opt.actualMinYValue = yVal;
                        }

                    }
                }
            });
        }

        function makePieChart(options) {
            if (!options.data || !options.valueFunc) {
                return '';
            }
            let data = options.data,
                valueFunc = options.valueFunc,
                r = options.outerRadius ? options.outerRadius : 28,
                rInner = options.innerRadius ? options.innerRadius : r - 10,
                strokeWidth = options.strokeWidth ? options.strokeWidth : 1,
                pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function(d) { return d.data.feat + ': ' + d.data.val }, //Title for each path
                pieLabel = options.pieLabel ? options.pieLabel : '', //Label for the whole pie
                pathFillFunc = options.pathFillFunc,

                origo = (r + strokeWidth), //Center coordinate
                w = origo * 2, //width and height of the svg element
                h = w,
                donut = d3.layout.pie(),
                arc = options.fullCircle ? d3.svg.arc().outerRadius(r) : d3.svg.arc().innerRadius(rInner).outerRadius(r);

            //Create an svg element
            let svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
            //Create the pie chart
            let vis = d3.select(svg)
                .data([data])
                .attr('width', w)
                .attr('height', h);

            let arcs = vis.selectAll('g.arc')
                .data(donut.value(valueFunc))
                .enter().append('svg:g')
                .attr('class', 'arc')
                .attr('transform', 'translate(' + origo + ',' + origo + ')');

            arcs.append('svg:path')
                .attr('fill', pathFillFunc)
                .attr('stroke', '#2b262a')
                .attr('stroke-width', strokeWidth)
                .attr('d', arc)
                .append('svg:title')
                .text(pathTitleFunc);

            vis.append('text')
                .attr('x', origo)
                .attr('y', origo)
                .attr('text-anchor', 'middle')
                //.attr('dominant-baseline', 'central')
                /*IE doesn't seem to support dominant-baseline, but setting dy to .3em does the trick*/
                .attr('dy', '.3em')
                .text(pieLabel);
            //Return the svg-markup rather than the actual element
            if (typeof (window as any).XMLSerializer != "undefined") {
                return (new (window as any).XMLSerializer()).serializeToString(svg);
            } else if (typeof (svg as any).xml != "undefined") {
                return (svg as any).xml;
            }
            return "";
        }

    }



    /**
     * createChoroplethLayer - Create a new choropleth layer by leaflet-choropleth.js
     *
     * @param  layerData    the data containing the GeoJSON string and the color variable
     * @return {L.GeoJSON}  the GeoJSON layer coloured according to the visOptions
     */
    createChoroplethLayer(layerData: ILayerData) {
        let opts = layerData.visOptions.colorOptions;
        if (opts.choroplethField === '') {
            layerData.headers.map(function(h) {
                if (h.type == 'number') {
                    opts.choroplethField = h.label;
                }
            })
            if (opts.choroplethField === '')
                opts.choroplethField = layerData.headers[0].label;
        }
        let values = (layerData.geoJSON as any).features.map(function(item) {
            return item.properties[opts.choroplethField];
        });
        if (!opts.limits)
            opts.limits = chroma.limits(values, opts.mode, opts.steps);
        if (!opts.colors)
            opts.colors = chroma.scale(opts.colorScheme).colors(opts.limits.length - 1);
        let style = function(feature) {

            return {
                fillOpacity: opts.fillOpacity,
                opacity: opts.opacity,
                fillColor: this.getChoroplethColor(opts.limits, opts.colors, feature.properties[opts.choroplethField]),
                color: opts.color,
                weight: 1,
            }
        }

        let options: L.GeoJSONOptions = {
            pointToLayer: layerData.visOptions.pointToLayer.bind(this),
            onEachFeature: layerData.visOptions.onEachFeature ? layerData.visOptions.onEachFeature : this.defaultVisOptions.onEachFeature,
            style: style.bind(this),
        }

        return L.geoJson(layerData.geoJSON, options);
    }

    getChoroplethColor(limits: any[], colors: string[], value: number) {
        if (!isNaN(value)) {
            for (var i = 0; i < limits.length; i++) {
                if (value === limits[limits.length - 1]) { //color the last item correctly
                    return colors[colors.length - 1]
                }
                if (limits[i] <= value && value <= limits[i + 1]) {
                    return colors[i];
                }
            }
        }
    }


    createHeatLayer(layerData: ILayerData) {
        let arr: number[][] = [];
        let max = 0;
        layerData.geoJSON.features.map(function(feat) {
            let pos = [];

            let heatVal = feat.properties[layerData.heatMapVariable];
            if (heatVal > max)
                max = heatVal;
            pos.push(feat.geometry.coordinates[1]);
            pos.push(feat.geometry.coordinates[0]);
            if (layerData.heatMapVariable) { pos.push(heatVal / max) };
            arr.push(pos);
        });
        return L.heatLayer(arr, { relative: true })
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
     * saveFilter - Creates a new filter or updates an existing one
     *
     * @param  info   The IFilter description of the new filter
     * @param  layerUpdate   Was the update triggered by layer refresh? If so, do not reset filter
     */
    saveFilter(info: IFilter, layerUpdate: boolean = false) {
        let layerData = this.state.layers.filter((lyr) => { return lyr.id === info.layerDataId })[0];
        let filters: IFilter[] = this.state.filters;
        if (layerData.visOptions.symbolOptions.symbolType === SymbolTypes.Chart || layerData.visOptions.symbolOptions.symbolType === SymbolTypes.Icon)
            info.remove = true; //force removal if type requires it
        let id;
        if (info.id != -1) { //existing filter being updated
            id = info.id;
            filters = filters.filter((f) => { return f.id !== id });
        }
        else {
            id = _currentFilterId++;
        }
        let filterValues: { [index: number]: L.ILayer[] };
        if (info.id !== -1 && !layerUpdate) {

            this.filterLayer(info.id, info.currentMin, info.currentMax); //hack-ish way to make sure that all of the layers are displayed after update
        }
        filterValues = {}
        if (layerData.layerType !== LayerTypes.HeatMap) {
            layerData.layer.eachLayer(function(layer) {
                let val = (layer as any).feature.properties[info.fieldToFilter];
                if (filterValues[val])
                    filterValues[val].push(layer);
                else
                    filterValues[val] = [layer];
            });
        }
        filters.push(
            {
                id: id,
                title: info.title,
                layerDataId: info.layerDataId,
                filterValues: filterValues,
                fieldToFilter: info.fieldToFilter,
                currentMin: info.currentMin,
                currentMax: info.currentMax,
                totalMin: info.totalMin,
                totalMax: info.totalMax,
                steps: info.steps,
                filteredIndices: [],
                remove: info.remove,
            });
        this.setState({
            filters: filters,
            importWizardShown: this.state.importWizardShown,
            menuShown: this.state.menuShown,
        });
        return id;

    }

    /**
     * deleteFilter - Removes a filter from the map
     *
     * @param  id  The id of the layer to delete
     */
    deleteFilter(id: number) {
        let filterToDelete = this.state.filters.filter(function(f) { return f.id === id })[0];
        this.filterLayer(id, filterToDelete.totalMin, filterToDelete.totalMax); //reset filter
        let filters = this.state.filters.filter(function(f) { return f.id !== id });
        this.setState({
            filters: filters,
        });
    }

    /**
     * filterLayer - Remove or show items based on changes on a filter
     *
     * @param  id   The filter to change
     * @param  lowerLimit Current minimum value. Hide every value below this
     * @param  upperLimit Current max value. Hide every value above this
     */
    filterLayer(filterId: number, lowerLimit: any, upperLimit: any) {
        let filter: IFilter = this.state.filters.filter((f) => { return f.id === filterId })[0];
        filter.currentMin = lowerLimit;
        filter.currentMax = upperLimit;
        let layerData: ILayerData = this.state.layers.filter((lyr) => { return lyr.id === filter.layerDataId })[0];
        if (layerData.layerType !== LayerTypes.HeatMap) {
            for (let val in filter.filterValues) {
                let filteredIndex = filter.filteredIndices.indexOf(+val); //is filtered?
                if (filteredIndex === -1 && (val < lowerLimit || val > upperLimit)) { //If not yet filtered and values over thresholds
                    filter.filterValues[val].map(function(lyr) {
                        if (filter.remove)
                            layerData.layer.removeLayer(lyr);
                        else {

                            if (layerData.visOptions.symbolOptions.symbolType === SymbolTypes.Rectangle) { //for divIcons - replace existing with a copy with new opacity
                                let icon = (lyr as any).options.icon;
                                let html = icon.options.html.replace('opacity:' + layerData.visOptions.colorOptions.fillOpacity + ';', 'opacity:0.2;');

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
                                if (layerData.visOptions.symbolOptions.symbolType === SymbolTypes.Rectangle) {
                                    let icon = (lyr as any).options.icon;
                                    let html = icon.options.html.replace('opacity:0.2;', 'opacity:' + layerData.visOptions.colorOptions.fillOpacity + ';');

                                    icon.options.html = html;
                                    (lyr as any).setIcon(icon);
                                }
                                else {
                                    (lyr as any).setStyle({ fillOpacity: layerData.visOptions.colorOptions.fillOpacity, opacity: layerData.visOptions.colorOptions.opacity });
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


        /**
         * shouldLayerBeAdded - Checks every active filter to see if a layer can be un-filtered
         *
         * @return {type}  description
         */
        function shouldLayerBeAdded(layer) {
            let filters: IFilter[] = this.state.filters.filter((f) => { return f.id !== filterId });
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
        for (let key in this.state.filters) {
            arr.push(<Filter
                id = {this.state.filters[key].id}
                title={this.state.filters[key].title}
                valueChanged={this.filterLayer.bind(this) }
                key={key} maxValue={this.state.filters[key].totalMax}
                minValue={this.state.filters[key].totalMin}
                steps={this.state.filters[key].steps}/>)
        }
        return arr;
    }


    legendPropsChanged(legend: ILegend) {
        this.setState({
            legend: legend,
            menuShown: this.state.menuShown,
            importWizardShown: this.state.importWizardShown,
        })
    }

    showLegend() {
        if (this.state.legend && this.state.legend.visible) {
            return <Legend
                title={this.state.legend.title}
                meta ={this.state.legend.meta}
                mapLayers={this.state.layers}
                horizontal={this.state.legend.horizontal}
                showPercentages={this.state.legend.showPercentages}/>

        }
    }

    saveImage(options: IExportMenuStates) {
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
        let saveLayers: ILayerSaveData[] = [];
        for (let i of this.state.layers) {
            let lyr: ILayerSaveData = {
                id: i.id,
                layerName: i.layerName,
                layerType: i.layerType,
                headers: i.headers,
                visOptions: i.visOptions,
                heatMapVariable: i.heatMapVariable,
                //topoJSON: topojson.topology(i.geoJSON),
                geoJSON: i.geoJSON,


            }
            saveLayers.push(lyr)
        }
        let filters: IFilter[] = [];
        for (let i of this.state.filters) {
            let filter: IFilter = {
                id: i.id,
                title: i.title,
                layerDataId: i.layerDataId,
                fieldToFilter: i.fieldToFilter,
                currentMax: i.currentMax,
                currentMin: i.currentMin,
                totalMax: i.totalMax,
                totalMin: i.totalMin,
                steps: i.steps,
                remove: i.remove,
                filteredIndices: i.filteredIndices,
            }
            filters.push(filter)
        }
        let saveData: ISaveData = {
            layers: saveLayers,
            legend: this.state.legend,
            filters: filters,

        };
        let blob = new Blob([JSON.stringify(saveData)], { type: "text/plain;charset=utf-8" });
        (window as any).saveAs(blob, 'map.mapify');
    }

    loadSavedMap(saveData: ISaveData) {
        for (let i in saveData.layers) {
            this.reloadLayer(saveData.layers[i], true)

        }
        this.setState({
            welcomeShown: false,
            menuShown: true,
            legend: saveData.legend,
            filters: saveData.filters,
        })
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
                    isOpen={this.state.welcomeShown}
                    style = {modalStyle}>
                    <WelcomeScreen
                        loadMap={this.loadSavedMap.bind(this) }
                        openLayerImport={this.startLayerImport.bind(this) }
                        />
                </Modal>
                <Modal
                    isOpen={this.state.importWizardShown}
                    style = {modalStyle}>
                    <LayerImportWizard
                        submit={this.layerImportSubmit.bind(this) }
                        cancel={this.cancelLayerImport.bind(this) }

                        />
                </Modal>
                <MapifyMenu
                    layers = {this.state.layers}
                    filters={this.state.filters}
                    refreshMap={this.reloadLayer.bind(this) }
                    addLayer = {this.addNewLayer.bind(this) }
                    deleteLayer={this.deleteLayer.bind(this) }
                    saveFilter ={this.saveFilter.bind(this) }
                    deleteFilter={this.deleteFilter.bind(this) }
                    changeLayerOrder ={this.changeLayerOrder.bind(this) }
                    legendStatusChanged = {this.legendPropsChanged.bind(this) }
                    visible={this.state.menuShown}
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
ReactDOM.render(
    <Map/>, document.getElementById('content')
);
