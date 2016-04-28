import * as React from 'react';
let Select = require('react-select');


export class SymbolMenu extends React.Component<ISymbolMenuProps, ISymbolMenuStates>{
    constructor(props: ISymbolMenuProps) {
        super(props);
        this.state =
            {
                sizeVar: this.props.prevOptions ? this.props.prevOptions.sizeVariable : this.props.headers[0].label,
                sizeMultiplier: 1,
                sizeLowLimit: 0,
                sizeUpLimit: 90,
            };
    }
    shouldComponentUpdate(nextProps: ISymbolMenuProps, nextState: ISymbolMenuStates) {
        return nextProps.isVisible !== this.props.isVisible ||
            nextProps.headers !== this.props.headers ||
            nextState.sizeVar !== this.state.sizeVar ||
            nextState.sizeMultiplier !== this.state.sizeMultiplier ||
            nextState.sizeLowLimit !== this.state.sizeLowLimit ||
            nextState.sizeUpLimit !== this.state.sizeUpLimit;
    }

    sizeVariableChanged(val) {
        this.setState({
            sizeVar: val.value
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
    saveOptions() {
        this.props.saveValues({
            sizeVariable: this.state.sizeVar,
            sizeMultiplier: this.state.sizeMultiplier,
            sizeLowerLimit: this.state.sizeLowLimit,
            sizeUpperLimit: this.state.sizeUpLimit,
        });
    }
    render() {
        return (
            !this.props.isVisible ? null :
                <div className="mapify-options">
                    <h4>Select the variable to scale size by</h4>
                    <Select
                        options={this.props.headers}
                        onChange={this.sizeVariableChanged.bind(this) }
                        value={this.state.sizeVar}
                        />
                    <br/>
                    <label>Select the size multiplier</label>
                    <input type="number" value={this.state.sizeMultiplier} onChange={this.sizeMultiplierChanged.bind(this) } min={0.1} max={10} step={0.1}/>
                    <br/>
                    <label>Select the size lower limit</label>
                    <input type="number" value={this.state.sizeLowLimit} onChange={this.sizeLowLimitChanged.bind(this) } min={0}/>
                    <br/>
                    <label>Select the size upper limit</label>
                    <input type="number" value={this.state.sizeUpLimit} onChange={this.sizeUpLimitChanged.bind(this) } min={1}/>
                    <br/>
                    <button onClick={this.saveOptions.bind(this) }>Refresh map</button>
                </div>
        );
    }
}
