import * as React from 'react';
let Modal = require('react-modal');
let Select = require('react-select');
import {SymbolTypes} from './../common_items/common';

export class SymbolMenu extends React.Component<ISymbolMenuProps, ISymbolMenuStates>{
    constructor(props: ISymbolMenuProps) {
        super(props);

        this.getPreviousOptions(props.prevOptions, true)
    }
    getPreviousOptions(prev: ISymbolOptions, initial: boolean) {
        let headers = this.props.layer.headers.filter(function(head) { return head.type === 'number' });
        let state: ISymbolMenuStates = {
            selectableHeaders: headers,
            sizeXVar: prev ? prev.sizeXVar : '',
            sizeYVar: prev ? prev.sizeYVar : '',
            sizeMultiplier: prev.sizeMultiplier ? prev.sizeMultiplier : 1,
            sizeLowLimit: prev.sizeLowLimit ? prev.sizeMultiplier : 0,
            sizeUpLimit: prev.sizeUpLimit ? prev.sizeUpLimit : 90,
            symbolType: prev.symbolType ? prev.symbolType : SymbolTypes.Circle,
            icons: prev.icons ? prev.icons : [{ fa: 'fa-anchor', shape: 'circle' }],
            chartType: prev.chartType ? prev.chartType : 'pie',
            chartFields: prev.chartFields !== undefined ? prev.chartFields : headers,
            iconField: prev.iconField ? prev.iconField : headers[0].value,
            iconSelectOpen: false,
            currentIconIndex: 0,
            iconStepCount: prev.icons ? prev.icons.length : 5,
            blockValue: prev.blockValue ? prev.blockValue : 50,
        }
        initial ? this.state = state : this.setState(state);
    }
    componentWillReceiveProps(nextProps: ISymbolMenuProps) {

        this.getPreviousOptions(nextProps.prevOptions, false)

    }
    typeChanged(type: SymbolTypes) {
        this.setState({
            symbolType: type,
            sizeXVar: this.state.sizeXVar ? this.state.sizeXVar : this.props.headers[0] ? this.props.headers[0].label : undefined,
        });
    }
    xVariableChanged(val) {
        this.setState({
            sizeXVar: val ? val.value : '',
        });
    }

