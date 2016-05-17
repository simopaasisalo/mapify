import * as React from 'react';
let Dropzone = require('react-dropzone');
import {FilePreProcessModel} from '../../models/FilePreProcessModel';

let _fileModel = new FilePreProcessModel();
let _allowedFileTypes = ['geojson', 'csv', 'gpx', 'kml', 'wkt'];

export class FileUploadView extends React.Component<IFileUploadProps, IFileUploadStates>{
    constructor() {
        super();
        this.state =
            {
                layerName: '',
                content: '',
                headers: [],
                delimiter: '',
                fileExtension: '',
            };
    }
    shouldComponentUpdate(nextProps: IFileUploadProps, nextState: IFileUploadStates) {
        return this.state.layerName !== nextState.layerName;
    }
    onDrop(files) {
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
                this.setState({
                    content: contents.result,
                    fileName: fileName,
                    layerName: fileName,
                    fileExtension: ext
                });
            }
            else {
                alert('File type not yet supported!');
            }

        }
    }

    layerNameChanged(e) {
        this.setState({ layerName: e.target.value })
    }
    goBack() {
        this.props.goBack();
    }
    proceed() {
        if (this.state.fileExtension === 'csv') {
            let head, delim;
            let headers = [];
            [head, delim] = _fileModel.ParseHeadersFromCSV(this.state.content);
            for (let i of head) {
                headers.push({ value: i.name, label: i.name, type: i.type });
            }
            this.state.headers = headers; //direct manipulate state because the values are passed instantly to the saveValues-method
            this.state.delimiter = delim;
        }
        if (this.state.content) {
            this.props.saveValues(this.state);

        }
        else {
            alert("Upload a file!");
        }
    }
    render() {
        let dropStyle = {
            height: 100,
            border: this.state.fileName ? '1px solid #549341' : '1px dotted #549341',
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
                        onDrop={this.onDrop.bind(this) }>
                        {this.state.fileName ? <span><i className='fa fa-check' style={{ color: '#549341', fontSize: 17 }}/> {this.state.fileName} </span> : <span>Drop file or click to open upload menu</span> }
                    </Dropzone>
                    <label>Give a name to the layer</label>
                    <input type="text" onChange={this.layerNameChanged.bind(this) } value={this.state.layerName}/>

                </div>
                <button className='secondaryButton' style={{ position: 'absolute', left: 15, bottom: 15 }} onClick={this.goBack.bind(this) }>Previous</button>
                <button className='primaryButton' style={{ position: 'absolute', right: 15, bottom: 15 }} onClick={this.proceed.bind(this) }>Continue</button>
            </div>
        );
    }
}
