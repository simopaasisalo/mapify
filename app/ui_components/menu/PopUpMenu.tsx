import * as React from 'react';
let Select = require('react-select');
import {AppState} from '../Stores';
import {observer} from 'mobx-react';

@observer
export class PopUpMenu extends React.Component<{
    state: AppState,
    /** Save the currently selected headers to the map. Is triggered when the user presses the save button*/
    saveSelection: (headers: IHeader[]) => void,
}, {}>{

    onSelectionChange = (e: IHeader[]) => {
        let headers = this.props.state.editingLayer.popupHeaders;
        if (e === null)
            e = [];

        headers.splice(0, headers.length) //empty headers
        for (let i in e) { //add new headers
            headers.push(e[i]);
        }
    }
    saveOptions = () => {
        this.props.saveSelection(this.props.state.editingLayer.popupHeaders);
    }
    render() {
        console.log(this.props.state.editingLayer)
        return (this.props.state.visibleMenu !== 6 ? null :
            <div className="mapify-options">
                <label>Select the variables to show</label>
                <Select
                    options={this.props.state.editingLayer.headers.slice() }
                    multi
                    onChange={this.onSelectionChange }
                    value={this.props.state.editingLayer.popupHeaders}
                    />

                <button className='menuButton' onClick={this.saveOptions }>Refresh map</button>
            </div >
        );
    }
}
