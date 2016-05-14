import * as React from 'react';

import {LayerTypeSelectView} from './LayerTypeSelectView';
import {FileUploadView} from './FileUploadView';
import {FileDetailsView} from './FileDetailsView';
import {FilePreProcessModel} from '../../models/FilePreProcessModel';
import {choroplethSample, symbolSample} from './FileSamples';
import {LayerTypes} from "../common_items/common";

let _fileModel = new FilePreProcessModel();


export class LayerImportWizard extends React.Component<ILayerImportProps, ILayerImportStates>{
    constructor() {
        super();
        this.state = {
            step: 0,
            uploadDetails: {},
        };
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
        let details = this.state.uploadDetails;
        details.layerType = type;
        this.setState({
            uploadDetails: details
        });
        this.nextStep();
    }

    setFileInfo(fileInfo: IFileUploadStates, loadDemo: boolean = false) {
        let details = this.state.uploadDetails;

        this.setLayerName(fileInfo.layerName);
        details.headers = [];
        let ext = fileInfo.fileExtension;
        if (ext === 'csv') {
            details.content = fileInfo.content;
            details.headers = fileInfo.headers;
            details.delimiter = fileInfo.delimiter;
            details.fileExtension = ext;
            this.setState({
                uploadDetails: details
            });
            this.nextStep();
        }
        else {
            details.fileExtension = ext;
            if (ext === 'geojson')
                details.geoJSON = JSON.parse(fileInfo.content);
            else if (ext === 'kml' || ext === 'gpx' || ext === 'wkt')
                details.geoJSON = _fileModel.ParseToGeoJSON(fileInfo.content, ext)
            let props = details.geoJSON.features ? details.geoJSON.features[0].properties : {};
            for (let h of Object.keys(props)) {
                details.headers.push({ value: h, label: h, type: isNaN(parseFloat(props[h])) ? 'string' : 'number' });
            }
            this.setState({
                uploadDetails: details
            });
            if (loadDemo)
                this.submit()
            else
                this.nextStep();
        }
    }

    setFileDetails(fileDetails) {
        let details = this.state.uploadDetails;

        details.latitudeField = fileDetails.latitudeField;
        details.longitudeField = fileDetails.longitudeField;
        details.coordinateSystem = fileDetails.coordinateSystem;
        this.setState({
            uploadDetails: details
        });
        this.submit();
    }

    setLayerName(name: string) {
        let details = this.state.uploadDetails;

        details.layerName = name;
        this.setState({
            uploadDetails: details,
        });
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
        let details = this.state.uploadDetails;

        if (!details.geoJSON && details.fileExtension === 'csv') {
            details.geoJSON = _fileModel.ParseCSVToGeoJSON(details.content,
                details.latitudeField,
                details.longitudeField,
                details.delimiter,
                details.coordinateSystem,
                details.headers);
        }
        else if (details.coordinateSystem && details.coordinateSystem !== 'WGS84') {
            details.geoJSON = _fileModel.ProjectCoords(details.geoJSON, details.coordinateSystem);
        }
        this.setState({ uploadDetails: details });
        let submitData: ILayerData = {
            id: -1,
            layerName: details.layerName,
            geoJSON: details.geoJSON,
            layerType: details.layerType,
            headers: details.headers,
            heatMapVariable: details.heatMapVariable,
        };
        this.props.submit(submitData);
    }

    loadDemo(type: LayerTypes) {
        let details = this.state.uploadDetails;
        details.layerType = type;
        let fileInfo: IFileUploadStates = {
            fileExtension: 'geojson',

        }
        if (type === LayerTypes.ChoroplethMap) {
            fileInfo.layerName = 'US States';
            fileInfo.content = choroplethSample;
        }
        else if (type === LayerTypes.SymbolMap) {
            fileInfo.layerName = 'Air Particle Demo';
            fileInfo.content = symbolSample;
        }
        else if (type === LayerTypes.HeatMap) {
            fileInfo.layerName = 'Air Particle Heat Demo';
            fileInfo.content = symbolSample;
            details.heatMapVariable = 'particles'
        }

        this.setState({ uploadDetails: details });
        this.setFileInfo(fileInfo, true);

    }
    getCurrentView() {
        switch (this.state.step) {
            case 0:
                return <div style={{ minWidth: 1000 }}>
                    <LayerTypeSelectView
                        loadDemo={this.loadDemo.bind(this) }
                        saveValues={this.setLayerType.bind(this) }
                        cancel = {this.cancel.bind(this) }
                        />
                </div>
            case 1:
                return <FileUploadView
                    saveValues={this.setFileInfo.bind(this) }
                    goBack={this.previousStep.bind(this) }
                    />
            case 2:
                return <FileDetailsView
                    headers={this.state.uploadDetails.headers}
                    saveValues={this.setFileDetails.bind(this) }
                    goBack = {this.previousStep.bind(this) }
                    isHeatMap={this.state.uploadDetails.layerType === LayerTypes.HeatMap}
                    isGeoJSON={this.state.uploadDetails.geoJSON ? true : false}
                    />
        }
    }
    render() {
        return (
            <div style ={{ overflowX: 'auto' }}>
                { this.getCurrentView() }
            </div>
        )
    }
}
