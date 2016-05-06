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
                opacity: 0.8,
                colorScaleFieldName: prev.choroplethFieldName ? prev.choroplethFieldName : '',
                colorScheme: prev.colorScheme ? prev.colorScheme : 'Greys',
                useMultipleColors: this.props.isChoropleth,
                revertColorScheme: false,
                steps: 7,
                mode: 'q',
            };
    }
    shouldComponentUpdate(nextProps: IColorMenuProps, nextState: IColorMenuStates) {
        return nextProps.isVisible !== this.props.isVisible ||
            nextProps.prevOptions !== this.props.prevOptions ||
            nextState.colorScaleFieldName !== this.state.colorScaleFieldName ||
            nextState.colorScheme !== this.state.colorScheme ||
            nextState.opacity !== this.state.opacity ||
            nextState.baseColor !== this.state.baseColor ||
            nextState.borderColor !== this.state.borderColor ||
            nextState.colorSelectOpen !== this.state.colorSelectOpen ||
            nextState.useMultipleColors !== this.state.useMultipleColors ||
            nextState.revertColorScheme !== this.state.revertColorScheme ||
            nextState.steps !== this.state.steps ||
            nextState.mode !== this.state.mode;
    }
    baseColorChanged(color) {
        this.setState({
            baseColor: this.state.editing === 'baseColor' ? '#' + color.hex : this.state.baseColor,
            borderColor: this.state.editing === 'borderColor' ? '#' + color.hex : this.state.borderColor,

        });
    }
    choroVariableChanged(e) {
        this.setState({
            colorScaleFieldName: e.value,
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
    stepsChanged(e) {
        this.setState({
            steps: e.target.valueAsNumber,
        });
    }
    modeChanged(mode) {
        this.setState({
            mode: mode,
        });
    }
    multipleColorsChanged(e) {
        this.setState({
            useMultipleColors: e.target.checked
        });
    }
    revertChanged(e) {
        let scheme = this.state.colorScheme;
        this.setState({
            revertColorScheme: e.target.checked,
        });

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
    renderScheme(option) {
        return <ColorScheme gradientName={option.value} revert={this.state.revertColorScheme}/>;
    }
    saveOptions() {
        this.props.saveValues({
            choroplethFieldName: this.state.useMultipleColors ? this.state.colorScaleFieldName : '',
            steps: this.state.steps,
            colorScheme: this.state.colorScheme,
            mode: this.state.mode,
            fillOpacity: this.state.opacity,
            opacity: this.state.opacity,
            fillColor: this.state.useMultipleColors ? '' : this.state.baseColor,
            color: this.state.borderColor,
            revert: this.state.revertColorScheme,
        });
    }
    render() {
        let currentColorBlockStyle = {
            cursor: 'pointer',
            width: 100,
            height: 70,
            borderRadius: 15,
            textAlign: 'center',
            lineHeight: '70px',
            background: this.state.baseColor,
            color: '#' + ('000000' + ((0xffffff ^ parseInt(this.state.baseColor.substr(1), 16)).toString(16))).slice(-6)
        }
        let borderColorBlockStyle = {
            cursor: 'pointer',
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
                <label>Opacity</label>
                <input type='number' max={1} min={0} step={0.1} onChange={this.opacityChanged.bind(this) } value={this.state.opacity}/>

                {!this.state.colorSelectOpen ? null :
                    <div style={colorSelectStyle}>
                        <ColorPicker.SwatchesPicker
                            color={ this.state.startColor}
                            onChange={this.baseColorChanged.bind(this) }
                            />
                    </div>
                }
                {
                    this.state.useMultipleColors ?
                        <div>
                            <label>Select the variable to color by</label>
                            <Select
                                options={this.props.headers}
                                onChange={this.choroVariableChanged.bind(this) }
                                value={this.state.colorScaleFieldName}
                                clearable={false}
                                />
                            {this.state.colorScaleFieldName ?
                                <div>
                                    <label>Select the color scale</label>
                                    <Select
                                        clearable = {false}
                                        searchable = {false}
                                        options = {_gradientOptions}
                                        optionRenderer={this.renderScheme.bind(this) }
                                        valueRenderer = {this.renderScheme.bind(this) }
                                        onChange={this.schemeChanged.bind(this) }
                                        value={this.state.colorScheme}
                                        />
                                    <label htmlFor='revertSelect'>Revert</label>
                                    <input id='revertSelect' type='checkbox' onChange={this.revertChanged.bind(this) } checked={this.state.revertColorScheme}/>
                                    <br/>
                                    <label>Steps</label>
                                    <input type='number' max={10} min={2} step={1} onChange={this.stepsChanged.bind(this) } value={this.state.steps}/>
                                    <br/>
                                    <label forHTML='quantiles'>
                                        Quantiles
                                        <input
                                            type='radio'
                                            onChange={this.modeChanged.bind(this, 'q') }
                                            checked={this.state.mode === 'q'}
                                            name='mode'
                                            id='quantiles'
                                            />
                                        <br/>
                                    </label>
                                    <label forHTML='kmeans'>
                                        K-means
                                        <input
                                            type='radio'
                                            onChange={this.modeChanged.bind(this, 'k') }
                                            checked={this.state.mode === 'k'}
                                            name='mode'
                                            id='kmeans'
                                            />
                                        <br/>

                                    </label><label forHTML='equidistant'>
                                        Equidistant
                                        <input
                                            type='radio'
                                            onChange={this.modeChanged.bind(this, 'e') }
                                            checked={this.state.mode === 'e'}
                                            name='mode'
                                            id='equidistant'
                                            />
                                        <br/>

                                    </label>
                                </div>
                                : null}
                        </div>
                        : null
                }
                <button onClick={this.saveOptions.bind(this) }>Refresh map</button>
            </div >
        );
    }

}
