import {observable, computed} from 'mobx';
import {LayerTypes, SymbolTypes, GetSymbolSize} from '../common_items/common';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
let d3 = require('d3');
let mobx = require('mobx');
let reactDOMServer = require('react-dom/server');
let chroma = require('chroma-js');


export class Layer {

    constructor(map: L.Map) {
        this.map = map;
        mobx.autorun(() => this.refresh());
    }
    /** The unique identification. Is used for example to delete items*/
    id: number;
    /** The name of the layer. Will be shown in the UI*/
    @observable layerName: string;
    /** The GeoJSON representation of the data.*/
    @observable geoJSON: { features: any[], type: string };
    /** The type of the layer. Will affect the options available.*/
    @observable layerType: LayerTypes;
    /** The data property names.*/
    @observable headers: IHeader[] = [];

    @computed get numberHeaders() {
        return this.headers.filter(function(val) { return val.type === 'number' });
    }

    @observable popupHeaders: IHeader[] = [];
    /** The variable by which to create the heat map*/
    @observable heatMapVariable: string;
    /** The Leaflet layer. Will be modified by changing options*/
    layer: any;
    /** The function to run on every feature of the layer. Is used to place pop-ups to map features */
    onEachFeature: (feature: any, layer: L.GeoJSON) => void = addPopupsToLayer;
    /** The function to convert a geojson point to a layer. Is used in symbol maps ie. to convert a point to a circle marker */
    pointToLayer: (featureData: any, latlng: L.LatLng) => any = function(feature, latlng: L.LatLng) {
        return L.circleMarker(latlng, this.colorOptions)
    }.bind(this);
    /** The coloring options of the layer. Contains ie. border color and opacity */
    @observable colorOptions: ColorOptions = new ColorOptions();
    /**  The symbol options for symbol layers. Contains ie. symbol type  */
    @observable symbolOptions: SymbolOptions = new SymbolOptions();

    map: L.Map;

    refresh() {

        if (this.layer)
            this.map.removeLayer(this.layer);

        //let filter = state.filters.filter((f) => { return f.layerId === this.id })[0];

        if (this.geoJSON) {
            let col = this.colorOptions;
            let sym = this.symbolOptions;
            if (this.layerType !== LayerTypes.HeatMap) {
                if (this.layerType === LayerTypes.SymbolMap) {
                    //if needs to scale and is of scalable type
                    if (sym.sizeXVar || sym.sizeYVar && (sym.symbolType === SymbolTypes.Circle || sym.symbolType === SymbolTypes.Rectangle || sym.symbolType === SymbolTypes.Blocks)) {
                        getMaxValues(this);
                    }
                }

                this.pointToLayer = (function(feature, latlng: L.LatLng) {
                    let fillColor = col.colors.slice().length == 0 ? col.fillColor : getChoroplethColor(col.limits, col.colors, feature.properties[col.colorField]);
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
                    return L.circleMarker(latlng, col);
                });
            }
            if (this.layerType === LayerTypes.HeatMap) {
                this.layer = createHeatLayer(this);
            }
            else if (this.layerType === LayerTypes.ChoroplethMap || col.colors.slice().length > 0) {
                this.layer = createChoroplethLayer(this);
            }
            else if (this.layerType === LayerTypes.SymbolMap) {
                this.layer = L.geoJson(this.geoJSON, this);
            }

            if (this.layerType === LayerTypes.SymbolMap && sym.symbolType === SymbolTypes.Circle && sym.sizeXVar) {
                setCircleMarkerRadius(this);
            }
        }
        // let currentIndex = state.layers.map(function(e) { return e.id; }).indexOf(this.id);
        //
        // state.layers[currentIndex == -1 ? 0 : currentIndex] = layer;
        // if (filter)
        //     this.saveFilter(filter, true);

        if (this.layer) {
            this.layer.addTo(this.map);
            this.map.fitBounds(this.layerType === LayerTypes.HeatMap ? (this.layer as any)._latlngs : this.layer.getBounds()); //leaflet.heat doesn't utilize getBounds, so get it directly
        }
    }
}

export class ColorOptions implements L.PathOptions {
    /** If not empty, use choropleth coloring */
    @observable colorField: string;
    /** Is the scale user-made?*/
    @observable useCustomScheme: boolean;
    /** Color name array to use in choropleth*/
    @observable colors: string[] = [];
    /** Value array to use in choropleth*/
    @observable limits: number[] = [];
    /** The color scheme name to use in choropleth. Default black-white*/
    @observable colorScheme: string = 'Greys';
    /** The amount of colors to use in choropleth. Default 5*/
    @observable steps: number = 5;
    /** Is the scheme reversed. This is used only to keep the menu selection synced with map*/
    @observable revert: boolean;
    /** The Chroma-js method to calculate colors. Default q->quantiles*/
    @observable mode: string = 'q';
    /** The color of the icon in symbol maps. Default white */
    @observable iconTextColor: string = '#FFF';
    /** Main fill color. Default yellow*/
    @observable fillColor: string = '#E0E62D';
    /** Border color. Default black*/
    @observable color: string = '#000';
    /** Main opacity. Default 0.8*/
    @observable fillOpacity: number = 0.8;
    /** Border opacity. Default 0.8*/
    @observable opacity: number = 0.8;

    @observable useMultipleFillColors: boolean;

}

