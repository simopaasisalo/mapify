import * as React from 'react';
let Select = require('react-select');
import {ColorScheme} from './ColorScheme';
const _gradientOptions: { value: string }[] =
    [
        { value: 'Greys' },
        { value: 'Reds' },
        { value: 'Blues' },
        { value: 'Greens' },
        { value: 'OrRd' },
        { value: 'YlOrRd' },
        { value: 'RdPu' },
        { value: 'PuRd' },
        { value: 'PuBu' },
        { value: 'YlGnBu' },
    ];


export class ColorMenu extends React.Component<IColorMenuProps, IColorMenuStates>{
    constructor(props: IColorMenuProps) {
        super(props);
        let prev = this.props.prevOptions;
        this.state =
            {
                fillOpacity: 1,
                choroField: prev.valueProperty ? prev.valueProperty : this.props.headers[0].label,
                choroplethGradientName: prev.scale ? prev.scale : 'Greys'
            };
    }
    shouldComponentUpdate(nextProps: IColorMenuProps, nextState: IColorMenuStates) {
        return nextProps.isVisible !== this.props.isVisible ||
            nextProps.prevOptions !== this.props.prevOptions ||
            nextState.choroField !== this.state.choroField ||
            nextState.choroplethGradientName !== this.state.choroplethGradientName ||
            nextState.fillOpacity !== this.state.fillOpacity;
    }
    variableChanged(e) {
        this.setState({
            choroField: e.value,
            opacityField: e.value
        });
    }
    schemeChanged(e) {
        this.setState({
            choroplethGradientName: e.value
        });
    }
    opacityChanged(e) {
        this.setState({
            fillOpacity: e.target.valueAsNumber,
        });
    }
    renderOption(option) {
        return <ColorScheme gradientName={option.value} steps = {100} />;
    }
    saveOptions() {

        this.props.saveValues({
            valueProperty: this.state.choroField,
            steps: 7,
            scale: this.state.choroplethGradientName,
            mode: 'q',
            fillOpacity: this.state.fillOpacity,
            weight: 1,

            opacity: this.state.fillOpacity,
            limits: null,
            colors: null,

        });
    }
    render() {
        return (!this.props.isVisible ? null :
            <div className="mapify-options">
                <h4>Select the variable to color by</h4>
                <Select
                    options={this.props.headers}
                    onChange={this.variableChanged.bind(this) }
                    value={this.state.choroField}
                    />
                <h4>Select the color scale</h4>
                <Select
                    options = {_gradientOptions}
                    optionRenderer={this.renderOption}
                    valueRenderer = {this.renderOption}
                    onChange={this.schemeChanged.bind(this) }
                    value={this.state.choroplethGradientName}
                    />
                <input type='number' max={1} min={0} step={0.1} onChange={this.opacityChanged.bind(this) } value={this.state.fillOpacity}/>
                <button onClick={this.saveOptions.bind(this) }>Refresh map</button>
            </div>
        );
    }

}
