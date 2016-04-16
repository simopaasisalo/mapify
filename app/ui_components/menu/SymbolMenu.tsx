import * as React from 'react';
let Select = require('react-select');


export class SymbolMenu extends React.Component<ISymbolOptionsProps, ISymbolOptionsStates>{
    constructor() {
        super();
        this.state =
            {
                sizeVar: ''
            };
    }
    shouldComponentUpdate(nextProps: ISymbolOptionsProps, nextState: ISymbolOptionsStates) {
        return nextProps.isVisible !== this.props.isVisible ||
            nextProps.headers !== this.props.headers ||
            nextState.sizeVar !== this.state.sizeVar;
    }

    sizeVariableChanged(val) {
        this.setState({
            sizeVar: val.value
        });
    }
    saveOptions() {
        this.props.saveValues({
            sizeVariable: this.state.sizeVar
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
                    <h4>Select the base color size</h4>
                    <input  type="range"/>
                    <button onClick={this.saveOptions.bind(this) }>Refresh map</button>
                </div>
        );
    }
}