export class SymbolOptions {
    /** The type of the symbol. Default circle*/
    @observable symbolType: SymbolTypes = SymbolTypes.Circle;
    /** The list of icons to use. Default: one IIcon with shape='circle' and fa='anchor'*/
    @observable icons: IIcon[] = [{ shape: 'circle', fa: 'fa-anchor' }];

    /** Name of the field by which to calculate icon values*/
    @observable iconField: string;
    /** The steps of the field values by which to choose the icons */
    @observable iconLimits: number[] = [];
    /** The name of the field to scale size x-axis by*/
    @observable sizeXVar: string;
    /** The name of the field to scale size y-axis by*/
    @observable sizeYVar: string;
    /** The minimum allowed size when scaling*/
    @observable sizeLowLimit: number;
    /** The maximum allowed size when scaling*/
    @observable sizeUpLimit: number;
    /** The multiplier to scale the value by*/
    @observable sizeMultiplier: number;
    /** Currently selected chart fields*/
    @observable chartFields: IHeader[] = [];
    /** The type of chart to draw*/
    @observable chartType: 'pie' | 'donut';
    /** How many units does a single block represent*/
    @observable blockValue: number;
    /** If symbol is of scalable type; the minimum of all the x-values being calculated. Is used in the legend */
    @observable actualMinXValue: number;
    /** If symbol is of scalable type; the minimum of all the y-values being calculated. Is used in the legend */
    @observable actualMinYValue: number;
    /** If symbol is of scalable type; the minimum of all the x(pixels) being calculated. Is used in the legend */
    @observable actualMinX: number;
    /** If symbol is of scalable type; the minimum of all the y(pixels) being calculated. Is used in the legend */
    @observable actualMinY: number;
    /** If symbol is of scalable type; the maximum of all the x-values being calculated. Is used in the legend */
    @observable actualMaxXValue: number;
    /** If symbol is of scalable type; the maximum of all the y-values being calculated. Is used in the legend */
    @observable actualMaxYValue: number;
    /** If symbol is of scalable type; the maximum of all the x being calculated. Is used in the legend */
    @observable actualMaxX: number;
    /** If symbol is of scalable type; the maximum of all the y being calculated. Is used in the legend */
    @observable actualMaxY: number;
}

function setCircleMarkerRadius(layer: Layer) {
    let sym: SymbolOptions = layer.symbolOptions;
    (layer.layer as any).eachLayer(function(layer) {
        layer.setRadius(GetSymbolSize(layer.feature.properties[sym.sizeXVar], sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit));

    });
}

function getMaxValues(layer: Layer) {
    let sym: SymbolOptions = layer.symbolOptions;
    (layer.layer as any).eachLayer(function(layer) {
        let xVal = layer.feature.properties[sym.sizeXVar];
        let yVal = layer.feature.properties[sym.sizeYVar];
        let r = 10;
        if (sym.sizeXVar) {
            r = GetSymbolSize(xVal, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit);
            //calculate min and max values and -size
            if (!sym.actualMaxXValue && !sym.actualMinXValue) {
                sym.actualMinXValue = xVal;
                sym.actualMaxXValue = xVal;
                sym.actualMaxX = r;
                sym.actualMinX = r;

            }
            else {
                if (xVal > sym.actualMaxXValue) {
                    sym.actualMaxX = r;
                    sym.actualMaxXValue = xVal;
                }
                else if (xVal < sym.actualMinXValue) {
                    sym.actualMinX = r;
                    sym.actualMinXValue = xVal;
                }

            }
        }
        if (sym.sizeYVar) {
            r = GetSymbolSize(yVal, sym.sizeMultiplier, sym.sizeLowLimit, sym.sizeUpLimit);
            //calculate min and max values and -size
            if (!sym.actualMaxYValue && !sym.actualMinYValue) {
                sym.actualMinYValue = yVal;
                sym.actualMaxYValue = yVal;
                sym.actualMaxY = r;
                sym.actualMinY = r;

            }
            else {
                if (yVal > sym.actualMaxYValue) {
                    sym.actualMaxY = r;
                    sym.actualMaxYValue = yVal;
                }
                if (yVal < sym.actualMinY) {
                    sym.actualMinY = r;
                    sym.actualMinYValue = yVal;
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

function createHeatLayer(layerData: Layer) {
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
 * createChoroplethLayer - Create a new choropleth layer by leaflet-choropleth.js
 *
 * @param  layerData    the data containing the GeoJSON string and the color variable
 * @return {L.GeoJSON}  the GeoJSON layer coloured according to the visOptions
 */
function createChoroplethLayer(layer: Layer) {
    let opts = layer.colorOptions;
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
            fillColor: getChoroplethColor(opts.limits, opts.colors, feature.properties[opts.colorField]),
            color: opts.color,
            weight: 1,
        }
    }

    let options: L.GeoJSONOptions = {
        pointToLayer: layer.pointToLayer.bind(this),
        onEachFeature: layer.onEachFeature,
        style: style.bind(this),
    }

    return L.geoJson(layer.geoJSON, options);
}


function getChoroplethColor(limits: any[], colors: string[], value: number) {
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

/**
 * addPopupsToLayer - adds the feature details popup to layer
 *
 * @param   feature GeoJSON feature
 * @param   layer   layer to add popup to
 */
function addPopupsToLayer(feature, layer: L.GeoJSON) {
    var popupContent = '';
    for (var prop in feature.properties) {
        popupContent += prop + ": " + feature.properties[prop];
        popupContent += "<br />";
    }
    if (popupContent != '')
        layer.bindPopup(popupContent);
}
