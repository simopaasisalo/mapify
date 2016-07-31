import * as React from 'react';
let Draggable = require('react-draggable');
import { SymbolTypes, GetItemBetweenLimits } from '../common_items/common';
import { AppState } from '../Stores/States';
import { Layer, SymbolOptions, ColorOptions } from '../Stores/Layer';
import { TextEditor } from './TextEditor';

import { observer } from 'mobx-react';

@observer
export class OnScreenLegend extends React.Component<{ state: AppState }, {}>{

    createLegend(layer: Layer) {
        let choroLegend, scaledLegend, chartLegend, iconLegend, blockLegend;
        let options = layer;
        let col = options.colorOptions;
        let sym = options.symbolOptions;
        if (col.colors && col.colors.length !== 0 && (sym.symbolType !== SymbolTypes.Icon || sym.iconField !== col.colorField)) {
            let percentages = this.props.state.legend.showPercentages ? this.getStepPercentages(layer.geoJSON, col.colorField, col.limits) : {};
            choroLegend = this.createChoroplethLegend(options, percentages);
        }
        if (sym.symbolType === SymbolTypes.Chart) {
            chartLegend = this.createChartSymbolLegend(col, sym);
        }
        if (sym.sizeXVar || sym.sizeYVar) {
            scaledLegend = this.createScaledSizeLegend(options);
        }
        if (sym.symbolType === SymbolTypes.Icon) {
            let percentages = this.props.state.legend.showPercentages && sym.iconLimits.length > 1 ? this.getStepPercentages(layer.geoJSON, sym.iconField, sym.iconLimits) : {};
            iconLegend = this.createIconLegend(options, percentages, layer.layerName);
        }
        if (sym.symbolType === SymbolTypes.Blocks) {
            blockLegend = this.createBlockLegend(options);
        }

        return <div key={layer.id}>
            {choroLegend}
            {scaledLegend}
            {chartLegend}
            {iconLegend}
            {blockLegend}
        </div>
    }

    onMetaChange = (e) => {
        this.props.state.legend.meta = e.target.value;
    }

    render() {
        let layers = this.props.state.layers;
        return (
            <Draggable
                handle={'.dragDiv'}
                bounds={'parent'}
                >
                <div className='legend' style={{
                    width: 'auto',
                    textAlign: 'center'
                }}>
                    <h2 className='legendHeader'>{this.props.state.legend.title}</h2>
                    <div>
                        <div style={{ position: 'absolute', left: 0, cursor: 'pointer' }} className='dragDiv'><i className='fa fa-arrows'/></div>
                        {layers.map(function(m) {
                            return this.createLegend(m);
                        }, this)}
                    </div>
                    <div style={{ clear: 'both' }}>
                        <TextEditor
                            style={{ width: '100%', minHeight: 50 }}
                            content={this.props.state.legend.meta}
                            onChange={this.onMetaChange}
                            edit={this.props.state.legend.edit}/>
                    </div>
                </div >


            </Draggable >
        );
    }

    createChoroplethLegend(layer: Layer, percentages) {
        let divs = [];
        let limits = layer.colorOptions.limits;
        let colors = layer.colorOptions.colors;
        for (let i = 0; i < limits.length - 1; i++) {
            let colorStyle = {
                background: colors[i],
                opacity: layer.colorOptions.fillOpacity,
                minWidth: '20px',
                minHeight: '20px',
            }

            divs.push(<div key={i} style={{ display: this.props.state.legend.horizontal ? 'initial' : 'flex' }}>
                <div style={colorStyle} />

                <span style={{ marginLeft: '3px', marginRight: '3px' }}>

                    {limits[i].toFixed(0) + '-'} {this.props.state.legend.horizontal ? <br/> : ''} {limits[i + 1].toFixed(0)}
                    {this.props.state.legend.showPercentages ? <br/> : null}
                    {this.props.state.legend.showPercentages ? percentages[i] ? percentages[i] + '%' : '0%' : null}
                </span>

            </div >);
        }
        return <div style={{ margin: '5px', float: 'left', textAlign: 'center' }}>
            {layer.colorOptions.colorField}
            <div style= {{ display: 'flex', flexDirection: this.props.state.legend.horizontal ? 'row' : 'column', flex: '1' }}>
                {divs.map(function(d) { return d })}
            </div >
        </div >;
    }

