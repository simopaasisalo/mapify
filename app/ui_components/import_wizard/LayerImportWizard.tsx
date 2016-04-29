import * as React from 'react';

import {LayerTypeSelectView} from './LayerTypeSelectView';
import {FileUploadView} from './FileUploadView';
import {FileDetailsView} from './FileDetailsView';
import {FilePreProcessModel} from '../../models/FilePreProcessModel';

let _fileModel = new FilePreProcessModel();

var values = {
    layerName: '',
    rawContent: '',
    geoJSON: null,
    layerType: null,
    fileExtension: '',
    headers: [],
    delimiter: '',
    latField: '',
    lonField: '',
    coordinateSystem: '',
}

export class LayerImportWizard extends React.Component<ILayerImportProps, ILayerImportStates>{
    constructor() {
        super();
        this.state = { step: 0 };
    }
    nextStep() {
        this.setState({
            step: this.state.step + 1,
        });
    }

    previousStep() {
        this.setState({
            step: this.state.step - 1
        });
    }

    setLayerType(type: LayerTypes) {
        values.layerType = type;
        this.nextStep();
    }

    setFileInfo(fileInfo: IFileUploadStates) {
        this.setLayerName(fileInfo.layerName);
        values.headers = [];
        if (fileInfo.fileExtension === 'geojson') {

            values.geoJSON = JSON.parse(fileInfo.content);
            let props = values.geoJSON.features[0].properties;
            for (let h of Object.keys(props)) {
                values.headers.push({ value: h, label: h, type: isNaN(parseFloat(props[h])) ? 'string' : 'number' });
            }
            this.submit(); //skip extra info if already in geojson
        }
        else {
            values.rawContent = fileInfo.content;
            values.headers = fileInfo.headers;
            values.delimiter = fileInfo.delimiter;
            values.fileExtension = fileInfo.fileExtension;
            console.log(values)
            this.nextStep();
        }
    }

    setFileDetails(fileDetails) {
        values.latField = fileDetails.latitudeField;
        values.lonField = fileDetails.longitudeField;
        values.coordinateSystem = fileDetails.coordinateSystem;
        this.submit();
    }

    setLayerName(name: string) {
        values.layerName = name;
    }
    cancel() {
        this.props.cancel();
    }
    /**
     * submit - Parse given data to GeoJSON and pass to Map
     *
     * @return {void}
     */
    submit() {
        if (!values.geoJSON) {
            values.geoJSON = _fileModel.ParseToGeoJSON(values.rawContent, values.latField, values.lonField, values.fileExtension, values.delimiter, values.coordinateSystem, values.headers);
        }
        let submitData: ILayerData = {
            id: -1,
            layerName: values.layerName,
            geoJSON: values.geoJSON,
            layerType: values.layerType,
            headers: values.headers
        };
        this.props.submit(submitData);
    }
    render() {
        switch (this.state.step) {
            case 0:
                return <LayerTypeSelectView
                    saveValues={this.setLayerType.bind(this) }
                    cancel = {this.cancel.bind(this) }
                    />;
            case 1:
                return <FileUploadView
                    saveValues={this.setFileInfo.bind(this) }
                    goBack={this.previousStep.bind(this) }
                    />;
            case 2:
                return <FileDetailsView
                    headers={values.headers}
                    saveValues={this.setFileDetails.bind(this) }
                    goBack = {this.previousStep.bind(this) }
                    />
        }
    }
}
