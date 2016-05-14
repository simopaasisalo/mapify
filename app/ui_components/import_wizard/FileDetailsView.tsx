
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
            latitudeField: this.props.isGeoJSON ? '' : this.props.headers.filter(function(val) { return val.type === 'number' })[0].label,
            longitudeField: this.props.isGeoJSON ? '' : this.props.headers.filter(function(val) { return val.type === 'number' })[1].label,
            coordinateSystem: 'WGS84',
            heatVal: this.props.isHeatMap ? this.props.headers.filter(function(val) { return val.type === 'number' })[0].label : '',
        });

    }
    latitudeSelectionChanged(val) {
        this.setState(
            {
                latitudeField: val.value,
            });
    }
    longitudeSelectionChanged(val) {
        this.setState(
            {
                longitudeField: val.value,
            });
    }
    coordinateSystemChanged(val) {
        this.setState(
            {
                coordinateSystem: val.value,
            });
    }
    heatValueChanged(val) {
        this.setState(
            {
                heatVal: val.value,
            });
    }
    goBack() {
        this.props.goBack();
    }
    proceed() {
        let custom = (document.getElementById('customProj') as any).value;
        let values = {
            latitudeField: this.state.latitudeField,
            longitudeField: this.state.longitudeField,
            coordinateSystem: custom !== 'Insert custom Proj4-string here' ? custom : this.state.coordinateSystem,
        }
        this.props.saveValues(values);
    }
    render() {
        return <div style={{ height: '100%' }}>
            <div>
                <div className = 'dialogHeader'>
                    <h2>Just a few more details</h2>
                </div>
                {this.props.isGeoJSON ?
                    null :
                    <div>
                        <label>Select the latitude/Y field name</label>
                        <Select
                            options={this.props.headers}
                            onChange={this.latitudeSelectionChanged.bind(this) }
                            value={this.state.latitudeField}
                            placeholder='Latitude field...'/>
                        <label>Select the longitude/X field name</label>
                        <Select
                            options={this.props.headers}
                            onChange={this.longitudeSelectionChanged.bind(this) }
                            value={this.state.longitudeField}/>
                    </div>}
                <label>Select the coordinate system</label>

                <Select
                    options={coords}
                    onChange={this.coordinateSystemChanged.bind(this) }
                    value={this.state.coordinateSystem}/>
                <p> Not sure? Try with the default (WGS84) and see if the data lines up.</p>
                <p>Coordinate system missing? Get the Proj4-string for your system from
                    <a href='http://spatialreference.org/ref/'>Spatial Reference</a>
                </p>
                <input id='customProj' defaultValue='Insert custom Proj4-string here' style={{ width: 400 }}/>
                {this.props.isHeatMap ?
                    <div>
                        <label>Select heat map variable</label>
                        <Select
                            options={this.props.headers}
                            onChange={this.heatValueChanged.bind(this) }
                            value={this.state.heatVal}/>
                    </div>
                    : null}
            </div>
            <button className='secondaryButton' style={{ position: 'absolute', left: 15, bottom: 15 }} onClick={this.goBack.bind(this) }>Go back</button>
            <button className='primaryButton' style={{ position: 'absolute', right: 15, bottom: 15 }} onClick={this.proceed.bind(this) }>Mapify!</button>
        </div>
    }

}
