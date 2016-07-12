import * as React from 'react';
let Modal = require('react-modal');
let Select = require('react-select');
import {SymbolTypes} from './../common_items/common';
import {AppState, Layer, SymbolOptions} from '../Stores';
import {observer} from 'mobx-react';

@observer
export class SymbolMenu extends React.Component<{
    state: AppState,
    saveValues: () => void,
}, {}>{
    private activeLayer = this.props.state.editingLayer;
    private symbolOptions = this.activeLayer.visOptions.symbolOptions;
    private UIState = this.props.state.symbolMenuState;

    componentWillUpdate() {
        if (this.props.state.autoRefresh)
            this.props.saveValues();
    }
    onTypeChange = (type: SymbolTypes) => {
        this.symbolOptions.symbolType = type;
        this.symbolOptions.sizeXVar = this.symbolOptions.sizeXVar ? this.symbolOptions.sizeXVar : this.activeLayer.numberHeaders[0] ? this.activeLayer.numberHeaders[0].label : undefined;
        this.symbolOptions.iconField = this.symbolOptions.iconField ? this.symbolOptions.iconField : this.activeLayer.numberHeaders[0] ? this.activeLayer.numberHeaders[0].label : undefined;
        this.symbolOptions.chartFields = this.symbolOptions.chartFields.length > 0 ? this.symbolOptions.chartFields : this.activeLayer.numberHeaders;

    }
    onXVariableChange = (val) => {
        this.symbolOptions.sizeXVar = val ? val.value : '';
    }
    onYVariableChange = (val) => {
        this.symbolOptions.sizeYVar = val ? val.value : '';
    }
    onSizeMultiplierChange = (e) => {
        this.symbolOptions.sizeMultiplier = e.currentTarget.valueAsNumber;
    }
    onSizeLowLimitChange = (e) => {
        this.symbolOptions.sizeLowLimit = e.currentTarget.valueAsNumber;
    }
    onSizeUpLimitChange = (e) => {
        this.symbolOptions.sizeUpLimit = e.currentTarget.valueAsNumber;
    }
    onBlockValueChange = (e) => {
        this.symbolOptions.blockValue = e.currentTarget.valueAsNumber;
    }
    onFAIconChange = (e) => {
        if (e.currentTarget) { //if event triggered from input
            e = e.currentTarget.value
        }
        this.symbolOptions.icons[this.UIState.currentIconIndex].fa = e;
    }
    onIconShapeChange = (shape: 'circle' | 'square' | 'star' | 'penta') => {
        this.symbolOptions.icons[this.UIState.currentIconIndex].shape = shape;
    }
    onChartTypeChange = (type: 'pie' | 'donut') => {

        this.symbolOptions.chartType = type;
    }
    onChartFieldsChange = (e: IHeader[]) => {
        let headers = this.symbolOptions.chartFields;
        if (e === null)
            e = [];
        headers.splice(0, headers.length) //empty headers
        for (let i in e) { //add new headers
            headers.push(e[i]);
        }
    }
    toggleIconSelect = (index: number) => {
        this.UIState.iconSelectOpen = index !== this.UIState.currentIconIndex ? true : !this.UIState.iconSelectOpen;
        this.UIState.currentIconIndex = index;
    }
    onUseIconStepsChange = (e) => {
        let use = e.target.checked;
        this.UIState.useIconSteps = use;
        this.symbolOptions.icons = use ? this.symbolOptions.icons : [this.symbolOptions.icons.slice()[0]];
        this.symbolOptions.iconLimits = use ? this.symbolOptions.iconLimits : [];
        if (use) {
            this.calculateIconValues(this.symbolOptions.iconField, this.UIState.iconStepCount)
        }

    }
    onIconFieldChange = (val: IHeader) => {
        this.symbolOptions.iconField = val.value;
        this.calculateIconValues(val.value, this.UIState.iconStepCount);
    }
    changeIconStepsCount = (amount: number) => {
        let newVal = this.UIState.iconStepCount ? this.UIState.iconStepCount + amount : 1;
        if (newVal > 0) {

            this.UIState.iconStepCount = newVal;
            this.calculateIconValues(this.symbolOptions.iconField, newVal)
        }
    }
    saveOptions = () => {
        this.props.saveValues();
    }

    getIcon(shape: string, fa: string, stroke: string, fill: string, onClick) {
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
                break;
        }
        return <div
            onClick={onClick }
            style={{
                cursor: 'pointer',
                display: 'inline-block',
                textAlign: 'center',
                verticalAlign: 'middle',
                width: 42,
                height: 42,
            }}
            >
            {activeIcon}
            <i style={{ position: 'relative', bottom: 33, width: 18, height: 18 }} className={'fa ' + fa}/>
        </div>

    }
    calculateIconValues(fieldName: string, steps: number) {

        let max, min;
        let values = (this.activeLayer.geoJSON as any).features.map(function(feat) {
            let val = feat.properties[fieldName];

            if (!max && !min) {
                max = val;
                min = val;
            }
            else if (val > max)
                max = val;
            else if (val < min)
                min = val;
            return val;
        });
        let index = 0;
        this.symbolOptions.iconLimits.splice(0, this.symbolOptions.iconLimits.length)

        for (let i = min; i < max; i += (max - min) / steps) {
            this.symbolOptions.iconLimits.push(i);
            if (!this.symbolOptions.icons[index]) {
                this.symbolOptions.icons.push({ fa: 'fa-anchor', shape: 'circle' })
            }
            index++;
        }
        this.symbolOptions.iconLimits.push(max)
    }

    render() {
        let iconSelectStyle = {
            overlay: {
                position: 'fixed',
                height: 550,
                width: 280,
                right: 250,
                bottom: '',
                top: 20,
                left: '',
                backgroundColor: ''

            },
            content: {
                border: '4px solid #6891e2',
                borderRadius: '15px',
                padding: '0px',
                height: 550,
                width: 280,
                right: '',
                bottom: '',
                top: '',
                left: '',
                textAlign: 'center',
                lineHeight: 1.5
            }
        }
        return (
            this.props.state.visibleMenu !== 3 ? null :
                <div className="mapify-options">
                    <label forHTML='circle'>
                        <i style={{ margin: 4 }} className='fa fa-circle-o'/>
                        Circle
                        <input
                            type='radio'
                            onChange={this.onTypeChange.bind(this, SymbolTypes.Circle) }
                            checked={this.symbolOptions.symbolType === SymbolTypes.Circle}
                            name='symboltype'
                            id='circle'
                            />
                        <br/>
                    </label>
                    <label forHTML='rect'>
                        <i style={{ margin: 4 }} className='fa fa-signal'/>
                        Rectangle
                        <input
                            type='radio'
                            onChange={this.onTypeChange.bind(this, SymbolTypes.Rectangle) }
                            checked={this.symbolOptions.symbolType === SymbolTypes.Rectangle}
                            name='symboltype'
                            id='rect'
                            />
                        <br/>
                    </label>
                    <label forHTML='icon'>
                        <i style={{ margin: 4 }} className='fa fa-map-marker'/>
                        Icon
                        <input
                            type='radio'
                            onChange={this.onTypeChange.bind(this, SymbolTypes.Icon) }
                            checked={this.symbolOptions.symbolType === SymbolTypes.Icon}
                            name='symboltype'
                            id='icon'
                            />
                        <br/>
                    </label>
                    <label forHTML='chart'>
                        <i style={{ margin: 4 }} className='fa fa-pie-chart'/>
                        Chart
                        <input
                            type='radio'
                            onChange={this.onTypeChange.bind(this, SymbolTypes.Chart) }
                            checked={this.symbolOptions.symbolType === SymbolTypes.Chart}
                            name='symboltype'
                            id='chart'
                            />
                        <br/>
                    </label>
                    <label forHTML='blocks'>
                        <i style={{ margin: 4 }} className='fa fa-th-large'/>
                        Blocks
                        <input
                            type='radio'
                            onChange={this.onTypeChange.bind(this, SymbolTypes.Blocks) }
                            checked={this.symbolOptions.symbolType === SymbolTypes.Blocks}
                            name='symboltype'
                            id='blocks'
                            />
                        <br/>
                    </label>
                    {this.symbolOptions.symbolType === SymbolTypes.Circle || this.symbolOptions.symbolType === SymbolTypes.Rectangle || this.symbolOptions.symbolType === SymbolTypes.Chart || this.symbolOptions.symbolType === SymbolTypes.Blocks ?
                        <div>
                            <label>Scale {this.symbolOptions.symbolType === SymbolTypes.Rectangle ? 'width' : 'size'} by</label>
                            <Select
                                options={this.activeLayer.numberHeaders}
                                onChange={this.onXVariableChange }
                                value={this.symbolOptions.sizeXVar}
                                />
                            {this.symbolOptions.symbolType === SymbolTypes.Rectangle ? <div>
                                <label>Scale height by</label>
                                <Select
                                    options={this.activeLayer.numberHeaders }
                                    onChange={this.onYVariableChange }
                                    value={this.symbolOptions.sizeYVar}
                                    />
                            </div> : null}
                            {this.symbolOptions.symbolType !== SymbolTypes.Blocks && (this.symbolOptions.sizeXVar || this.symbolOptions.sizeYVar) ?
                                <div><label>Size multiplier</label>
                                    <input type="number" value={this.symbolOptions.sizeMultiplier} onChange={this.onSizeMultiplierChange } min={0.1} max={10} step={0.1}/>
                                    <br/>
                                    <label>Size lower limit</label>
                                    <input type="number" value={this.symbolOptions.sizeLowLimit} onChange={this.onSizeLowLimitChange } min={0}/>
                                    <br/>
                                    <label>Size upper limit</label>
                                    <input type="number" value={this.symbolOptions.sizeUpLimit} onChange={this.onSizeUpLimitChange } min={1}/>
                                </div>
                                : null}
                        </div>

                        : null
                    }

                    {
                        this.symbolOptions.symbolType === SymbolTypes.Icon ?
                            <div>
                                <label htmlFor='iconSteps'>Use multiple icons</label>
                                <input id='iconSteps' type='checkbox' onChange={this.onUseIconStepsChange } checked={this.UIState.useIconSteps}/>

                                {this.UIState.useIconSteps ?
                                    <div>
                                        <label>Field to change icon by</label>
                                        <Select
                                            options={this.activeLayer.numberHeaders}
                                            onChange={this.onIconFieldChange }
                                            value={this.symbolOptions.iconField}
                                            />
                                        {this.symbolOptions.iconField ?
                                            <div>Set the <i>lower limit</i> and icon
                                                <br/>
                                                <button onClick={this.changeIconStepsCount.bind(this, -1) }>-</button>
                                                <button onClick={this.changeIconStepsCount.bind(this, 1) }>+</button>
                                                {this.renderSteps.call(this) }
                                            </div> : null}
                                    </div>
                                    :
                                    <div>
                                        Set icon
                                        {this.getIcon(this.symbolOptions.icons[0].shape, this.symbolOptions.icons[0].fa, '#999999', 'transparent', this.toggleIconSelect.bind(this, 0)) }

                                    </div>
                                }

                                <br/>
                                Change icon colors in the color menu
                            </div>

                            : null
                    }
                    {this.symbolOptions.symbolType === SymbolTypes.Chart ?
                        <div>
                            <label>Select the variables to show</label>
                            <Select
                                options={this.activeLayer.numberHeaders}
                                multi
                                onChange={this.onChartFieldsChange }
                                value={this.symbolOptions.chartFields.slice() }
                                />
                            Chart type
                            <br/>
                            <label forHTML='pie'>
                                Pie
                                <input
                                    type='radio'
                                    onChange={this.onChartTypeChange.bind(this, 'pie') }
                                    checked={this.symbolOptions.chartType === 'pie'}
                                    name='charttype'
                                    id='rect'
                                    />
                                <br/>

                            </label>
                            <label forHTML='donut'>
                                Donut
                                <input
                                    type='radio'
                                    onChange={this.onChartTypeChange.bind(this, 'donut') }
                                    checked={this.symbolOptions.chartType === 'donut'}
                                    name='charttype'
                                    id='donut'
                                    />
                                <br/>

                            </label>
                            <i>TIP: hover over symbol segments to see corresponding value</i>
                        </div>

                        : null
                    }
                    {this.symbolOptions.symbolType === SymbolTypes.Blocks ?
                        <div>
                            <label>Single block value</label>
                            <input type="number" value={this.symbolOptions.blockValue} onChange={this.onBlockValueChange } min={0}/>
                        </div>
                        : null

                    }
                    {this.props.state.autoRefresh ? null :
                        <button className='menuButton' onClick={this.saveOptions }>Refresh map</button>
                    }
                    <Modal
                        isOpen={this.UIState.iconSelectOpen}
                        style={iconSelectStyle}
                        >
                        {this.UIState.iconSelectOpen ? <div>
                            Icon
                            {this.renderIcons.call(this) }
                            Or
                            <br/>
                            <label>Use another <a href='http://fontawesome.io/icons/'>Font Awesome</a> icon</label>
                            <input type="text" onChange={this.onFAIconChange } value={this.symbolOptions.icons[this.UIState.currentIconIndex].fa}/>

                            <br/>
                            Icon shape
                            <br/>
                            <div
                                style ={{ display: 'inline-block' }}
                                onClick={this.onIconShapeChange.bind(this, 'circle') }>
                                {this.getIcon('circle', '', '#999999', 'transparent', null) }
                            </div>
                            <div
                                style ={{ display: 'inline-block' }}
                                onClick={this.onIconShapeChange.bind(this, 'square') }>
                                {this.getIcon('square', '', '#999999', 'transparent', null) }
                            </div>
                            <div
                                style ={{ display: 'inline-block' }}
                                onClick={this.onIconShapeChange.bind(this, 'star') }>
                                {this.getIcon('star', '', '#999999', 'transparent', null) }
                            </div>
                            <div
                                style ={{ display: 'inline-block' }}
                                onClick={this.onIconShapeChange.bind(this, 'penta') }>
                                {this.getIcon('penta', '', '#999999', 'transparent', null) }
                            </div>
                            <br/>
                            <button
                                className='primaryButton'
                                onClick={this.toggleIconSelect.bind(this, this.UIState.currentIconIndex) }
                                style={{ position: 'absolute', left: 80 }}>OK</button>
                        </div>
                            : null}
                    </Modal>
                </div >
        );

    }
    renderIcons() {
        let arr = [];
        let columnCount = 7;
        for (let i = 0; i < faIcons.length; i += columnCount) {

            arr.push(
                <tr key={i}>
                    {getColumns.call(this, i).map(
                        function(column) {
                            return column;
                        })
                    }
                </tr>
            );
        }

        function getColumns(i: number) {
            let columns = [];
            for (let c = 0; c < columnCount; c++) {
                let style = {
                    width: 30,
                    height: 30,
                    border: this.symbolOptions.icons[this.UIState.currentIconIndex].iconFA === faIcons[i + c] ? '1px solid #000' : '1px solid #FFF',
                    borderRadius: 30,
                    lineHeight: '30px',
                    textAlign: 'center'
                }
                columns.push(<td style={style} key={i + c} className={'symbolIcon fa ' + faIcons[i + c]} onClick={this.onFAIconChange.bind(this, faIcons[i + c]) }/>);
            }
            return columns;
        }
        return (
            <table style={{ width: '100%', cursor: 'pointer' }}>
                <tbody>
                    {arr.map(function(td) {
                        return td;
                    }) }
                </tbody>
            </table>
        );

    }
    renderSteps() {
        let rows = [];
        let steps: number[] = [];
        for (let i in this.symbolOptions.iconLimits.slice()) {
            if (+i !== this.symbolOptions.iconLimits.slice().length - 1) {
                let step: number = this.symbolOptions.iconLimits[i];
                steps.push(step);
            }
        }
        let row = 0;
        for (let i of steps) {

            rows.push(
                <li key={i} style={{ lineHeight: 0 }}>
                    <input
                        id={row + 'min'}
                        type='number'
                        defaultValue={i.toFixed(2) }
                        style={{
                            width: 100,

                        }}
                        step='any'/>
                    {this.getIcon(this.symbolOptions.icons[row].shape, this.symbolOptions.icons[row].fa, '#999999', 'transparent', this.toggleIconSelect.bind(this, row)) }
                </li>);
            row++;
        }


        return <ul id='customSteps' style={{ listStyle: 'none', padding: 0 }}>{rows.map(function(r) { return r }) }</ul>
    }

}


