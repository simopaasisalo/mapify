import * as React from 'react';
let Select = require('react-select');
let ColorPicker = require('react-color');
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
                colorSelectOpen: false,
                baseColor: '#E0E62D',
                borderColor: '#000',
                opacity: 1,
                choroFieldName: prev.choroplethFieldName ? prev.choroplethFieldName : this.props.headers[0].label,
                colorScheme: prev.colorScheme ? prev.colorScheme : 'Greys',
                useMultipleColors: this.props.isChoropleth,
            };
    }
    shouldComponentUpdate(nextProps: IColorMenuProps, nextState: IColorMenuStates) {
        return nextProps.isVisible !== this.props.isVisible ||
            nextProps.prevOptions !== this.props.prevOptions ||
            nextState.choroFieldName !== this.state.choroFieldName ||
            nextState.colorScheme !== this.state.colorScheme ||
            nextState.opacity !== this.state.opacity ||
            nextState.baseColor !== this.state.baseColor ||
            nextState.borderColor !== this.state.borderColor ||
            nextState.colorSelectOpen !== this.state.colorSelectOpen ||
            nextState.useMultipleColors !== this.state.useMultipleColors;
    }
    baseColorChanged(color) {
        this.setState({
            baseColor: this.state.editing === 'baseColor' ? '#' + color.hex : this.state.baseColor,
            borderColor: this.state.editing === 'borderColor' ? '#' + color.hex : this.state.borderColor,

        });
    }
    variableChanged(e) {
        this.setState({
            choroFieldName: e.value,
            opacityField: e.value
        });
    }
    schemeChanged(e) {
        this.setState({
            colorScheme: e.value
        });
    }
    opacityChanged(e) {
        this.setState({
            opacity: e.target.valueAsNumber,
        });
    }
    multipleColorsChanged(e) {
        this.setState({
            useMultipleColors: e.target.checked
        })
    }
    toggleColorPick(property: string) {
        let startColor;
        switch (property) {
            case ('baseColor'):
                startColor = this.state.baseColor;
                break;
            case ('borderColor'):
                startColor = this.state.borderColor;
                break;
        }
        this.setState({
            colorSelectOpen: !this.state.colorSelectOpen,
            editing: property,
            startColor: startColor,
        });
    }
    renderOption(option) {
        return <ColorScheme gradientName={option.value} steps = {100} />;
    }
    saveOptions() {
        this.props.saveValues({
            choroplethFieldName: this.state.useMultipleColors ? this.state.choroFieldName : '',
            steps: 7,
            colorScheme: this.state.colorScheme,
            mode: 'q',
            fillOpacity: this.state.opacity,
            opacity: this.state.opacity,
            fillColor: this.state.useMultipleColors ? '' : this.state.baseColor,
            color: this.state.borderColor,
        });
    }
    render() {
        let currentColorBlockStyle = {
            width: 100,
            height: 70,
            borderRadius: 15,
            textAlign: 'center',
            lineHeight: '70px',
            background: this.state.baseColor,
            color: '#' + ('000000' + ((0xffffff ^ parseInt(this.state.baseColor.substr(1), 16)).toString(16))).slice(-6)
        }
        let borderColorBlockStyle = {
            width: 100,
            height: 70,
            borderRadius: 15,
            textAlign: 'center',
            lineHeight: '70px',
            background: this.state.borderColor,
            color: '#' + ('000000' + ((0xffffff ^ parseInt(this.state.borderColor.substr(1), 16)).toString(16))).slice(-6)
        }
        let colorSelectStyle = {
            position: 'absolute',
            right: 250,
        }
        return (!this.props.isVisible ? null :
            <div className="mapify-options">
                {this.props.isChoropleth ? null :
                    <div>
                        <label htmlFor='multipleSelect'>Use multiple colors</label>
                        <input id='multipleSelect' type='checkbox' onChange={this.multipleColorsChanged.bind(this) } checked={this.state.useMultipleColors}/>
                    </div>
                }
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {this.state.useMultipleColors ?
                        null :
                        <div style={currentColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'baseColor') }>Base color</div>
                    }
                    <div style={borderColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'borderColor') }>Border color</div>

                </div>
                {!this.state.colorSelectOpen ? null :
                    <div style={colorSelectStyle}>
                        <ColorPicker.SketchPicker
                            color={ this.state.startColor}
                            onChange={this.baseColorChanged.bind(this) }
                            display={false}
                            />
                    </div>
                }
                {
                    this.state.useMultipleColors ?
                        <div>
                            <h4>Select the variable to color by</h4>
                            <Select
                                options={this.props.headers}
                                onChange={this.variableChanged.bind(this) }
                                value={this.state.choroFieldName}
                                />
                            <h4>Select the color scale</h4>
                            <Select
                                options = {_gradientOptions}
                                optionRenderer={this.renderOption}
                                valueRenderer = {this.renderOption}
                                onChange={this.schemeChanged.bind(this) }
                                value={this.state.colorScheme}
                                />
                        </div>
                        : null
                }
                <label>Opacity</label>

                <input type='number' max={1} min={0} step={0.1} onChange={this.opacityChanged.bind(this) } value={this.state.opacity}/>
                <button onClick={this.saveOptions.bind(this) }>Refresh map</button>
            </div >
        );
    }

}
