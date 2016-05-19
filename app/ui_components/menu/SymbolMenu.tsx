import * as React from 'react';
let Select = require('react-select');
import {SymbolTypes} from './../common_items/common';

export class SymbolMenu extends React.Component<ISymbolMenuProps, ISymbolMenuStates>{
    constructor(props: ISymbolMenuProps) {
        super(props);

        this.getPreviousOptions(props.prevOptions, true)
    }
    getPreviousOptions(prev: ISymbolOptions, initial: boolean) {
        let state: ISymbolMenuStates = {
            sizeXVar: prev ? prev.sizeXVar : '',
            sizeYVar: prev ? prev.sizeYVar : '',
            sizeMultiplier: prev.sizeMultiplier ? prev.sizeMultiplier : 1,
            sizeLowLimit: prev.sizeLowLimit ? prev.sizeMultiplier : 0,
            sizeUpLimit: prev.sizeUpLimit ? prev.sizeUpLimit : 90,
            symbolType: prev.symbolType ? prev.symbolType : SymbolTypes.Circle,
            iconFA: prev.iconFA ? prev.iconFA : 'fa-anchor',
            iconShape: prev.iconShape ? prev.iconShape : 'circle',
            chartType: prev.chartType ? prev.chartType : 'pie',
            chartFields: prev.chartFields !== undefined ? prev.chartFields : this.props.headers

        }
        initial ? this.state = state : this.setState(state);
    }
    componentWillReceiveProps(nextProps: ISymbolMenuProps) {

        this.getPreviousOptions(nextProps.prevOptions, false)

    }
    typeChanged(type: SymbolTypes) {
        this.setState({
            symbolType: type,
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
    faIconChanged(icon) {
        if (icon.currentTarget) { //if event triggered from input
            icon = icon.currentTarget.value
        }
        this.setState({
            iconFA: icon,
        });
    }
    iconShapeChanged(shape: 'circle' | 'square' | 'star' | 'penta') {
        this.setState({
            iconShape: shape
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
    saveOptions() {
        let chartHeads: string[] = [];
        this.state.chartFields.map(function(h) {
            chartHeads.push(h.label)
        });
        this.props.saveValues({
            sizeXVar: this.state.sizeXVar,
            sizeYVar: this.state.sizeYVar,
            sizeMultiplier: this.state.sizeMultiplier,
            sizeLowLimit: this.state.sizeLowLimit,
            sizeUpLimit: this.state.sizeUpLimit,
            symbolType: this.state.symbolType,
            iconFA: this.state.iconFA,
            iconShape: this.state.iconShape,
            chartFieldNames: chartHeads,
            chartType: this.state.chartType,
        });
    }
    getIcons() {
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
                    border: this.state.iconFA === faIcons[i + c] ? '1px solid #999999' : '1px solid #1a263f',
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
    render() {
        return (
            !this.props.isVisible ? null :
                <div className="mapify-options">
                    <label forHTML='circle'>
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
                    <label forHTML='char'>
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

                    {this.state.symbolType === SymbolTypes.Circle || this.state.symbolType === SymbolTypes.Rectangle ?
                        <div>
                            <label>Scale width by</label>
                            <Select
                                options={this.props.headers}
                                onChange={this.xVariableChanged.bind(this) }
                                value={this.state.sizeXVar}
                                />
                            {this.state.symbolType === SymbolTypes.Rectangle ? <div>
                                <label>Scale height by</label>
                                <Select
                                    options={this.props.headers}
                                    onChange={this.yVariableChanged.bind(this) }
                                    value={this.state.sizeYVar}
                                    />
                            </div> : null}
                            {this.state.sizeXVar || this.state.sizeYVar ?
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

                                Icon
                                {this.getIcons.call(this) }
                                Or
                                <br/>
                                <label>Use another <a href='http://fontawesome.io/icons/'>Font Awesome</a> icon</label>
                                <input type="text" onChange={this.faIconChanged.bind(this) } value={this.state.iconFA}/>
                                <br/>
                                Icon shape
                                <br/>
                                <div
                                    style ={{ borderBottom: this.state.iconShape === 'circle' ? '4px solid #999999' : '1px solid #1a263f', display: 'inline-block' }}
                                    onClick={this.iconShapeChanged.bind(this, 'circle') }>
                                    <svg viewBox="0 0 69.529271 95.44922" height="40" width="40">
                                        <g transform="translate(-139.52 -173.21)">
                                            <path fill="#999999" d="m174.28 173.21c-19.199 0.00035-34.764 15.355-34.764 34.297 0.007 6.7035 1.5591 12.813 5.7461 18.854l0.0234 0.0371 28.979 42.262 28.754-42.107c3.1982-5.8558 5.9163-11.544 6.0275-19.045-0.0001-18.942-15.565-34.298-34.766-34.297z"/>
                                        </g>
                                    </svg>


                                </div>
                                <div
                                    style ={{ borderBottom: this.state.iconShape === 'square' ? '4px solid #999999' : '1px solid #1a263f', display: 'inline-block' }}
                                    onClick={this.iconShapeChanged.bind(this, 'square') }>
                                    <svg viewBox="0 0 69.457038 96.523441" height="40" width="40">
                                        <g transform="translate(-545.27 -658.39)">
                                            <path fill="#999999" d="m545.27 658.39v65.301h22.248l12.48 31.223 12.676-31.223h22.053v-65.301h-69.457z"/>
                                        </g>
                                    </svg>
                                </div>
                                <div
                                    style ={{ borderBottom: this.state.iconShape === 'star' ? '4px solid #999999' : '1px solid #1a263f', display: 'inline-block' }}
                                    onClick={this.iconShapeChanged.bind(this, 'star') }>
                                    <svg height="40" width="40" viewBox="0 0 77.690999 101.4702"><g transform="translate(-101.15 -162.97)">
                                        <g transform="matrix(1 0 0 1.0165 -65.712 -150.28)">
                                            <path fill="#999999" d="m205.97 308.16-11.561 11.561h-16.346v16.346l-11.197 11.197 11.197 11.197v15.83h15.744l11.615 33.693 11.467-33.568 0.125-0.125h16.346v-16.346l11.197-11.197-11.197-11.197v-15.83h-15.83l-11.561-11.561z"/></g>
                                    </g>
                                    </svg>
                                </div>
                                <div
                                    style ={{ borderBottom: this.state.iconShape === 'penta' ? '4px solid #999999' : '1px solid #1a263f', display: 'inline-block' }}
                                    onClick={this.iconShapeChanged.bind(this, 'penta') }>
                                    <svg viewBox="0 0 71.550368 96.362438" height="40" width="40">
                                        <g transform="translate(-367.08 -289.9)">
                                            <path fill="#999999" d="m367.08 322.5 17.236-32.604h36.151l18.164 32.25-35.665 64.112z"/></g>
                                    </svg>
                                </div>
                                <br/>
                                Change icon colors in the color menu
                            </div>

                            : null
                    }
                    {this.state.symbolType === SymbolTypes.Chart ?
                        <div>
                            <label>Select the variables to show</label>
                            <Select
                                options={this.props.headers}
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
                    <button className='menuButton' onClick={this.saveOptions.bind(this) }>Refresh map</button>
                </div >
        );
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
