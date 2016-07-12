declare var require: any;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {observer} from 'mobx-react';

import {AppState, ImportWizardState, Layer, VisualizationOptions, ColorOptions, SymbolOptions, SaveState} from './Stores';
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

let _map: L.Map;

L.Icon.Default.imagePath = 'app/images/leaflet-images';
const state = new AppState();
@observer
export class MapMain extends React.Component<{}, {}>{

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
        state.importWizardShown = true;
        state.welcomeShown = false;
    }

    cancelLayerImport() {
        state.importWizardShown = false;
        state.menuShown = true;
    }

    /**
     * layerImportSubmit - Layer importing was completed -> draw to map
     *
     * @param  {ILayerData} layerData contains layer name and GeoJSON object
     */
    layerImportSubmit(layerData: Layer) {
        let layer;
        let visOptions = new VisualizationOptions();

        visOptions.pointToLayer = function(feature, latlng: L.LatLng) {
            return L.circleMarker(latlng, visOptions.colorOptions)
        };
        visOptions.onEachFeature = this.addPopupsToLayer;
        layerData.visOptions = visOptions;// JSON.parse(JSON.stringify(visOptions));
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

        state.layers.push(layerData);
        state.importWizardShown = false;
        state.editingLayer = layerData;
        state.menuShown = true;
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
        for (let lyr of state.layers) {
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
        if (layer) {
            let filter = state.filters.filter((f) => { return f.layerId === layer.id })[0];
            let col = layer.visOptions.colorOptions;
            let sym = layer.visOptions.symbolOptions;
            if (!wasImported)
                _map.removeLayer(layer.layer);

            if (layer.layerType !== LayerTypes.HeatMap) {
                if (layer.layerType === LayerTypes.SymbolMap) {
                    //if needs to scale and is of scalable type
                    if (sym.sizeXVar || sym.sizeYVar && (sym.symbolType === SymbolTypes.Circle || sym.symbolType === SymbolTypes.Rectangle || sym.symbolType === SymbolTypes.Blocks)) {
                        getMaxValues(sym);
                    }
                }

                layer.visOptions.pointToLayer = (function(feature, latlng: L.LatLng) {
                    let fillColor = col.colors.slice().length == 0 ? col.fillColor : this.getChoroplethColor(col.limits, col.colors, feature.properties[col.colorField]);
                    let borderColor = col.color;
                    switch (sym.symbolType) {
                        case SymbolTypes.Icon:
                            let icon, shape, val;
                            for (let i in sym.iconLimits.slice()) {
                                if (+i !== sym.iconLimits.slice().length - 1) {
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
                                markerColor: fillColor,
                                svg: true,
                                svgBorderColor: borderColor,
                                svgOpacity: col.fillOpacity,
                                shape: shape ? shape : sym.icons[0].shape,
                                iconColor: col.iconTextColor,
                            });
                            return L.marker(latlng, { icon: customIcon });
                        case SymbolTypes.Rectangle:

                            let x: number = sym.sizeXVar ? GetSymbolSize(feature.properties[sym.sizeXVar], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 10;
                            let y: number = sym.sizeYVar ? GetSymbolSize(feature.properties[sym.sizeYVar], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 10;
                            let rectHtml = '<div style="height: ' + y + 'px; width: ' + x + 'px; opacity:' + col.opacity + '; background-color:' + fillColor + '; border: 1px solid ' + borderColor + '"/>';
                            let rectMarker = L.divIcon({ iconAnchor: L.point(feature.geometry[0], feature.geometry[1]), html: rectHtml, className: '' });
                            return L.marker(latlng, { icon: rectMarker });
                        case SymbolTypes.Chart:
                            let colors = ['#6bbc60', '#e2e236', '#e28c36', '#36a6e2', '#e25636', '#36e2c9', '#364de2', '#e236c9', '#51400e', '#511f0e', '#40510e'];
                            let vals = [];
                            let i = 0;
                            sym.chartFields.map(function(e) {
                                vals.push({ feat: e, val: feature.properties[e.value], color: colors[i] });
                                i++;
                            });
                            let radius = sym.sizeXVar ? GetSymbolSize(feature.properties[sym.sizeXVar], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit) : 30;
                            let chartHtml = makePieChart({
                                fullCircle: sym.chartType === 'pie',
                                data: vals,
                                valueFunc: function(d) { return d.val; },
                                strokeWidth: 1,
                                outerRadius: radius,
                                innerRadius: radius / 3,
                                pieClass: function(d) { return d.data.feat },
                                pathFillFunc: function(d) { return d.data.color },
                            });
                            let marker = L.divIcon({ iconAnchor: L.point(feature.geometry[0], feature.geometry[1]), html: chartHtml, className: '' });
                            return L.marker(latlng, { icon: marker });
                        case SymbolTypes.Blocks:
                            let side = Math.ceil(Math.sqrt(feature.properties[sym.sizeXVar] / sym.blockValue));
                            let blockCount = Math.ceil(feature.properties[sym.sizeXVar] / sym.blockValue);
                            let blockHtml = makeBlockSymbol(side, blockCount, fillColor, borderColor);
                            let blockMarker = L.divIcon({ iconAnchor: L.point(feature.geometry[0], feature.geometry[1]), html: blockHtml, className: '' });
                            return L.marker(latlng, { icon: blockMarker });
                    }

                    return L.circleMarker(latlng, layer.visOptions.colorOptions);
                });
            }
            let lyr;
            if (layer.layerType === LayerTypes.HeatMap) {
                lyr = this.createHeatLayer(layer);
            }
            else if (layer.layerType === LayerTypes.ChoroplethMap || col.colors.slice().length > 0) {
                debugger;

                lyr = this.createChoroplethLayer(layer);
            }
            else if (layer.layerType === LayerTypes.SymbolMap) {
                lyr = L.geoJson(layer.geoJSON, layer.visOptions);
            }

            lyr.addTo(_map);

            if (wasImported)
                _map.fitBounds(layer.layerType === LayerTypes.HeatMap ? (layer as any)._latlngs : lyr.getBounds()); //leaflet.heat doesn't utilize getBounds, so get it directly

            layer.layer = lyr;
            if (layer.layerType === LayerTypes.SymbolMap && sym.symbolType === SymbolTypes.Circle && sym.sizeXVar) {
                setCircleMarkerRadius(sym);
            }
            let currentIndex = state.layers.map(function(e) { return e.id; }).indexOf(layer.id);

            state.layers[currentIndex == -1 ? 0 : currentIndex] = layer;
            // if (filter)
            //     this.saveFilter(filter, true);
        }

        function setCircleMarkerRadius(sym: SymbolOptions) {
            (layer.layer as any).eachLayer(function(layer) {
                layer.setRadius(GetSymbolSize(layer.feature.properties[sym.sizeXVar], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit));

            });
        }

        function getMaxValues(opt: SymbolOptions) {
            (layer.layer as any).eachLayer(function(layer) {
                let xVal = layer.feature.properties[opt.sizeXVar];
                let yVal = layer.feature.properties[opt.sizeYVar];
                let r = 10;
                if (opt.sizeXVar) {
                    r = GetSymbolSize(xVal, opt.sizeMultiplier, opt.sizeLowLimit, opt.sizeUpLimit);
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

        function makeBlockSymbol(sideLength: number, blockAmount: number, fillColor: string, borderColor: string) {
            let arr = [];
            for (let i = sideLength; i > 0; i--) {

                arr.push(
                    <tr key={i}>
                        {getColumns.call(this, i).map(
                            function(column) {
                                return column;
                            })
                        }
                    </tr>
                );
            }

            function getColumns(i: number) {
                let columns = [];
                for (let c = 0; c < sideLength; c++) {
                    let style = {
                        width: 10,
                        height: 10,
                        backgroundColor: i + sideLength * c <= blockAmount ? fillColor : 'transparent',
                        margin: 0,
                        padding: 0,
                        border: i + sideLength * c <= blockAmount ? '1px solid ' + borderColor : '0px',
                    }
                    columns.push(<td style={style} key={i + c}/>);
                }
                return columns;
            }

            let table =
                <table style={{
                    width: 10 * sideLength,
                    borderCollapse: 'collapse'
                }}>
                    <tbody>
                        {arr.map(function(td) {
                            return td;
                        }) }
                    </tbody>
                </table>;
            return reactDOMServer.renderToString(table);
        }

    }



    /**
     * createChoroplethLayer - Create a new choropleth layer by leaflet-choropleth.js
     *
     * @param  layerData    the data containing the GeoJSON string and the color variable
     * @return {L.GeoJSON}  the GeoJSON layer coloured according to the visOptions
     */
    createChoroplethLayer(layer: Layer) {
        let opts = layer.visOptions.colorOptions;
        if (opts.colorField === '') {
            layer.headers.map(function(h) {
                if (h.type == 'number') {
                    opts.colorField = h.label;
                }
            })
            if (opts.colorField === '')
                opts.colorField = layer.headers[0].label;
        }
        let values = (layer.geoJSON as any).features.map(function(item) {
            return item.properties[opts.colorField];
        });
        if (!opts.limits)
            opts.limits = chroma.limits(values, opts.mode, opts.steps);
        if (!opts.colors)
            opts.colors = chroma.scale(opts.colorScheme).colors(opts.limits.length - 1);
        let style = function(feature) {

            return {
                fillOpacity: opts.fillOpacity,
                opacity: opts.opacity,
                fillColor: this.getChoroplethColor(opts.limits, opts.colors, feature.properties[opts.colorField]),
                color: opts.color,
                weight: 1,
            }
        }

        let options: L.GeoJSONOptions = {
            pointToLayer: layer.visOptions.pointToLayer.bind(this),
            onEachFeature: layer.visOptions.onEachFeature,
            style: style.bind(this),
        }

        return L.geoJson(layer.geoJSON, options);
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

    createHeatLayer(layerData: Layer) {
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
        state.importWizardShown = true;
        state.menuShown = false;
    }

    /**
     * deleteLayer - Removes a layer from the map and layer list
     *
     * @param  id   The unique id of the LayerInfo to remove
     */
    deleteLayer(id: number) {
        let layerInfo = this.getLayerInfoById(id);
        if (layerInfo) {
            state.layers = state.layers.filter((lyr) => { return lyr.id != id });
            _map.removeLayer(layerInfo.layer);
        }

    }


    /**
     * saveFilter - Creates a new filter or updates an existing one
     *
     * @param  layerUpdate   Was the update triggered by layer refresh? If so, do not reset filter
     */
    saveFilter(layerUpdate: boolean = false) {
        let filter = state.editingFilter;
        let layerData = state.layers.filter((lyr) => { return lyr.id === filter.layerId })[0];
        // if (layerData.visOptions.symbolOptions.symbolType === SymbolTypes.Chart || layerData.visOptions.symbolOptions.symbolType === SymbolTypes.Icon)
        //     info.remove = true; //force removal if type requires it
        // let id;
        // if (info.id != -1) { //existing filter being updated
        //     id = info.id;
        //     state.filters = state.filters.filter((f) => { return f.id !== id });
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
        let filterToDelete = state.filters.filter(function(f) { return f.id === id })[0];
        this.filterLayer(id, filterToDelete.totalMin, filterToDelete.totalMax); //reset filter
        state.filters = state.filters.filter(function(f) { return f.id !== id });

    }

    /**
     * filterLayer - Remove or show items based on changes on a filter
     *
     * @param  id   The filter to change
     * @param  lowerLimit Current minimum value. Hide every value below this
     * @param  upperLimit Current max value. Hide every value above this
     */
    filterLayer(filterId: number, lowerLimit: any, upperLimit: any) {
        let filter: IFilter = state.filters.filter((f) => { return f.id === filterId })[0];
        if (filter) {
            filter.currentMin = lowerLimit;
            filter.currentMax = upperLimit;
            let layerData: Layer = state.layers.filter((lyr) => { return lyr.id === filter.layerId })[0];
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
        }


        /**
         * shouldLayerBeAdded - Checks every active filter to see if a layer can be un-filtered
         *
         * @return {type}  description
         */
        function shouldLayerBeAdded(layer) {
            let filters: IFilter[] = state.filters.filter((f) => { return f.id !== filterId });
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
        if (state.filters.length > 0)
            for (let key in state.filters.slice()) {
                if (Object.keys(state.filters[key].filterValues).length !== 0) //if filter has been properly initialized
                    arr.push(<Filter
                        id = {state.filters[key].id}
                        title={state.filters[key].title}
                        valueChanged={this.filterLayer.bind(this) }
                        key={key} maxValue={state.filters[key].totalMax}
                        minValue={state.filters[key].totalMin}
                        steps={state.filters[key].steps}/>)
            }
        return arr;
    }


    legendPropsChanged(legend: ILegend) { //unnecessary?
        state.legend = legend;
    }

    showLegend() {
        if (state.legend && state.legend.visible) {
            return <Legend
                state={state}/>

        }
    }

    saveImage() {
        let options = state.exportMenuState;
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
            layers: state.layers,
            legend: state.legend,
            filters: state.filters,
        };
        let blob = new Blob([JSON.stringify(saveData)], { type: "text/plain;charset=utf-8" });
        (window as any).saveAs(blob, 'map.mapify');
    }

    loadSavedMap(saveData: SaveState) {
        for (let i in saveData.layers) {
            let lyr = saveData.layers[i];
            let newLayer = new Layer();
            newLayer.id = lyr.id;
            newLayer.layerName = lyr.layerName
            newLayer.headers = lyr.headers;
            newLayer.popupHeaders = lyr.popupHeaders;
            newLayer.geoJSON = lyr.geoJSON;
            newLayer.layerType = lyr.layerType;
            newLayer.heatMapVariable = lyr.heatMapVariable;
            newLayer.layer = lyr.layer;
            newLayer.visOptions = lyr.visOptions;

            this.reloadLayer(newLayer, true)
        }
        state.welcomeShown = false;
        state.editingLayer = state.layers[0];
        state.menuShown = true;
        state.legend = saveData.legend;
        state.filters = saveData.filters;

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
                    isOpen={state.welcomeShown}
                    style = {modalStyle}>
                    <WelcomeScreen
                        loadMap={this.loadSavedMap.bind(this) }
                        openLayerImport={this.startLayerImport.bind(this) }
                        />
                </Modal>
                <Modal
                    isOpen={state.importWizardShown}
                    style = {modalStyle}>
                    <LayerImportWizard
                        state={new ImportWizardState() }
                        submit={this.layerImportSubmit.bind(this) }
                        cancel={this.cancelLayerImport.bind(this) }

                        />
                </Modal>
                <MapifyMenu
                    state = {state}
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
ReactDOM.render(
    <Map/>, document.getElementById('content')
);
