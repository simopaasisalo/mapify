import * as React from 'react';
let Select = require('react-select');

export class PopUpMenu extends React.Component<IPopUpMenuProps, IPopUpMenuStates>{
    constructor(props: IPopUpMenuProps) {
        super(props);
        this.state =
            {
                shownHeaders: this.props.headers,
            };
    }
    variableChanged(e: IHeader[]) {
        if (e === null)
            e = [];
        this.setState({
            shownHeaders: e,
        });
    }
    saveOptions() {
        this.props.saveSelection(this.state.shownHeaders);
    }
    render() {
        return (!this.props.isVisible ? null :
            <div className="mapify-options">
                <h4>Select the variables to show</h4>
                <Select
                    options={this.props.headers}
                    multi
                    onChange={this.variableChanged.bind(this) }
                    value={this.state.shownHeaders}
                    />

                <button onClick={this.saveOptions.bind(this) }>Refresh map</button>
            </div >
        );
    }
}
