import * as React from 'react';

import {LayerTypeSelectView} from './LayerTypeSelectView';
import {FileUploadView} from './FileUploadView';
import {FileDetailsView} from './FileDetailsView';
import {FilePreProcessModel} from '../../models/FilePreProcessModel';

let _fileModel = new FilePreProcessModel();

var values = {
  layerName : '',
  rawContent : '',
  geoJSON : null,
  layerType : null,
  fileExtension: '',
  headers : [],
  delimiter : '',
  latField : '',
  lonField : '',
  coordinateSystem : '',
}

export class  LayerImportWizard extends React.Component<ILayerImportProps,ILayerImportStates>{
  constructor(){
    super();
    this.state =  {step: 0};
  }
  nextStep(){
    this.setState({
     step : this.state.step + 1,

   });
  }
  previousStep(){
    this.setState({
     step : this.state.step - 1
   });
  }
  setLayerType(type: LayerTypes){
    values.layerType = type;
  }
  setFileInfo(fileInfo){
    values.rawContent = fileInfo.content;
    values.headers = fileInfo.headers;
    values.delimiter = fileInfo.delimiter;
    this.setLayerName(fileInfo.fileName);
    values.fileExtension = fileInfo.fileExtension;
  }
  setFileDetails(fileDetails){
    values.latField = fileDetails.latitudeField;
    values.lonField = fileDetails.longitudeField;
    values.coordinateSystem = fileDetails.coordinateSystem;
  }
  setGeoJSON(content: string){
    values.geoJSON = content;
  }
  setLayerName(name: string){
    values.layerName = name;
  }
  submit(){
    values.geoJSON = _fileModel.ParseData(values.rawContent,values.latField,values.lonField,values.fileExtension, values.delimiter, values.coordinateSystem);
    let submitData : ILayerData = {
      layerName : values.layerName,
      geoJSON : values.geoJSON,
      layerType : values.layerType,
      headers : values.headers
    };
    this.props.submit(submitData);
  }
  render(){
    switch(this.state.step){
      case 0:
        return <LayerTypeSelectView onContinue={this.nextStep.bind(this)} saveValues={this.setLayerType.bind(this)}/>;
      case 1:
        return <FileUploadView onContinue={this.nextStep.bind(this)} saveValues={this.setFileInfo.bind(this)}/>;
      case 2:
        return <FileDetailsView headers={values.headers} onSubmit={this.submit.bind(this)} saveValues={this.setFileDetails.bind(this)}/>
    }
  }
}