    createScaledSizeLegend(layer: Layer) {
        let symbolType = layer.symbolOptions.symbolType;
        let opt = layer.symbolOptions;
        let xVar = opt.sizeXVar;
        let yVar = opt.sizeYVar;
        let square: boolean = xVar && yVar && xVar === yVar;

        let style = {
            float: 'left',
            margin: 5,
            clear: this.props.state.legend.horizontal ? 'both' : ''
        }
        if (symbolType === SymbolTypes.Circle) {
            return circleLegend.call(this);
        }
        else if (symbolType === SymbolTypes.Rectangle) {

            if (square)
                return (<div style={style}>
                    {rectangleLegend.call(this, false)}
                </div>);
            else {
                return (
                    <div style={style}>
                        {xVar ? rectangleLegend.call(this, false) : null}
                        {yVar ? rectangleLegend.call(this, true) : null}
                    </div>);
            }
        }

        function rectangleLegend(y: boolean) {

            let divs = [], sides = [], values = [];
            let classes: number = 5;
            for (let i = 0; i < classes - 1; i++) {
                sides[i] = y ? Math.round(opt.actualMinYRadius + i * ((opt.actualMaxYRadius - opt.actualMinYRadius) / classes)) : Math.round(opt.actualMinXRadius + i * ((opt.actualMaxXRadius - opt.actualMinXRadius) / classes));
                values[i] = y ? (opt.actualMinYValue + i * ((opt.actualMaxYValue - opt.actualMinYValue) / classes)).toFixed(0) : (opt.actualMinXValue + i * ((opt.actualMaxXValue - opt.actualMinXValue) / classes)).toFixed(0);
            }
            sides.push(y ? opt.actualMaxYRadius : opt.actualMaxXRadius);
            values.push(y ? opt.actualMaxYValue.toFixed(0) : opt.actualMaxXValue.toFixed(0));
            let textWidth = values[values.length - 1].length;

            for (let i = 0; i < classes; i++) {
                let margin = (sides[sides.length - 1] - sides[i]) / 2;
                let l = sides[i];
                let style = {
                    width: square ? l : y ? 10 : l,
                    height: square ? l : y ? l : 10,
                    backgroundColor: layer.colorOptions.fillColor,
                    display: this.props.state.legend.horizontal ? '' : 'inline-block',
                    border: '1px solid gray',
                    marginLeft: this.props.state.legend.horizontal || y ? 'auto' : margin, //center values
                    marginRight: this.props.state.legend.horizontal || y ? 'auto' : margin, //center values
                    marginTop: this.props.state.legend.horizontal && y ? margin : 'auto',
                    marginBottom: this.props.state.legend.horizontal && y ? margin : 'auto',
                }

                let parentDivStyle = {
                    float: this.props.state.legend.horizontal ? 'left' : '',
                    marginRight: this.props.state.legend.horizontal ? 5 : 0,
                }
                divs.push(
                    <div key={i} style={parentDivStyle}>
                        <div style={style} />
                        <span style={{ display: 'inline-block', width: this.props.state.legend.horizontal ? '' : textWidth * 10 }}>{values[i]}</span>
                    </div >);
            }

            return <div style= {{ float: this.props.state.legend.horizontal ? '' : 'left', textAlign: 'center' }}>
                {y ? layer.symbolOptions.sizeYVar : layer.symbolOptions.sizeXVar}
                <div>
                    {divs.map(function(d) { return d })}
                </div>
            </div>;
        }

        function circleLegend() {
            let divs = [], radii = [], values = [];
            let classes: number = 5;
            for (let i = 0; i < classes - 1; i++) {
                radii[i] = Math.round(opt.actualMinXRadius + i * ((opt.actualMaxXRadius - opt.actualMinXRadius) / classes));
                values[i] = (opt.actualMinXValue + i * ((opt.actualMaxXValue - opt.actualMinXValue) / classes)).toFixed(0);
            }
            radii.push(opt.actualMaxXRadius);
            values.push(opt.actualMaxXValue.toFixed(0));
            for (let i = 0; i < classes; i++) {
                let margin = radii[radii.length - 1] - radii[i] + 2;
                let l = 2 * radii[i];
                let style = {
                    width: l,
                    height: l,
                    backgroundColor: layer.colorOptions.fillColor,
                    float: this.props.state.legend.horizontal ? '' : 'left',
                    border: '1px solid gray',
                    borderRadius: '50%',
                    marginLeft: this.props.state.legend.horizontal ? 2 : margin, //center values
                    marginRight: this.props.state.legend.horizontal ? 2 : margin, //center values
                    marginTop: this.props.state.legend.horizontal ? margin : 2,
                    marginBottom: this.props.state.legend.horizontal ? margin : 2,
                }
                let parentDivStyle = {
                    float: this.props.state.legend.horizontal ? 'left' : '',
                    minHeight: '15px',
                    overflow: this.props.state.legend.horizontal ? 'none' : 'auto',
                    lineHeight: this.props.state.legend.horizontal ? '' : Math.max(2 * radii[i] + 4, 15) + 'px',

                }
                divs.push(
                    <div key={i} style={parentDivStyle}>
                        <div style={style} />
                        <span style={{ marginRight: this.props.state.legend.horizontal ? 15 : '' }}>{values[i]}</span>
                    </div>);
            }

            return <div style= {{ float: this.props.state.legend.horizontal ? '' : 'left', textAlign: 'center' }}>
                {layer.symbolOptions.sizeXVar}
                <div>
                    {divs.map(function(d) { return d })}
                </div>
            </div>;
        }

    }

