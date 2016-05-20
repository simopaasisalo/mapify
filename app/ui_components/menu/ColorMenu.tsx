import * as React from 'react';
let Select = require('react-select');
let ColorPicker = require('react-color');
import {ColorScheme} from './ColorScheme';
let Modal = require('react-modal');
let chroma = require('chroma-js');

export class ColorMenu extends React.Component<IColorMenuProps, IColorMenuStates>{
    constructor(props: IColorMenuProps) {
        super(props);
        this.getPreviousOptions(props.prevOptions, true)
    }
    getPreviousOptions(prev: IColorOptions, initial: boolean) {
        let state: IColorMenuStates = {
            fillColor: prev.fillColor ? prev.fillColor : '#E0E62D',
            iconTextColor: prev.iconTextColor ? prev.iconTextColor : '#FFF',
            borderColor: prev.color ? prev.color : '#000',
            opacity: prev.opacity ? prev.opacity : 0.8,
            colorSchemeFieldName: prev.choroplethField ? prev.choroplethField : '',
            colorScheme: prev.colorScheme ? prev.colorScheme : 'Greys',
            useMultipleFillColors: (prev.choroplethField || this.props.isChoropleth) ? true : false,
            revertColorScheme: prev.revert ? prev.revert : false,
            steps: prev.steps ? prev.steps : 7,
            mode: prev.mode ? prev.mode : 'q',
            useCustomScheme: prev.useCustomScheme ? prev.useCustomScheme : false,
            colors: prev.colors ? prev.colors : [],
            limits: prev.limits ? prev.limits : [],
        };
        initial ? this.state = state : this.setState(state)
    }
    componentWillReceiveProps(nextProps: IColorMenuProps) {
        this.getPreviousOptions(nextProps.prevOptions, false);

    }

    colorSelect(color) {
        let step = this.state.editing.indexOf('step') !== -1 ? this.state.editing.substring(4) : -1;//Check if editing a custom made step, get step index
        let colors = this.state.colors;

        if (step !== -1) {
            colors[step] = '#' + color.hex;
        }

        this.setState({
            startColor: '#' + color.hex,
            fillColor: this.state.editing === 'fillColor' ? '#' + color.hex : this.state.fillColor,
            borderColor: this.state.editing === 'borderColor' ? '#' + color.hex : this.state.borderColor,
            iconTextColor: this.state.editing === 'iconTextColor' ? '#' + color.hex : this.state.iconTextColor,
            colors: colors,
        });
    }
    choroVariableChanged(e) {
        let name = e.value;
        this.setState({
            colorSchemeFieldName: name,
        });
        this.calculateValues(this.state.useCustomScheme ? 'q' : this.state.mode, this.state.steps, this.state.colorScheme, name);

    }
    schemeChanged(e) {
        let scheme = e.value;
        this.setState({
            colorScheme: scheme
        });
        this.calculateValues(this.state.useCustomScheme ? 'q' : this.state.mode, this.state.steps, scheme, this.state.colorSchemeFieldName);
    }
    opacityChanged(e) {
        this.setState({
            opacity: e.target.valueAsNumber,
        });
    }
    stepsChanged(e) {
        let steps = e.target.valueAsNumber;
        this.setState({
            steps: steps,
        });
        this.calculateValues(this.state.useCustomScheme ? 'q' : this.state.mode, steps, this.state.colorScheme, this.state.colorSchemeFieldName);
    }
    modeChanged(mode) {
        this.setState({
            mode: mode,
        });
        this.calculateValues(this.state.useCustomScheme ? 'q' : mode, this.state.steps, this.state.colorScheme, this.state.colorSchemeFieldName);

    }
    multipleColorsChanged(e) {
        this.setState({
            useMultipleFillColors: e.target.checked
        });
    }
    revertChanged(e) {
        this.setState({
            revertColorScheme: e.target.checked,
        });
    }
    customSchemeChanged(e) {
        let use: boolean = e.target.checked;
        let steps: number = use ? this.state.steps : this.state.steps > 10 ? 10 : this.state.steps; //If switching back from custom steps, force the steps to be under the limit
        this.setState({
            useCustomScheme: use,
            steps: steps
        });
        this.calculateValues(use ? 'q' : this.state.mode, steps, this.state.colorScheme, this.state.colorSchemeFieldName);
    }
    toggleColorPick(property: string) {
        this.setState({
            colorSelectOpen: this.state.editing !== property ? true : !this.state.colorSelectOpen,
            editing: property,
        });
    }
    renderScheme(option) {
        return <ColorScheme gradientName={option.value} revert={this.state.revertColorScheme}/>;
    }

