import * as React from 'react';
let Select = require('react-select');


export class SymbolMenu extends React.Component<ISymbolMenuProps, ISymbolMenuStates>{
    constructor(props: ISymbolMenuProps) {
        super(props);
        this.state =
            {
                sizeVar: this.props.prevOptions ? this.props.prevOptions.sizeVariable : '',
                sizeMultiplier: 1,
            };
    }
    shouldComponentUpdate(nextProps: ISymbolMenuProps, nextState: ISymbolMenuStates) {
        return nextProps.isVisible !== this.props.isVisible ||
            nextProps.headers !== this.props.headers ||
            nextState.sizeVar !== this.state.sizeVar ||
            nextState.sizeMultiplier !== this.state.sizeMultiplier;
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
    saveOptions() {
        this.props.saveValues({
            sizeVariable: this.state.sizeVar,
            sizeMultiplier: this.state.sizeMultiplier
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
                    <h4>Select the size multiplier</h4>
                    <input type="number" value={this.state.sizeMultiplier} onChange={this.sizeMultiplierChanged.bind(this) } min={1} max={10}/>
                    <button onClick={this.saveOptions.bind(this) }>Refresh map</button>
                </div>
        );
    }
}
