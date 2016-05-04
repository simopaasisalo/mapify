import * as React from 'react';
let Draggable = require('react-draggable');
export class Legend extends React.Component<IOnScreenLegendProps, {}>{

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
            < div style= {{ display: 'flex', flexDirection: this.props.horizontal ? 'row' : 'column', flex: '1' }}>
                { divs.map(function(d) { return d }) }
            </div >
        </div >;
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

        return <div style= {{ float: this.props.horizontal ? '' : 'left', textAlign: 'center' }}>
            {options.symbolOptions.sizeVariable}
            <div>
                {divs.map(function(d) { return d }) }
            </div>
        </div>;


    }
    createNormalLegend(options: IVisualizationOptions) {

    }
    createLegend(options: IVisualizationOptions) {
        let choroLegend, scaledLegend, normalLegend;
        if (options.colorOptions.colors) {
            choroLegend = this.createChoroplethLegend(options);
        }
        if (options.symbolOptions.sizeVariable) {
            scaledLegend = this.createScaledSizeLegend(options);
        }
        if (!choroLegend && !scaledLegend) {
            normalLegend = this.createNormalLegend(options);
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
