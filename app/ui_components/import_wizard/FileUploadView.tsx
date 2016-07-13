import * as React from 'react';
let Dropzone = require('react-dropzone');
import {FilePreProcessModel} from '../../models/FilePreProcessModel';

let _fileModel = new FilePreProcessModel();
let _allowedFileTypes = ['geojson', 'csv', 'gpx', 'kml', 'wkt'];
import {ImportWizardState} from '../Stores/States';
import {observer} from 'mobx-react';

@observer
export class FileUploadView extends React.Component<{
    state: ImportWizardState,
    /** Saves the filename, string content, delimiter and the headers/column names to the import wizard */
    saveValues: () => void,
    /** Go back to the previous step of the wizard */
    goBack: () => void
}, {}>{
    private activeLayer = this.props.state.layer;

    // shouldComponentUpdate(nextProps: IFileUploadProps, nextState: IFileUploadStates) {
    //     return this.state.layerName !== nextState.layerName;
    // }
    onDrop = (files) => {
        let reader = new FileReader();
        let fileName, content;
        reader.onload = contentUploaded.bind(this);
        files.forEach((file) => {
            fileName = file.name;
            reader.readAsText(file);
        });
        function contentUploaded(e) {
            let contents: any = e.target;
            let ext: string = fileName.split('.').pop().toLowerCase();
            if (_allowedFileTypes.indexOf(ext) !== -1) {
                this.props.state.content = contents.result;
                this.props.state.fileName = fileName;
                this.activeLayer.layerName = fileName;
                this.props.state.fileExtension = ext;
            }
            else {
                alert('File type not yet supported!');
            }
        }
    }

    onLayerNameChange = (e) => {
        this.activeLayer.layerName = e.target.value;
    }
    goBack = () => {
        this.props.goBack();
    }
    proceed = () => {
        if (this.props.state.fileExtension === 'csv') {
            let head, delim;
            [head, delim] = _fileModel.ParseHeadersFromCSV(this.props.state.content);
            for (let i of head) {
                this.activeLayer.headers.push({ value: i.name, label: i.name, type: i.type });
            }
            this.props.state.delimiter = delim;
        }
        if (this.props.state.content) {
            this.props.saveValues();

        }
        else {
            alert("Upload a file!");
        }
    }
    render() {
        let dropStyle = {
            height: 100,
            border: this.props.state.fileName ? '1px solid #549341' : '1px dotted #549341',
            borderRadius: 15,
            margin: 5,
            textAlign: 'center',
            lineHeight: '100px',
            color: 'grey',
            fontWeight: 'bold'
        }
        return (
            <div>
                <div>
                    <div className = 'dialogHeader'>
                        <h2> Upload the file containing the data </h2>
                    </div>
                    <p>Currently supported file types: </p>
                    <p> GeoJSON, CSV(point data with coordinates in two columns), KML, GPX, WKT</p>
                    <Dropzone
                        style={dropStyle}
                        onDrop={this.onDrop.bind(this) }
                        accept={_allowedFileTypes.map(function(type) { return '.' + type }).join(', ') }>

                        {this.props.state.fileName ? <span><i className='fa fa-check' style={{ color: '#549341', fontSize: 17 }}/> {this.props.state.fileName} </span> : <span>Drop file or click to open upload menu</span> }
                    </Dropzone>
                    <label>Give a name to the layer</label>
                    <input type="text" onChange={this.onLayerNameChange } value={this.activeLayer.layerName}/>

                </div>
                <button className='secondaryButton' style={{ position: 'absolute', left: 15, bottom: 15 }} onClick={this.goBack.bind(this) }>Previous</button>
                <button className='primaryButton' disabled={this.props.state.content === '' || this.activeLayer.layerName === ''}  style={{ position: 'absolute', right: 15, bottom: 15 }} onClick={this.proceed.bind(this) }>Continue</button>
            </div>
        );
    }
}