    yVariableChanged(val) {
        this.setState({
            sizeYVar: val ? val.value : '',
        });
    }
    sizeMultiplierChanged(e) {
        this.setState({
            sizeMultiplier: e.currentTarget.valueAsNumber
        });
    }
    sizeLowLimitChanged(e) {
        this.setState({
            sizeLowLimit: e.currentTarget.valueAsNumber
        });
    }
    sizeUpLimitChanged(e) {
        this.setState({
            sizeUpLimit: e.currentTarget.valueAsNumber
        });
    }
    blockValueChanged(e) {
        this.setState({
            blockValue: e.currentTarget.valueAsNumber
        });
    }
    faIconChanged(iconFA) {

        if (iconFA.currentTarget) { //if event triggered from input
            iconFA = iconFA.currentTarget.value
        }
        let icons = this.state.icons;
        icons[this.state.currentIconIndex].fa = iconFA;
        this.setState({
            icons: icons
        });
    }
    iconShapeChanged(shape: 'circle' | 'square' | 'star' | 'penta') {
        let icons = this.state.icons;
        icons[this.state.currentIconIndex].shape = shape;
        this.setState({
            icons: icons
        });
    }
    chartTypeChanged(type: 'pie' | 'donut') {
        this.setState({
            chartType: type
        });
    }
    chartFieldsChanged(e: IHeader[]) {
        if (e === null)
            e = [];
        this.setState({
            chartFields: e,
        });
    }
    toggleIconPick(index: number) {
        this.setState({
            iconSelectOpen: index !== this.state.currentIconIndex ? true : !this.state.iconSelectOpen,
            currentIconIndex: index,
        });
    }
    useIconStepsChanged(e) {
        let use = e.target.checked;
        this.setState({
            useIconSteps: use,
            icons: use ? this.state.icons : [this.state.icons[0]],
            iconLimits: use ? this.state.iconLimits : [],
        });
        if (use) {
            this.calculateValues(this.state.iconField, this.state.iconStepCount)
        }

    }
    iconFieldChanged(val: IHeader) {
        this.setState({
            iconField: val.value
        })
        this.calculateValues(val.value, this.state.iconStepCount);
    }
    changeIconStepsCount(amount: number) {
        let newVal = this.state.iconStepCount + amount;
        if (newVal > 0) {
            this.setState({
                iconStepCount: newVal,
            });
            this.calculateValues(this.state.iconField, newVal)
        }
    }
    saveOptions() {
        this.props.saveValues({
            sizeXVar: this.state.sizeXVar,
            sizeYVar: this.state.sizeYVar,
            sizeMultiplier: this.state.sizeMultiplier,
            sizeLowLimit: this.state.sizeLowLimit,
            sizeUpLimit: this.state.sizeUpLimit,
            symbolType: this.state.symbolType,
            icons: this.state.icons,
            iconLimits: this.state.iconLimits,
            iconField: this.state.iconField,
            chartFields: this.state.chartFields,
            chartType: this.state.chartType,
            blockValue: this.state.blockValue,
        });
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
    calculateValues(fieldName: string, steps: number) {
        let lyr = this.props.layer;
        let max, min;
        let values = (lyr.geoJSON as any).features.map(function(feat) {
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
        let limits: number[] = [];
        let icons: IIcon[] = [];
        let index = 0;
        for (let i = min; i < max; i += (max - min) / steps) {
            limits.push(i);
            icons.push(this.state.icons[index] ? this.state.icons[index] : { fa: 'fa-anchor', shape: 'circle' })
            index++;
        }
        limits.push(max)


        this.setState({
            iconLimits: limits,
            icons: icons,
        })
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
            !this.props.isVisible ? null :
                <div className="mapify-options">
                    <label forHTML='circle'>
                        <i style={{ margin: 4 }} className='fa fa-circle-o'/>
                        Circle
                        <input
                            type='radio'
                            onChange={this.typeChanged.bind(this, SymbolTypes.Circle) }
                            checked={this.state.symbolType === SymbolTypes.Circle}
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
                            onChange={this.typeChanged.bind(this, SymbolTypes.Rectangle) }
                            checked={this.state.symbolType === SymbolTypes.Rectangle}
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
                            onChange={this.typeChanged.bind(this, SymbolTypes.Icon) }
                            checked={this.state.symbolType === SymbolTypes.Icon}
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
                            onChange={this.typeChanged.bind(this, SymbolTypes.Chart) }
                            checked={this.state.symbolType === SymbolTypes.Chart}
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
                            onChange={this.typeChanged.bind(this, SymbolTypes.Blocks) }
                            checked={this.state.symbolType === SymbolTypes.Blocks}
                            name='symboltype'
                            id='blocks'
                            />
                        <br/>
                    </label>
                    {this.state.symbolType === SymbolTypes.Circle || this.state.symbolType === SymbolTypes.Rectangle || this.state.symbolType === SymbolTypes.Chart || this.state.symbolType === SymbolTypes.Blocks ?
                        <div>
                            <label>Scale {this.state.symbolType === SymbolTypes.Rectangle ? 'width' : 'size'} by</label>
                            <Select
                                options={this.state.selectableHeaders}
                                onChange={this.xVariableChanged.bind(this) }
                                value={this.state.sizeXVar}
                                />
                            {this.state.symbolType === SymbolTypes.Rectangle ? <div>
                                <label>Scale height by</label>
                                <Select
                                    options={this.state.selectableHeaders}
                                    onChange={this.yVariableChanged.bind(this) }
                                    value={this.state.sizeYVar}
                                    />
                            </div> : null}
                            {this.state.symbolType !== SymbolTypes.Blocks && (this.state.sizeXVar || this.state.sizeYVar) ?
                                <div><label>Size multiplier</label>
                                    <input type="number" value={this.state.sizeMultiplier} onChange={this.sizeMultiplierChanged.bind(this) } min={0.1} max={10} step={0.1}/>
                                    <br/>
                                    <label>Size lower limit</label>
                                    <input type="number" value={this.state.sizeLowLimit} onChange={this.sizeLowLimitChanged.bind(this) } min={0}/>
                                    <br/>
                                    <label>Size upper limit</label>
                                    <input type="number" value={this.state.sizeUpLimit} onChange={this.sizeUpLimitChanged.bind(this) } min={1}/>
                                </div>
                                : null}
                        </div>

                        : null
                    }

                    {
                        this.state.symbolType === SymbolTypes.Icon ?
                            <div>
                                <label htmlFor='iconSteps'>Use multiple icons</label>
                                <input id='iconSteps' type='checkbox' onChange={this.useIconStepsChanged.bind(this) } checked={this.state.useIconSteps}/>

                                {this.state.useIconSteps ?
                                    <div>
                                        <label>Field to change icon by</label>
                                        <Select
                                            options={this.state.selectableHeaders}
                                            onChange={this.iconFieldChanged.bind(this) }
                                            value={this.state.iconField}
                                            />
                                        {this.state.iconField ?
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
                                        {this.getIcon(this.state.icons[0].shape, this.state.icons[0].fa, '#999999', 'transparent', this.toggleIconPick.bind(this, 0)) }

                                    </div>
                                }

                                <br/>
                                Change icon colors in the color menu
                            </div>

                            : null
                    }
                    {this.state.symbolType === SymbolTypes.Chart ?
                        <div>
                            <label>Select the variables to show</label>
                            <Select
                                options={this.state.selectableHeaders}
                                multi
                                onChange={this.chartFieldsChanged.bind(this) }
                                value={this.state.chartFields}
                                />
                            Chart type
                            <br/>
                            <label forHTML='pie'>
                                Pie
                                <input
                                    type='radio'
                                    onChange={this.chartTypeChanged.bind(this, 'pie') }
                                    checked={this.state.chartType === 'pie'}
                                    name='charttype'
                                    id='rect'
                                    />
                                <br/>

                            </label>
                            <label forHTML='donut'>
                                Donut
                                <input
                                    type='radio'
                                    onChange={this.chartTypeChanged.bind(this, 'donut') }
                                    checked={this.state.chartType === 'donut'}
                                    name='charttype'
                                    id='donut'
                                    />
                                <br/>

                            </label>
                            <i>TIP: hover over symbol segments to see corresponding value</i>
                        </div>

                        : null
                    }
                    {this.state.symbolType === SymbolTypes.Blocks ?
                        <div>
                            <label>Single block value</label>
                            <input type="number" value={this.state.blockValue} onChange={this.blockValueChanged.bind(this) } min={0}/>
                        </div>
                        : null

                    }
                    <button className='menuButton' onClick={this.saveOptions.bind(this) }>Refresh map</button>
                    <Modal
                        isOpen={this.state.iconSelectOpen}
                        style={iconSelectStyle}
                        >
                        {this.state.iconSelectOpen ? <div>
                            Icon
                            {this.renderIcons.call(this) }
                            Or
                            <br/>
                            <label>Use another <a href='http://fontawesome.io/icons/'>Font Awesome</a> icon</label>
                            <input type="text" onChange={this.faIconChanged.bind(this) } value={this.state.icons[this.state.currentIconIndex].fa}/>

                            <br/>
                            Icon shape
                            <br/>
                            <div
                                style ={{ display: 'inline-block' }}
                                onClick={this.iconShapeChanged.bind(this, 'circle') }>
                                {this.getIcon('circle', '', '#999999', 'transparent', null) }
                            </div>
                            <div
                                style ={{ display: 'inline-block' }}
                                onClick={this.iconShapeChanged.bind(this, 'square') }>
                                {this.getIcon('square', '', '#999999', 'transparent', null) }
                            </div>
                            <div
                                style ={{ display: 'inline-block' }}
                                onClick={this.iconShapeChanged.bind(this, 'star') }>
                                {this.getIcon('star', '', '#999999', 'transparent', null) }
                            </div>
                            <div
                                style ={{ display: 'inline-block' }}
                                onClick={this.iconShapeChanged.bind(this, 'penta') }>
                                {this.getIcon('penta', '', '#999999', 'transparent', null) }
                            </div>
                            <br/>
                            <button
                                className='primaryButton'
                                onClick={this.toggleIconPick.bind(this, this.state.currentIconIndex) }
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
                    border: this.state.icons[this.state.currentIconIndex].iconFA === faIcons[i + c] ? '1px solid #000' : '1px solid #FFF',
                    borderRadius: 30,
                    lineHeight: '30px',
                    textAlign: 'center'
                }
                columns.push(<td style={style} key={i + c} className={'symbolIcon fa ' + faIcons[i + c]} onClick={this.faIconChanged.bind(this, faIcons[i + c]) }/>);
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
        for (let i in this.state.iconLimits) {
            if (+i !== this.state.iconLimits.length - 1) {

                let step: number = this.state.iconLimits[i];
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
                    {this.getIcon(this.state.icons[row].shape, this.state.icons[row].fa, '#999999', 'transparent', this.toggleIconPick.bind(this, row)) }
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
