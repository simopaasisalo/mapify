
import * as React from 'react';
let Select = require('react-select');

var coords;
import {DefaultProjections} from "../common_items/common";


export class FileDetailsView extends React.Component<IFileDetailsProps, IFileDetailsStates>{
    componentWillMount() {

        coords = [];
        for (let i = 0; i < DefaultProjections.length; i++) {
            let val = DefaultProjections[i];
            coords[i] = { value: val, label: val };
        }
        this.setState({
            latField: this.props.headers.filter(function(val) { return val.type === 'number' })[0].label,
            lonField: this.props.headers.filter(function(val) { return val.type === 'number' })[1].label,
            coordinateSystem: 'WGS84',
        });

    }
    latitudeSelectionChanged(val) {
        this.setState(
            {
                latField: val.value,
                lonField: this.state.lonField,
                coordinateSystem: this.state.coordinateSystem,
            });
    }
    longitudeSelectionChanged(val) {
        this.setState(
            {
                latField: this.state.latField,
                lonField: val.value,
                coordinateSystem: this.state.coordinateSystem,
            });
    }
    coordinateSystemChanged(val) {
        this.setState(
            {
                latField: this.state.latField,
                lonField: this.state.lonField,
                coordinateSystem: val.value,
            });
    }
    goBack() {
        this.props.goBack();
    }
    proceed() {
        let values = {
            latitudeField: this.state.latField,
            longitudeField: this.state.lonField,
            coordinateSystem: this.state.coordinateSystem,
        }
        this.props.saveValues(values);
    }
    render() {
        return <div>
            <h2>Just a few more details</h2>
            <h4>Select the latitude/Y field name</h4>
            <Select
                options={this.props.headers}
                onChange={this.latitudeSelectionChanged.bind(this) }
                value={this.state.latField}
                placeholder='Latitude field...'/>
            <h4>Select the longitude/X field name</h4>
            <Select
                options={this.props.headers}
                onChange={this.longitudeSelectionChanged.bind(this) }
                value={this.state.lonField}/>
            <h4>Select the coordinate system</h4>
            <Select
                options={coords}
                onChange={this.coordinateSystemChanged.bind(this) }
                value={this.state.coordinateSystem}/>
            <button onClick={this.goBack.bind(this) }>Go back</button>
            <button onClick={this.proceed.bind(this) }>Mapify!</button>
        </div>
    }

}
