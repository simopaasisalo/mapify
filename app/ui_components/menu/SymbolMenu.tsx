import * as React from 'react';
let Select = require('react-select');
import {SymbolTypes} from './../common_items/common';

export class SymbolMenu extends React.Component<ISymbolMenuProps, ISymbolMenuStates>{
    constructor(props: ISymbolMenuProps) {
        super(props);
        this.state =
            {
                sizeXVar: this.props.prevOptions ? this.props.prevOptions.sizeXVariable : this.props.headers[0].label,
                sizeYVar: this.props.prevOptions ? this.props.prevOptions.sizeYVariable : this.props.headers[0].label,

                sizeMultiplier: 1,
                sizeLowLimit: 0,
                sizeUpLimit: 90,
                symbolType: SymbolTypes.Circle,
                iconFA: 'fa-anchor',
                iconShape: 'circle',
                chartFields: this.props.headers
            };
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
        })
    }
    saveOptions() {
        let chartHeads: string[] = [];
        this.state.chartFields.map(function(h) {
            chartHeads.push(h.label)
        });
        this.props.saveValues({
            sizeXVariable: this.state.sizeXVar,
            sizeYVariable: this.state.sizeYVar,
            sizeMultiplier: this.state.sizeMultiplier,
            sizeLowerLimit: this.state.sizeLowLimit,
            sizeUpperLimit: this.state.sizeUpLimit,
            symbolType: this.state.symbolType,
            iconFA: this.state.iconFA,
            iconShape: this.state.iconShape,
            chartFields: chartHeads
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
    chartFieldsChanged(e: IHeader[]) {
        if (e === null)
            e = [];
        this.setState({
            chartFields: e,
        });
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
                                <div>
                                    <label forHTML='circle'>
                                        Circle
                                        <input
                                            type='radio'
                                            onChange={this.iconShapeChanged.bind(this, 'circle') }
                                            checked={this.state.iconShape === 'circle'}
                                            name='iconShape'
                                            id='circle'
                                            />
                                        <br/>
                                    </label>
                                    <label forHTML='square'>
                                        Square
                                        <input
                                            type='radio'
                                            onChange={this.iconShapeChanged.bind(this, 'square') }
                                            checked={this.state.iconShape === 'square'}
                                            name='iconShape'
                                            id='square'
                                            />
                                        <br/>
                                    </label>
                                    <label forHTML='star'>
                                        Star
                                        <input
                                            type='radio'
                                            onChange={this.iconShapeChanged.bind(this, 'star') }
                                            checked={this.state.iconShape === 'star'}
                                            name='iconShape'
                                            id='star'
                                            />
                                        <br/>
                                    </label>
                                    <label forHTML='penta'>
                                        Penta
                                        <input
                                            type='radio'
                                            onChange={this.iconShapeChanged.bind(this, 'penta') }
                                            checked={this.state.iconShape === 'penta'}
                                            name='iconShape'
                                            id='penta'
                                            />
                                        <br/>
                                    </label>

                                </div>
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