    calculateValues(mode: string, steps: number, scheme: string, fieldName: string) {
        let lyr = this.props.layer;
        let values = (lyr.geoJSON as any).features.map(function(feat) {
            return feat.properties[fieldName];
        });
        let limits: number[] = chroma.limits(values, mode, steps);
        let colors: string[] = chroma.scale(scheme).colors(limits.length - 1);
        this.setState({
            limits: limits,
            colors: colors,
        })
    }

    /**
     * getOppositeColor - Returns a near-opposite color to the one given
     *
     * @param   color Color(hex) to compare
     * @return  Opposite color code(hex)
     */
    getOppositeColor(color: string) {
        if (color.toLowerCase() === '#fff' || color === '#ffffff' || color === 'white') {
            return '#000';
        }
        else if (color.toLowerCase() === '#000' || color === '#000000' || color === 'black') {
            return '#FFF'
        }
        return '#' + ('000000' + ((0xffffff ^ parseInt(color.substr(1), 16)).toString(16))).slice(-6);

    }

    getStepValues() {
        if (!this.state.useMultipleFillColors)
            return [];
        let limits: number[] = [];
        for (let i = 0; i < this.state.steps; i++) {
            let step: number = +(document.getElementById(i + 'min') as any).value
            limits.push(step)
        }
        limits.push(this.state.limits[this.state.limits.length - 1]);
        return limits;
    }
    saveOptions() {
        this.props.saveValues({
            choroplethField: this.state.useMultipleFillColors ? this.state.colorSchemeFieldName : '',
            steps: this.state.steps,
            colorScheme: this.state.useMultipleFillColors ? this.state.colorScheme : '',
            mode: this.state.mode,
            fillOpacity: this.state.opacity,
            opacity: this.state.opacity,
            fillColor: this.state.useMultipleFillColors ? '' : this.state.fillColor,
            iconTextColor: this.state.iconTextColor,
            color: this.state.borderColor,
            revert: this.state.revertColorScheme,
            limits: this.state.useCustomScheme ? this.getStepValues() : this.state.limits,
            colors: this.state.useMultipleFillColors ? this.state.colors : [],
            useCustomScheme: this.state.useCustomScheme,
        });
    }
    renderSteps() {
        let rows = [];
        let steps: number[] = [];
        for (let i in this.state.limits) {
            if (+i !== this.state.limits.length - 1) {
                let step: number = this.state.limits[i];
                steps.push(step);
            }
        }
        let row = 0;
        for (let i of steps) {
            rows.push(
                <li key={i}
                    style={{ background: this.state.colors[row] ? this.state.colors[row] : '#FFF', }}
                    onClick={this.toggleColorPick.bind(this, 'step' + row) }>
                    <input
                        id={row + 'min'}
                        type='number'
                        defaultValue={i.toFixed(2) }
                        style={{
                            width: 100,

                        }}
                        onClick={function(e) { e.stopPropagation(); } }
                        step='any'/>
                </li>);
            row++;
        }
        return <div>
            <ul id='customSteps' style={{ listStyle: 'none', padding: 0 }}>{rows.map(function(r) { return r }) }</ul>
        </div>
    }
    render() {
        let fillColorBlockStyle = {
            background: this.state.fillColor,
            color: this.getOppositeColor(this.state.fillColor),
            border: '1px solid ' + this.state.borderColor,
        }
        let borderColorBlockStyle = {
            background: this.state.borderColor,
            color: this.getOppositeColor(this.state.borderColor),
            border: '1px solid ' + this.state.borderColor,
        }
        let iconTextColorBlockStyle = {

            background: this.state.iconTextColor,
            color: this.getOppositeColor(this.state.iconTextColor),
            border: '1px solid ' + this.state.borderColor,
        }
        let colorSelectStyle = {
            overlay: {
                position: 'fixed',
                height: 600,
                width: 300,
                right: 230,
                bottom: '',
                top: 20,
                left: '',
                backgroundColor: ''

            },
            content: {
                border: '4px solid #6891e2',
                borderRadius: '15px',
                padding: '0px',
                height: 650,
                width: 300,
                right: '',
                bottom: '',
                top: '',
                left: '',
            }
        }
        return (!this.props.isVisible ? null :
            <div className="mapify-options">
                {this.props.isChoropleth ? null :
                    <div>
                        <label htmlFor='multipleSelect'>Use multiple fill colors</label>
                        <input id='multipleSelect' type='checkbox' onChange={this.multipleColorsChanged.bind(this) } checked={this.state.useMultipleFillColors}/>
                    </div>
                }
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {this.state.useMultipleFillColors ?
                        null :
                        <div className='colorBlock' style={fillColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'fillColor') }>Fill</div>
                    }
                    <div className='colorBlock' style={borderColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'borderColor') }>Border</div>
                    {this.props.isIconSymbol ?
                        <div className='colorBlock' style={iconTextColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'iconTextColor') }>Icon text</div>
                        : null
                    }

                </div>
                <label>Opacity</label>
                <input type='number' max={1} min={0} step={0.1} onChange={this.opacityChanged.bind(this) } value={this.state.opacity}/>

                <Modal
                    isOpen={this.state.colorSelectOpen}
                    style={colorSelectStyle}
                    >

                    <ColorPicker.SwatchesPicker
                        width={300}
                        height={600}
                        overlowY='auto'
                        color={ this.state.startColor}
                        onChange={this.colorSelect.bind(this) }
                        />
                    <button
                        className='primaryButton'
                        onClick={this.toggleColorPick.bind(this, this.state.editing) }
                        style={{ position: 'absolute', left: 80 }}>OK</button>
                </Modal>
                {
                    this.state.useMultipleFillColors ?
                        <div>
                            <label>Select the variable to color by</label>
                            <Select
                                options={this.props.layer.headers.filter(function(val) { return val.type === 'number' }) }
                                onChange={this.choroVariableChanged.bind(this) }
                                value={this.state.colorSchemeFieldName}
                                clearable={false}
                                />
                            {this.state.colorSchemeFieldName ?

                                <div>
                                    <label htmlFor='customScale'>Set custom scheme</label>
                                    <input
                                        id='customScale'
                                        type='checkbox'
                                        onChange={this.customSchemeChanged.bind(this) }
                                        checked={this.state.useCustomScheme}/>
                                    <br/>
                                    {this.state.useCustomScheme ?
                                        null :
                                        <div>
                                            Or
                                            <br/>
                                            <label>Select a color scheme</label>
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
                                            <input
                                                id='revertSelect'
                                                type='checkbox'
                                                onChange={this.revertChanged.bind(this) }
                                                checked={this.state.revertColorScheme}/>
                                        </div>
                                    }
                                    <label>Steps</label>
                                    <input
                                        type='number'
                                        max={this.state.useCustomScheme ? 100 : 10}
                                        min={2}
                                        step={1}
                                        onChange={this.stepsChanged.bind(this) }
                                        value={this.state.steps}/>
                                    {this.state.useCustomScheme ?
                                        <div>
                                            Set the <i>lower limit</i> for each step and a color to match
                                            {this.renderSteps() }
                                        </div>
                                        :
                                        <div>
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

                                            </label>
                                            <label forHTML='equidistant'>
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
                                    }
                                </div>
                                : null}
                        </div>
                        : null
                }
                <button className='menuButton' onClick={this.saveOptions.bind(this) }>Refresh map</button>
            </div >
        );
    }

}
const _gradientOptions: { value: string }[] =
    [
        { value: 'Greys' },
        { value: 'Reds' },
        { value: 'Blues' },
        { value: 'Greens' },
        { value: 'BuGn' },
        { value: 'OrRd' },
        { value: 'YlOrRd' },
        { value: 'YlOrBr' },
        { value: 'RdPu' },
        { value: 'PuBu' },
        { value: 'YlGn' },
        { value: 'YlGnBu' },
        { value: 'PuBuGn' },
        { value: 'Spectral' },
        { value: 'RdYlGn' },
        { value: 'RdYlBu' },
        { value: 'RdBu' },
        { value: 'PiYG' },
        { value: 'PRGn' },
        { value: 'BrBG' },
        //{ value: 'RdGy' },
        //{ value: 'Set1' },
        { value: 'Set2' },
        //{ value: 'Set3' },
        //{ value: 'Accent' },
        { value: 'Dark2' },
        { value: 'Paired' },
        //{ value: 'Pastel1' },
        //{ value: 'Pastel2' }



    ];
