import * as React from 'react';
let Draggable = require('react-draggable');
import {SymbolTypes} from '../common_items/common';

export class Legend extends React.Component<IOnScreenLegendProps, {}>{

    shouldComponentUpdate(nextProps: IOnScreenLegendProps, nextState: {}) {
        return nextProps.title !== this.props.title ||
            nextProps.meta !== this.props.meta ||
            nextProps.mapLayers !== this.props.mapLayers ||
            nextProps.horizontal !== this.props.horizontal ||
            nextProps.showPercentages !== this.props.showPercentages;
    }
    createChoroplethLegend(options: IVisualizationOptions, percentages) {
        let divs = [];
        let limits = options.colorOptions.limits;
        let colors = options.colorOptions.colors;
        for (let i = 0; i < limits.length - 1; i++) {
            let colorStyle = {
                background: colors[i],
                opacity: options.colorOptions.fillOpacity,
                minWidth: '20px',
                minHeight: '20px',
            }

            divs.push(<div key={i} style={{ display: this.props.horizontal ? 'initial' : 'flex' }}>
                <div style={colorStyle} />

                <span style={{ marginLeft: '3px', marginRight: '3px' }}>

                    {limits[i].toFixed(0) + '-'} {this.props.horizontal ? <br/> : '' } {limits[i + 1].toFixed(0) }
                    {this.props.showPercentages ? <br/> : null}
                    {this.props.showPercentages ? percentages[i] ? percentages[i] + '%' : '0%' : null}
                </span>

            </div >);
        }
        return <div style={{ margin: '5px', float: 'left', textAlign: 'center' }}>
            { options.colorOptions.choroplethField }
            <div style= {{ display: 'flex', flexDirection: this.props.horizontal ? 'row' : 'column', flex: '1' }}>
                { divs.map(function(d) { return d }) }
            </div >
        </div >;
    }

    createScaledSizeLegend(options: IVisualizationOptions) {
        let symbolType = options.symbolOptions.symbolType;
        let opt = options.symbolOptions;
        let xVar = opt.sizeXVar;
        let yVar = opt.sizeYVar;
        let square = xVar && yVar && xVar === yVar;

        let style = {
            float: 'left',
            margin: 5,
            clear: this.props.horizontal ? 'both' : ''
        }
        if (symbolType === SymbolTypes.Circle) {
            return circleLegend.call(this);
        }
        else if (symbolType === SymbolTypes.Rectangle) {

            if (square)
                return (<div style={style}>
                    {rectangleLegend.call(this, false) }
                </div>);
            else {
                return (
                    <div style={style}>
                        { xVar ? rectangleLegend.call(this, false) : null }
                        {yVar ? rectangleLegend.call(this, true) : null }
                    </div>);
            }
        }

        function rectangleLegend(y: boolean) {

            let divs = [], sides = [], values = [];
            let classes: number = 5;
            for (let i = 0; i < classes - 1; i++) {
                sides[i] = y ? Math.round(opt.actualMinY + i * ((opt.actualMaxY - opt.actualMinY) / classes)) : Math.round(opt.actualMinX + i * ((opt.actualMaxX - opt.actualMinX) / classes));
                values[i] = y ? (opt.actualMinYValue + i * ((opt.actualMaxYValue - opt.actualMinYValue) / classes)).toFixed(0) : (opt.actualMinXValue + i * ((opt.actualMaxXValue - opt.actualMinXValue) / classes)).toFixed(0);
            }
            sides.push(y ? opt.actualMaxY : opt.actualMaxX);
            values.push(y ? opt.actualMaxYValue.toFixed(0) : opt.actualMaxXValue.toFixed(0));
            let textWidth = values[values.length - 1].length;

            for (let i = 0; i < classes; i++) {
                let margin = (sides[sides.length - 1] - sides[i]) / 2;
                let l = sides[i];
                let style = {
                    width: square ? l : y ? 10 : l,
                    height: square ? l : y ? l : 10,
                    backgroundColor: options.colorOptions.fillColor,
                    display: this.props.horizontal ? '' : 'inline-block',
                    border: '1px solid gray',
                    marginLeft: this.props.horizontal || y ? 'auto' : margin, //center values
                    marginRight: this.props.horizontal || y ? 'auto' : margin, //center values
                    marginTop: this.props.horizontal && y ? margin : 'auto',
                    marginBottom: this.props.horizontal && y ? margin : 'auto',
                }

                let parentDivStyle = {
                    float: this.props.horizontal ? 'left' : '',
                    marginRight: this.props.horizontal ? 5 : 0,
                }
                divs.push(
                    <div key={i} style={parentDivStyle}>
                        <div style={style} />
                        <span style={{ display: 'inline-block', width: this.props.horizontal ? '' : textWidth * 10 }}>{ values[i]}</span>
                    </div >);
            }

            return <div style= {{ float: this.props.horizontal ? '' : 'left', textAlign: 'center' }}>
                {y ? options.symbolOptions.sizeYVar : options.symbolOptions.sizeXVar}
                <div>
                    {divs.map(function(d) { return d }) }
                </div>
            </div>;
        }

        function circleLegend() {
            let divs = [], radii = [], values = [];
            let classes: number = 5;
            for (let i = 0; i < classes - 1; i++) {
                radii[i] = Math.round(opt.actualMinX + i * ((opt.actualMaxX - opt.actualMinX) / classes));
                values[i] = (opt.actualMinXValue + i * ((opt.actualMaxXValue - opt.actualMinXValue) / classes)).toFixed(0);
            }
            radii.push(opt.actualMaxX);
            values.push(opt.actualMaxXValue.toFixed(0));
            for (let i = 0; i < classes; i++) {
                let margin = radii[radii.length - 1] - radii[i] + 2;
                let l = 2 * radii[i];
                let style = {
                    width: l,
                    height: l,
                    backgroundColor: options.colorOptions.fillColor,
                    float: this.props.horizontal ? '' : 'left',
                    border: '1px solid gray',
                    borderRadius: '50%',
                    marginLeft: this.props.horizontal ? 2 : margin, //center values
                    marginRight: this.props.horizontal ? 2 : margin, //center values
                    marginTop: this.props.horizontal ? margin : 2,
                    marginBottom: this.props.horizontal ? margin : 2,
                }
                let parentDivStyle = {
                    float: this.props.horizontal ? 'left' : '',
                    minHeight: '15px',
                    overflow: this.props.horizontal ? 'none' : 'auto',
                    lineHeight: this.props.horizontal ? '' : Math.max(2 * radii[i] + 4, 15) + 'px',

                }
                divs.push(
                    <div key={i} style={parentDivStyle}>
                        <div style={style} />
                        <span style={{ marginRight: this.props.horizontal ? 15 : '' }}>{ values[i]}</span>
                    </div>);
            }

            return <div style= {{ float: this.props.horizontal ? '' : 'left', textAlign: 'center' }}>
                {options.symbolOptions.sizeXVar}
                <div>
                    {divs.map(function(d) { return d }) }
                </div>
            </div>;
        }

    }

