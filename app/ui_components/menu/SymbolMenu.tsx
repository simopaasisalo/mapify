import * as React from 'react';
let Select = require('react-select');
import {SymbolTypes} from './../common_items/common';

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

export class SymbolMenu extends React.Component<ISymbolMenuProps, ISymbolMenuStates>{
    constructor(props: ISymbolMenuProps) {
        super(props);
        this.state =
            {
                sizeVar: this.props.prevOptions ? this.props.prevOptions.sizeVariable : this.props.headers[0].label,
                sizeMultiplier: 1,
                sizeLowLimit: 0,
                sizeUpLimit: 90,
                symbolType: SymbolTypes.Circle,
                iconFA: 'fa-anchor',
            };
    }
    shouldComponentUpdate(nextProps: ISymbolMenuProps, nextState: ISymbolMenuStates) {
        return nextProps.isVisible !== this.props.isVisible ||
            nextProps.headers !== this.props.headers ||
            nextState.sizeVar !== this.state.sizeVar ||
            nextState.sizeMultiplier !== this.state.sizeMultiplier ||
            nextState.sizeLowLimit !== this.state.sizeLowLimit ||
            nextState.sizeUpLimit !== this.state.sizeUpLimit ||
            nextState.symbolType !== this.state.symbolType ||
            nextState.iconFA !== this.state.iconFA;
    }
    typeChanged(type: SymbolTypes) {
        this.setState({
            symbolType: type,
        });
    }
    sizeVariableChanged(val) {
        this.setState({
            sizeVar: val ? val.value : '',
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
    faIconChanged(icon: string) {
        this.setState({
            iconFA: icon,
        })
    }
    saveOptions() {
        this.props.saveValues({
            sizeVariable: this.state.sizeVar,
            sizeMultiplier: this.state.sizeMultiplier,
            sizeLowerLimit: this.state.sizeLowLimit,
            sizeUpperLimit: this.state.sizeUpLimit,
            symbolType: this.state.symbolType,
            iconFA: this.state.iconFA,
        });
    }
    getIcons(that) {

        let arr = [];
        let columnCount = 7;
        for (let i = 0; i < faIcons.length; i += columnCount) {

            arr.push(
                <tr key={i}>
                    {getColumns(that, i).map(
                        function(column) {
                            return column;
                        })
                    }
                </tr>
            );
        }

        function getColumns(that, i: number) {
            let columns = [];
            for (let c = 0; c < columnCount; c++) {
                let style = {
                    width: 30,
                    height: 30,
                    border: that.state.iconFA === faIcons[i + c] ? '1px solid #999999' : '1px solid #1a263f',
                    lineHeight: '30px',
                    textAlign: 'center'
                }
                columns.push(<td style={style} key={i + c} className={'fa ' + faIcons[i + c]} onClick={that.faIconChanged.bind(that, faIcons[i + c]) }/>);
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

                    </label>
                    {this.state.symbolType === SymbolTypes.Circle ?
                        <div>
                            <label>Select the variable to scale size by</label>
                            <Select
                                options={this.props.headers}
                                onChange={this.sizeVariableChanged.bind(this) }
                                value={this.state.sizeVar}
                                />
                            <label>Select the size multiplier</label>
                            <input type="number" value={this.state.sizeMultiplier} onChange={this.sizeMultiplierChanged.bind(this) } min={0.1} max={10} step={0.1}/>
                            <br/>
                            <label>Select the size lower limit</label>
                            <input type="number" value={this.state.sizeLowLimit} onChange={this.sizeLowLimitChanged.bind(this) } min={0}/>
                            <br/>
                            <label>Select the size upper limit</label>
                            <input type="number" value={this.state.sizeUpLimit} onChange={this.sizeUpLimitChanged.bind(this) } min={1}/>
                        </div>

                        : null}

                    {this.state.symbolType === SymbolTypes.Icon ?
                        <div>
                            {this.getIcons(this) }
                        </div>

                        : null}
                    <button onClick={this.saveOptions.bind(this) }>Refresh map</button>
                </div>
        );
    }
}
