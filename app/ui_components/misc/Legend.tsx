import * as React from 'react';
let Draggable = require('react-draggable');
export class Legend extends React.Component<ILegendProps, {}>{

    createChoroplethLegend(options: IVisualizationOptions) {
        let divs = [];
        let limits = options.colorOptions.limits;
        let colors = options.colorOptions.colors;
        for (let i = 0; i < limits.length; i++) {
            let style = {
                background: colors[i],
                opacity: options.colorOptions.fillOpacity,
                minWidth: '15px',
                minHeight: '15px',
                float: this.props.horizontal ? '' : 'left',
            }
            divs.push(<div key={i} style={{ float: this.props.horizontal ? 'left' : '' }}>
                <div style={style} />
                <span style={{ marginLeft: '3px', marginRight: '3px' }}>
                    { i > 0 ?
                        limits[i - 1].toFixed(0) + '-' + limits[i].toFixed(0) :
                        limits[i].toFixed(0) }
                </span>
            </div >);
        }
        return <div style= {{ float: 'left', textAlign: 'center', }}>
            {options.colorOptions.valueProperty}
            <div style={{ border: '1px solid gray', }}>
                {divs.map(function(d) { return d }) }
            </div>
        </div>;
    }

    createScaledSizeLegend(options: IVisualizationOptions) {

        let divs = [];
        let opt = options.symbolOptions;
        let classes: number = options.colorOptions.limits ? options.colorOptions.limits.length : Math.min(Math.round(opt.actualMaxValue - opt.actualMinValue), 5);
        let radii = [], values = [];
        for (let i = 0; i < classes - 1; i++) {
            radii[i] = Math.round(opt.actualMinRadius + i * ((opt.actualMaxRadius - opt.actualMinRadius) / classes));
            values[i] = (opt.actualMinValue + i * ((opt.actualMaxValue - opt.actualMinValue) / classes)).toFixed(0);
        }
        radii.push(opt.actualMaxRadius);
        values.push(opt.actualMaxValue.toFixed(0));
        for (let i = 0; i < classes; i++) {
            let divStyle = {
                width: 2 * radii[i] + 'px',
                height: 2 * radii[i] + 'px',
                float: this.props.horizontal ? '' : 'left',
                border: '1px solid gray',
                borderRadius: '50%',
                marginLeft: this.props.horizontal ? 2 : (radii[radii.length - 1] - radii[i] + 2) + 'px', //center values
                marginRight: this.props.horizontal ? 2 : (radii[radii.length - 1] - radii[i] + 2) + 'px', //center values
                marginTop: this.props.horizontal ? (radii[radii.length - 1] - radii[i] + 2) + 'px' : 2,
                marginBottom: this.props.horizontal ? (radii[radii.length - 1] - radii[i] + 2) + 'px' : 2,
            }
            let parentDivStyle = {
                float: this.props.horizontal ? 'left' : '',
                minHeight: '15px',
                overflow: this.props.horizontal ? 'none' : 'auto',
                lineHeight: this.props.horizontal ? '' : Math.max(2 * radii[i] + 4, 15) + 'px',

            }
            divs.push(
                <div key={i} style={parentDivStyle}>
                    <div style={divStyle} />
                    {values[i]}
                </div>);
        }

        return <div style= {{ float: 'left', textAlign: 'center' }}>
            {options.symbolOptions.sizeVariable}
            <div>
                {divs.map(function(d) { return d }) }
            </div>
        </div>;


    }
    createLegend(options: IVisualizationOptions) {
        let choroLegend, scaledLegend;
        if (options.colorOptions.colors) {
            choroLegend = this.createChoroplethLegend(options);
        }
        console.log(options.symbolOptions)
        if (options.symbolOptions.sizeVariable) {
            scaledLegend = this.createScaledSizeLegend(options);
        }
        return <div>
            {choroLegend}
            {scaledLegend}
        </div>
    }
    render() {
        return (
            <Draggable
                handle={'.legendTitle'}
                >
                <div className='draggable'>
                    <h2 className='legendTitle'>Legend</h2>
                    {this.createLegend(this.props.mapLayers[0].visOptions) }
                </div>
            </Draggable>
        );
    }
}
