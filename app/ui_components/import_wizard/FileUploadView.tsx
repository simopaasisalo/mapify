import * as React from 'react';
let Dropzone = require('react-dropzone');
import {FilePreProcessModel} from '../../models/FilePreProcessModel';

let _fileModel = new FilePreProcessModel();

let _fileInfo = {
    fileName: '',
    fileExtension: '',
    content: '',
    headers: [{ value: '', label: '' }],
    delimiter: '',

}
export class FileUploadView extends React.Component<IFileUploadProps, IFileUploadStates>{
    constructor() {
        super();
        this.state =
            {
                layerName: ''
            };
    }
    shouldComponentUpdate(nextProps: IFileUploadProps, nextState: IFileUploadStates) {
        return this.state.layerName !== nextState.layerName;
    }
    onDrop(files) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // get file content
            let contents: any = e.target;
            _fileInfo.content = contents.result;

        }
        files.forEach((file) => {
            _fileInfo.fileName = file.name;
            this.setState({ layerName: file.name })

            _fileInfo.fileExtension = file.name.split('.').pop();
            reader.readAsText(file);
        });
    }
    layerNameChanged(e) {
        this.setState({ layerName: e.target.value })
    }
    goBack() {
        this.props.goBack();
    }
    proceed() {
        if (_fileInfo.fileExtension !== 'geojson') {
            let head, delim;
            [head, delim] = _fileModel.ParseHeaders(_fileInfo.content, _fileInfo.fileExtension);
            for (let i of head) {
                _fileInfo.headers.push({ value: i, label: i });
            }
            _fileInfo.delimiter = delim;
        }
        _fileInfo.fileName = this.state.layerName;
        if (_fileInfo.content) {
            this.props.saveValues(_fileInfo);
        }
        else {
            alert("Upload a file!");
        }
    }
    render() {
        return (
            <div>
                <h2> Upload the file containing the data </h2>
                <Dropzone onDrop={this.onDrop.bind(this) }>
                    <div>Drop file or click to open upload menu</div>
                </Dropzone>
                <input type="text" onChange={this.layerNameChanged.bind(this) } value={this.state.layerName}/>
                <button onClick={this.goBack.bind(this) }>Previous</button>
                <button onClick={this.proceed.bind(this) }>Continue</button>
            </div>
        );
    }
}
