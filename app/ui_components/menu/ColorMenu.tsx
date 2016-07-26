import * as React from 'react';
let Select = require('react-select');
let ColorPicker = require('react-color');
import {ColorScheme} from './ColorScheme';
let Modal = require('react-modal');
let chroma = require('chroma-js');
import {AppState} from '../Stores/States';
import {Layer, ColorOptions} from '../Stores/Layer';
import {LayerTypes, SymbolTypes} from "../common_items/common";
import {observer} from 'mobx-react';

@observer
export class ColorMenu extends React.Component<{
    state: AppState,
    /** Save the current options to the layer*/
    saveValues: () => void,
    /** layer being edited*/
}, {}>{

    componentWillUpdate() {
        if (this.props.state.autoRefresh)
            this.props.saveValues();
    }
    onColorSelect = (color) => {
        let layer = this.props.state.editingLayer;
        let hex = color.hex;
        let step = this.props.state.colorMenuState.editing.indexOf('step') !== -1 ? this.props.state.colorMenuState.editing.substring(4) : -1;//Check if editing a custom made step, get step index
        layer.blockUpdate = true;

        if (step != -1)
            layer.colorOptions.colors[step] = hex;

        switch (this.props.state.colorMenuState.editing) {
            case 'fillColor':
                layer.colorOptions.fillColor = hex;
                break;
            case 'borderColor':
                layer.colorOptions.color = hex;
                break;
            case 'iconTextColor':
                layer.colorOptions.iconTextColor = hex;
                break;
        }
        layer.blockUpdate = false;
        this.props.state.colorMenuState.startColor = hex;

    }
    onChoroVariableChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.colorField = e.label;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;

    }
    onSchemeChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.colorScheme = e.value;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }
    onOpacityChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.opacity = e.target.valueAsNumber;
        this.props.state.editingLayer.colorOptions.fillOpacity = e.target.valueAsNumber;
        this.props.state.editingLayer.blockUpdate = false;
    }
    onStepsChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.steps = e.target.valueAsNumber;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }
    onModeChange = (mode) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.mode = mode;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }
    onMultipleColorsChange = (e) => {
        this.props.state.editingLayer.colorOptions.useMultipleFillColors = e.target.checked;
    }
    onRevertChange = (e) => {
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.revert = e.target.checked;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }
    onCustomSchemeChange = (e) => {
        let use: boolean = e.target.checked;
        let steps: number = use ? this.props.state.editingLayer.colorOptions.steps : this.props.state.editingLayer.colorOptions.steps > 10 ? 10 : this.props.state.editingLayer.colorOptions.steps; //If switching back from custom steps, force the steps to be under the limit
        this.props.state.editingLayer.blockUpdate = true;
        this.props.state.editingLayer.colorOptions.useCustomScheme = use;
        this.props.state.editingLayer.colorOptions.steps = steps;
        this.calculateValues();
        this.props.state.editingLayer.blockUpdate = false;
    }
    toggleColorPick = (property: string) => {
        this.props.state.colorMenuState.colorSelectOpen = this.props.state.colorMenuState.editing !== property ? true : !this.props.state.colorMenuState.colorSelectOpen;
        this.props.state.colorMenuState.editing = property;
    }
    renderScheme = (option: IHeader) => {
        return <ColorScheme gradientName={option.value} revert={this.props.state.editingLayer.colorOptions.revert}/>;
    }

    /**
     * calculateValues - Performs the chroma-js calculation to get colors and steps
     */
    calculateValues = () => {
        let lyr: Layer = this.props.state.editingLayer;
        let choroField = this.props.state.editingLayer.colorOptions.colorField;
        let values = (lyr.geoJSON as any).features.map(function(feat) {
            return feat.properties[choroField];
        });
        let limits: number[] = chroma.limits(values, this.props.state.editingLayer.colorOptions.mode, this.props.state.editingLayer.colorOptions.steps);
        let colors: string[] = chroma.scale(this.props.state.editingLayer.colorOptions.colorScheme).colors(limits.length - 1);

        this.props.state.editingLayer.colorOptions.limits = limits;
        this.props.state.editingLayer.colorOptions.colors = this.props.state.editingLayer.colorOptions.revert ? colors.reverse() : colors;

    }

    /**
     * getOppositeColor - Returns a near-opposite color to the one given
     *
     * @param   color Color(hex) to compare
     * @return  Opposite color code(hex)
     */
    getOppositeColor = (color: string) => {
        if (color.toLowerCase() === '#fff' || color === '#ffffff' || color === 'white') {
            return '#000';
        }
        else if (color.toLowerCase() === '#000' || color === '#000000' || color === 'black') {
            return '#FFF'
        }
        return '#' + ('000000' + ((0xffffff ^ parseInt(color.substr(1), 16)).toString(16))).slice(-6);

    }

    getStepValues = () => {
        if (!this.props.state.editingLayer.colorOptions.useMultipleFillColors)
            return [];
        let limits: number[] = [];
        for (let i = 0; i < this.props.state.editingLayer.colorOptions.steps; i++) {
            let step: number = +(document.getElementById(i + 'min') as any).value
            limits.push(step)
        }
        limits.push(this.props.state.editingLayer.colorOptions.limits[this.props.state.editingLayer.colorOptions.limits.length - 1]);
        return limits;
    }
    saveOptions = () => {
        this.props.saveValues();
    }
    renderSteps() {
        let rows = [];
        let steps: number[] = [];
        for (let i in this.props.state.editingLayer.colorOptions.limits.slice()) {
            if (+i !== this.props.state.editingLayer.colorOptions.limits.length - 1) {
                let step: number = this.props.state.editingLayer.colorOptions.limits[i];

                steps.push(step);
            }
        }
        let row = 0;

        for (let i of steps) {
            rows.push(
                <li key={i}
                    style={{ background: this.props.state.editingLayer.colorOptions.colors[row] ? this.props.state.editingLayer.colorOptions.colors[row] : '#FFF' }}
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
        let col = this.props.state.editingLayer.colorOptions;
        let layer = this.props.state.editingLayer;
        let state = this.props.state.colorMenuState;

        let fillColorBlockStyle = {
            background: col.fillColor,
            color: this.getOppositeColor(col.fillColor),
            border: '1px solid ' + col.color,
        }
        let borderColorBlockStyle = {
            background: col.color,
            color: this.getOppositeColor(col.color),
            border: '1px solid ' + col.color,
        }
        let iconTextColorBlockStyle = {

            background: col.iconTextColor,
            color: this.getOppositeColor(col.iconTextColor),
            border: '1px solid ' + col.color,
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
        return (this.props.state.visibleMenu !== 2 ? null :
            <div className="mapify-options">
                {layer.layerType === LayerTypes.ChoroplethMap ? null :
                    <div>
                        <label htmlFor='multipleSelect'>Use multiple fill colors
                            <input
                                id='multipleSelect'
                                type='checkbox'
                                onChange={this.onMultipleColorsChange }
                                checked={col.useMultipleFillColors}/>
                        </label>
                    </div>
                }
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {col.useMultipleFillColors || layer.layerType === LayerTypes.ChoroplethMap ?
                        null :
                        <div className='colorBlock' style={fillColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'fillColor') }>Fill</div>
                    }
                    <div className='colorBlock' style={borderColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'borderColor') }>Border</div>
                    {layer.layerType === LayerTypes.SymbolMap && layer.symbolOptions.symbolType === SymbolTypes.Icon ?
                        <div className='colorBlock' style={iconTextColorBlockStyle} onClick={this.toggleColorPick.bind(this, 'iconTextColor') }>Icon</div>
                        : null
                    }

                </div>
                <label>Opacity</label>
                <input type='number' max={1} min={0} step={0.1} onChange={this.onOpacityChange } value={col.opacity}/>

                <Modal
                    isOpen={state.colorSelectOpen}
                    style={colorSelectStyle}
                    >

                    <ColorPicker.SwatchesPicker
                        width={300}
                        height={600}
                        overlowY='auto'
                        color={ state.startColor}
                        onChange={this.onColorSelect }
                        />
                    <button
                        className='primaryButton'
                        onClick={this.toggleColorPick.bind(this, state.editing) }
                        style={{ position: 'absolute', left: 80 }}>OK</button>
                </Modal>
                {
                    col.useMultipleFillColors || layer.layerType === LayerTypes.ChoroplethMap ?
                        <div>
                            <label>Select the variable to color by</label>
                            <Select
                                options={layer.numberHeaders}
                                onChange={this.onChoroVariableChange }
                                value={col.colorField}
                                clearable={false}
                                />
                            {col.colorField ?

                                <div>
                                    <label htmlFor='customScale'>Set custom scheme</label>
                                    <input
                                        id='customScale'
                                        type='checkbox'
                                        onChange={this.onCustomSchemeChange }
                                        checked={col.useCustomScheme}/>
                                    <br/>
                                    {col.useCustomScheme ?
                                        null :
                                        <div>
                                            Or
                                            <br/>
                                            <label>Select a color scheme</label>
                                            <Select
                                                clearable = {false}
                                                searchable = {false}
                                                options = {_gradientOptions}
                                                optionRenderer={this.renderScheme }
                                                valueRenderer = {this.renderScheme }
                                                onChange={this.onSchemeChange }
                                                value={col.colorScheme}
                                                />
                                            <label htmlFor='revertSelect'>Revert</label>
                                            <input
                                                id='revertSelect'
                                                type='checkbox'
                                                onChange={this.onRevertChange }
                                                checked={col.revert}/>
                                        </div>
                                    }
                                    <label>Steps</label>
                                    <input
                                        type='number'
                                        max={col.useCustomScheme ? 100 : 10}
                                        min={2}
                                        step={1}
                                        onChange={this.onStepsChange }
                                        value={col.steps}/>
                                    {col.useCustomScheme ?
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
                                                    onChange={this.onModeChange.bind(this, 'q') }
                                                    checked={col.mode === 'q'}
                                                    name='mode'
                                                    id='quantiles'
                                                    />
                                                <br/>
                                            </label>
                                            <label forHTML='kmeans'>
                                                K-means
                                                <input
                                                    type='radio'
                                                    onChange={this.onModeChange.bind(this, 'k') }
                                                    checked={col.mode === 'k'}
                                                    name='mode'
                                                    id='kmeans'
                                                    />
                                                <br/>

                                            </label>
                                            <label forHTML='equidistant'>
                                                Equidistant
                                                <input
                                                    type='radio'
                                                    onChange={this.onModeChange.bind(this, 'e') }
                                                    checked={col.mode === 'e'}
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
                {this.props.state.autoRefresh ? null :
                    <button className='menuButton' onClick={this.saveOptions }>Refresh map</button>
                }
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
