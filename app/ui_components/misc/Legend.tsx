import * as React from 'react';
let Draggable = require('react-draggable');
import {SymbolTypes} from '../common_items/common';

export class Legend extends React.Component<IOnScreenLegendProps, {}>{

    shouldComponentUpdate(nextProps: IOnScreenLegendProps, nextState: {}) {
        return nextProps.title !== this.props.title ||
            nextProps.meta !== this.props.meta ||
            nextProps.mapLayers !== this.props.mapLayers ||
            nextProps.horizontal !== this.props.horizontal;
    }
    createChoroplethLegend(options: IVisualizationOptions) {
        let divs = [];
        let limits = options.colorOptions.limits;
        let colors = options.colorOptions.colors;
        for (let i = 0; i < limits.length; i++) {
            let colorStyle = {
                background: colors[i],
                opacity: options.colorOptions.fillOpacity,
                minWidth: '20px',
                minHeight: '20px',
            }
            divs.push(<div key={i} style={{ display: this.props.horizontal ? 'initial' : 'flex' }}>
                <div style={colorStyle} />
                <span style={{ marginLeft: '3px', marginRight: '3px' }}>
                    {  i == limits.length - 1 ?
                        null :
                        limits[i].toFixed(0) + '-' + limits[i + 1].toFixed(0) }
                </span>
            </div >);
        }
        return <div style={{ margin: '5px', float: 'left' }}>
            { options.colorOptions.choroplethFieldName }
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

        if (symbolType === SymbolTypes.Circle) {
            return circleLegend.call(this);
        }
        else if (symbolType === SymbolTypes.Rectangle) {
            if (square)
                return (<div>
                    {rectangleLegend.call(this, false) }
                </div>);
            else {
                return (
                    <div>
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
                    { headers[i]}
                </span>
            </div >);
        }
        return <div style={{ margin: '5px', float: 'left' }}>
            <div style= {{ display: 'flex', flexDirection: this.props.horizontal ? 'row' : 'column', flex: '1' }}>
                { divs.map(function(d) { return d }) }
            </div >
        </div >;
    }

    createNormalLegend(options: IVisualizationOptions) {

    }
    createLegend(options: IVisualizationOptions) {
        let choroLegend, scaledLegend, chartLegend, normalLegend;
        if (options.colorOptions.colors) {
            choroLegend = this.createChoroplethLegend(options);
        }
        if (options.symbolOptions.symbolType === SymbolTypes.Chart) {
            chartLegend = this.createChartSymbolLegend(options.symbolOptions);
        }
        if (options.symbolOptions.sizeXVar || options.symbolOptions.sizeYVar) {
            scaledLegend = this.createScaledSizeLegend(options);
        }
        if (!choroLegend && !scaledLegend) {
            normalLegend = this.createNormalLegend(options);
        }
        return <div>
            {choroLegend}
            {scaledLegend}
            {chartLegend}
        </div>
    }
    render() {
        return (
            <Draggable
                handle={'.legendHeader'}
                >
                <div className='legend' style={{ width: 'auto' }}>
                    <h2 className='draggableHeader legendHeader'>{this.props.title}</h2>
                    <div>
                        {this.createLegend(this.props.mapLayers[0].visOptions) }
                    </div>
                    <p style={{ clear: 'both', maxWidth: this.props.horizontal ? 500 : 200 }}>{this.props.meta}</p>
                </div >
            </Draggable >
        );
    }
}
