import * as React from 'react';
let Dropzone = require('react-dropzone');
import {FilePreProcessModel} from '../../models/FilePreProcessModel';

let _fileModel = new FilePreProcessModel();

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
            this.setState({
                content: contents.result,
                layerName: fileName,
                fileExtension: fileName.split('.').pop()
            });

        }
    }

    layerNameChanged(e) {
        this.setState({ layerName: e.target.value })
    }
    goBack() {
        this.props.goBack();
    }
    proceed() {
        if (this.state.fileExtension !== 'geojson') {
            let head, delim;
            let headers = [];
            [head, delim] = _fileModel.ParseHeaders(this.state.content, this.state.fileExtension);
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
            border: '1px dotted #549341',
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
                    <Dropzone
                        style={dropStyle}
                        onDrop={this.onDrop.bind(this) }>
                        Drop file or click to open upload menu
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