    createChartSymbolLegend(col: ColorOptions, sym: SymbolOptions) {
        let divs = [];
        let headers = sym.chartFields;

        for (let i = 0; i < headers.length; i++) {
            let colorStyle = {
                background: col.chartColors[headers[i].value],
                minWidth: '20px',
                minHeight: '20px',
            }
            divs.push(<div key={i} style={{ display: this.props.state.legend.horizontal ? 'initial' : 'flex' }}>
                <div style={colorStyle} />
                <span style={{ marginLeft: '3px', marginRight: '3px' }}>
                    {headers[i].label}
                </span>
            </div >);
        }
        return <div style={{ margin: '5px', float: 'left' }}>
            <div style= {{ display: 'flex', flexDirection: this.props.state.legend.horizontal ? 'row' : 'column', flex: '1' }}>
                {divs.map(function(d) { return d })}
            </div >
        </div >;
    }

    createIconLegend(layer: Layer, percentages, layerName: string) {
        let divs = [];
        let limits = layer.symbolOptions.iconCount > 1 ? this.combineLimits(layer) : layer.symbolOptions.iconLimits.slice();
        let icons: IIcon[] = layer.symbolOptions.icons;
        let col = layer.colorOptions;
        let sym = layer.symbolOptions;
        if (limits && limits.length > 0) {
            for (let i = 0; i < limits.length - 1; i++) {
                let fillColor: string = col.colorField === layer.symbolOptions.iconField ?
                    GetItemBetweenLimits(col.limits.slice(), col.colors.slice(), (limits[i] + limits[i + 1]) / 2) //if can be fitted into the same legend, show colors and symbols together. Get fill color by average of icon limits
                    : '000';
                let icon = GetItemBetweenLimits(sym.iconLimits.slice(), sym.icons.slice(), (limits[i] + limits[i + 1]) / 2);

                divs.push(<div key={i} style={{ display: this.props.state.legend.horizontal ? 'initial' : 'flex' }}>
                    {getIcon(icon.shape, icon.fa, col.color, fillColor, fillColor != '000' ? layer.colorOptions.iconTextColor : 'FFF')}
                    <span style={{ marginLeft: '3px', marginRight: '3px' }}>
                        {limits[i].toFixed(0) + '-'} {this.props.state.legend.horizontal ? <br/> : ''} {limits[i + 1].toFixed(0)}
                        {this.props.state.legend.showPercentages ? <br/> : null}
                        {this.props.state.legend.showPercentages ? percentages[i] ? percentages[i] + '%' : '0%' : null}
                    </span>
                </div >);
            }
            return <div style={{ margin: '5px', float: 'left', textAlign: 'center' }}>
                {layer.symbolOptions.iconField}
                <div style= {{ display: 'flex', flexDirection: this.props.state.legend.horizontal ? 'row' : 'column', flex: '1' }}>
                    {divs.map(function(d) { return d })}
                </div >
            </div >;
        }
        else {
            return <div style={{ margin: '5px', float: 'left', textAlign: 'center' }}>
                {layerName}
                <div style= {{ display: 'flex', flexDirection: this.props.state.legend.horizontal ? 'row' : 'column', flex: '1' }}>
                    {getIcon(icons[0].shape, icons[0].fa, layer.colorOptions.color, layer.colorOptions.fillColor, layer.colorOptions.iconTextColor)}
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

    createBlockLegend(layer: Layer) {
        let style = {
            width: 10,
            height: 10,
            backgroundColor: layer.colorOptions.fillColor,
            float: this.props.state.legend.horizontal ? '' : 'left',
            border: '1px solid ' + layer.colorOptions.color,
            margin: 'auto',
        }
        let parentDivStyle = {
            float: this.props.state.legend.horizontal ? 'left' : '',
            minHeight: '15px',
            overflow: this.props.state.legend.horizontal ? 'none' : 'auto',
            lineHeight: this.props.state.legend.horizontal ? '' : 24 + 'px',

        }
        return (
            <div style={{ margin: '5px', float: 'left' }}>
                {layer.symbolOptions.sizeXVar}
                <div style= {{ display: 'flex', flexDirection: this.props.state.legend.horizontal ? 'row' : 'column', flex: '1' }}>
                    <div style={style} />
                    =
                    <span style={{ display: 'inline-block' }}>{layer.symbolOptions.blockValue}</span>

                </div >
            </div >);
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

    combineLimits(layer: Layer) {
        return layer.symbolOptions.iconLimits.concat(layer.colorOptions.limits.filter(function(item) {
            return layer.symbolOptions.iconLimits.indexOf(item) < 0;
        })).sort(function(a, b) { return a - b });
    }

}