let faIcons = [
    'fa-anchor',
    'fa-asterisk',
    'fa-automobile',
    'fa-motorcycle',
    'fa-ship',
    'fa-bank',
    'fa-shopping-bag',
    'fa-shopping-cart',
    'fa-bed',
    'fa-bell',
    'fa-binoculars',
    'fa-bicycle',
    'fa-bug',
    'fa-paw',
    'fa-camera',
    'fa-cloud',
    'fa-bolt',
    'fa-sun-o',
    'fa-beer',
    'fa-coffee',
    'fa-cutlery',
    'fa-diamond',
    'fa-exclamation',
    'fa-exclamation-triangle',
    'fa-female',
    'fa-male',
    'fa-fire',
    'fa-fire-extinguisher',
    'fa-flag',
    'fa-futbol-o',
    'fa-heart-o',
    'fa-home',
    'fa-info',
    'fa-leaf',
    'fa-tree',
    'fa-map-marker',
    'fa-minus-circle',
    'fa-pencil',
    'fa-question-circle',
    'fa-power-off',
    'fa-recycle',
    'fa-remove',
    'fa-road',
    'fa-rocket',
    'fa-search',
    'fa-star-o',
    'fa-thumb-tack',
    'fa-thumbs-o-up',
    'fa-thumbs-o-down',
    'fa-tint',
    'fa-trash',
    'fa-umbrella',
    'fa-wifi',
    'fa-wrench',
    'fa-life-ring',
    'fa-wheelchair',

];