    createChartSymbolLegend(options: ISymbolOptions) {
        let divs = [];
        let headers = options.chartFields;
        let colors = ['#6bbc60', '#e2e236', '#e28c36', '#36a6e2', '#e25636', '#36e2c9', '#364de2', '#e236c9', '#51400e', '#511f0e', '#40510e'];

        for (let i = 0; i < headers.length; i++) {
            let colorStyle = {
                background: colors[i],
                minWidth: '20px',
                minHeight: '20px',
            }
            divs.push(<div key={i} style={{ display: this.props.horizontal ? 'initial' : 'flex' }}>
                <div style={colorStyle} />
                <span style={{ marginLeft: '3px', marginRight: '3px' }}>
                    { headers[i].label}
                </span>
            </div >);
        }
        return <div style={{ margin: '5px', float: 'left' }}>
            <div style= {{ display: 'flex', flexDirection: this.props.horizontal ? 'row' : 'column', flex: '1' }}>
                { divs.map(function(d) { return d }) }
            </div >
        </div >;
    }
    createIconLegend(options: IVisualizationOptions, percentages, layerName: string) {
        let divs = [];
        let limits = options.symbolOptions.iconLimits;
        let icons: IIcon[] = options.symbolOptions.icons;
        let col = options.colorOptions;
        if (limits && limits.length > 0) {
            for (let i = 0; i < limits.length - 1; i++) {

                divs.push(<div key={i} style={{ display: this.props.horizontal ? 'initial' : 'flex' }}>
                    {getIcon(icons[i].shape, icons[i].fa, col.color, col.choroplethField === options.symbolOptions.iconField ? col.colors[i] : col.fillColor, options.colorOptions.iconTextColor) }
                    <span style={{ marginLeft: '3px', marginRight: '3px' }}>
                        {limits[i].toFixed(0) + '-'} {this.props.horizontal ? <br/> : '' } {limits[i + 1].toFixed(0) }
                        {this.props.showPercentages ? <br/> : null}
                        {this.props.showPercentages ? percentages[i] ? percentages[i] + '%' : '0%' : null}
                    </span>
                </div >);
            }
            return <div style={{ margin: '5px', float: 'left', textAlign: 'center' }}>
                { options.symbolOptions.iconField }
                <div style= {{ display: 'flex', flexDirection: this.props.horizontal ? 'row' : 'column', flex: '1' }}>
                    { divs.map(function(d) { return d }) }
                </div >
            </div >;
        }
        else {
            return <div style={{ margin: '5px', float: 'left', textAlign: 'center' }}>
                { layerName}
                <div style= {{ display: 'flex', flexDirection: this.props.horizontal ? 'row' : 'column', flex: '1' }}>
                    {getIcon(icons[0].shape, icons[0].fa, options.colorOptions.color, options.colorOptions.fillColor, options.colorOptions.iconTextColor) }
                </div >
            </div >;
        }
        function getIcon(shape: string, fa: string, stroke: string, fill: string, iconColor: string) {
            let circleIcon =
                <svg viewBox="0 0 69.529271 95.44922" height="40" width="40">
                    <g transform="translate(-139.52 -173.21)">
                        <path fill={fill} stroke={stroke} d="m174.28 173.21c-19.199 0.00035-34.764 15.355-34.764 34.297 0.007 6.7035 1.5591 12.813 5.7461 18.854l0.0234 0.0371 28.979 42.262 28.754-42.107c3.1982-5.8558 5.9163-11.544 6.0275-19.045-0.0001-18.942-15.565-34.298-34.766-34.297z"/>
                    </g>

                </svg>;
            let squareIcon =
                <svg viewBox="0 0 69.457038 96.523441" height="40" width="40">
                    <g transform="translate(-545.27 -658.39)">
                        <path fill={fill} stroke={stroke} d="m545.27 658.39v65.301h22.248l12.48 31.223 12.676-31.223h22.053v-65.301h-69.457z"/>
                    </g>
                </svg>
            let starIcon =
                <svg height="40" width="40" viewBox="0 0 77.690999 101.4702"><g transform="translate(-101.15 -162.97)">
                    <g transform="matrix(1 0 0 1.0165 -65.712 -150.28)">
                        <path  fill={fill} stroke={stroke} d="m205.97 308.16-11.561 11.561h-16.346v16.346l-11.197 11.197 11.197 11.197v15.83h15.744l11.615 33.693 11.467-33.568 0.125-0.125h16.346v-16.346l11.197-11.197-11.197-11.197v-15.83h-15.83l-11.561-11.561z"/></g>
                </g>
                </svg>
            let pentaIcon =
                <svg viewBox="0 0 71.550368 96.362438" height="40" width="40">
                    <g fill={fill} transform="translate(-367.08 -289.9)">
                        <path stroke={stroke} d="m367.08 322.5 17.236-32.604h36.151l18.164 32.25-35.665 64.112z"/></g>
                </svg>
            let activeIcon;
            switch (shape) {
                case ('circle'):
                    activeIcon = circleIcon;
                    break;
                case ('square'):
                    activeIcon = squareIcon;
                    break;
                case ('star'):
                    activeIcon = starIcon;
                    break;
                case ('penta'):
                    activeIcon = pentaIcon;
            }
            return <div
                style={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    color: iconColor,
                    width: 42,
                    height: 42,
                }}
                >
                {activeIcon}
                <i style={{ position: 'relative', bottom: 33, width: 18, height: 18 }} className={'fa ' + fa}/>
            </div>

        }
    }
    createNormalLegend(options: IVisualizationOptions) {

    }
    getStepPercentages(geoJSON: any, field: string, limits: number[]) {
        let counts: { [stepId: number]: number } = {};
        let totalCount = geoJSON.features.length;
        geoJSON.features.map(function(feat) {

            let val = feat.properties[field];
            for (let i in limits) {
                if (val <= limits[+i + 1]) {
                    if (counts[i]) {
                        counts[i]++;
                    }
                    else {
                        counts[i] = 1;
                    }
                    break;
                }
            }

        });

        for (let i in counts) {
            counts[i] = +(counts[i] / totalCount * 100).toFixed(2);
        }
        return counts;
    }
    createLegend(layer: ILayerData) {
        let choroLegend, scaledLegend, chartLegend, iconLegend, normalLegend;
        let options = layer.visOptions;
        let col = options.colorOptions;
        let sym = options.symbolOptions;
        if (col.colors && col.colors.length !== 0 && (sym.symbolType !== SymbolTypes.Icon || sym.iconField !== col.choroplethField)) {
            let percentages = this.props.showPercentages ? this.getStepPercentages(layer.geoJSON, col.choroplethField, col.limits) : {};
            choroLegend = this.createChoroplethLegend(options, percentages);
        }
        if (sym.symbolType === SymbolTypes.Chart) {
            chartLegend = this.createChartSymbolLegend(sym);
        }
        if (sym.sizeXVar || sym.sizeYVar) {
            scaledLegend = this.createScaledSizeLegend(options);
        }
        if (sym.symbolType === SymbolTypes.Icon) {
            let percentages = this.props.showPercentages && sym.iconLimits.length > 1 ? this.getStepPercentages(layer.geoJSON, sym.iconField, sym.iconLimits) : {};
            iconLegend = this.createIconLegend(options, percentages, layer.layerName);
        }
        if (!choroLegend && !scaledLegend) {
            normalLegend = this.createNormalLegend(options);
        }

        return <div key={layer.id}>
            {choroLegend}
            {scaledLegend}
            {chartLegend}
            {iconLegend}
        </div>
    }
    render() {
        return (
            <Draggable
                handle={'.dragOverlay'}
                bounds={'parent'}
                >
                <div className='legend' style={{
                    width: 'auto',
                    textAlign: 'center'
                }}>
                    <h2 className='draggableHeader legendHeader'>{this.props.title}</h2>
                    <div>
                        {this.props.mapLayers.map(function(m) {
                            return this.createLegend(m);
                        }, this) }
                    </div>
                    <p style={{ clear: 'both', maxWidth: this.props.horizontal ? 500 : 200 }}>{this.props.meta}</p>
                    <div className='dragOverlay' style={
                        {
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%'
                        }
                    }/>
                </div >


            </Draggable >
        );
    }
}
