import * as React from 'react';
let Dropzone = require('react-dropzone');
import {FilePreProcessModel} from '../../models/FilePreProcessModel';

let _fileModel = new FilePreProcessModel();

let _fileInfo = {
  fileName : '',
  fileExtension : '',
  content : '',
  headers : [{value: '', label : ''}],
  delimiter : '',

}
export class FileUploadView extends React.Component<IFileUploadProps, {}>{
  onDrop(files){
    var reader = new FileReader();
    reader.onload = function(e) {
      // get file content
      let contents: any = e.target;
      _fileInfo.content = contents.result;

    }
    files.forEach((file)=> {
        _fileInfo.fileName=file.name;
        _fileInfo.fileExtension =file.name.split('.').pop();
        reader.readAsText(file);
    });
  }
  proceed(){
    let head, delim;
    [head, delim] = _fileModel.ParseHeaders(_fileInfo.content, _fileInfo.fileExtension);
    for(let i = 0; i<head.length; i++){
      let val = head[i];
      _fileInfo.headers[i]={value:val, label: val };
    }
    _fileInfo.delimiter = delim;
    if (_fileInfo.content){
      this.props.saveValues(_fileInfo);
      this.props.onContinue();
    }
    else {
      alert("Upload a file!");
    }
  }
  render() {
      return (
          <div>
            <Dropzone onDrop={this.onDrop.bind(this)} disablePreview={true}>
              <div>Try dropping some files here, or click to select files to upload.</div>
            </Dropzone>
            <button onClick={this.proceed.bind(this)}>Continue</button>
          </div>
      );
    }
}
