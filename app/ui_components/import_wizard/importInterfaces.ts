/** The React properties of the layer import wizard */
interface ILayerImportProps {
    /** Function to upload the data to the map */
    submit: (ILayerData) => void,
    /** Function to signal the cancellation of the import.  */
    cancel: () => void,
}
/** The React states of the layer import wizard */
interface ILayerImportStates {
    /** The currently active step of the wizard */
    step?: number,
    /** The upload status*/
    uploadDetails?: IUploadDetails,
}

interface IUploadDetails extends IFileUploadStates, IFileDetailsStates {
    geoJSON?: any,
    layerType?: LayerTypes,
    heatMapVariable?: string,
}

/** The property interface for MapType-components (shown when the user selects the type of a new layer) */
interface ILayerTypeProps {
    /** The name of the map type; i.e. Choropleth Map*/
    name: string,
    /** The layer type as defined in Common.LayerTypes  */
    type: LayerTypes,
    /** A short description of the map's appearance and common use cases*/
    description: string,
    /** The url of an example image*/
    imageLocation: string,
    /** The selection event */
    onClick: (type: LayerTypes) => void,
    /** The demo load button click event */
    loadDemo: (type: LayerTypes) => void,
    /** Is the layer type currently selected */
    selected: boolean,
}

/** The property interface for the LayerTypeSelect-view (the first view of the import wizard) */
interface ILayerTypeSelectProps {
    /** saves the selected layer type to the import wizard */
    saveValues: (type: LayerTypes) => void,
    /** skips the other steps, loads a sample of selected map type*/
    loadDemo: (type: LayerTypes) => void,
    /** cancels the layer import wizard */
    cancel: () => void,
}
/** The React states of the layer type selection */
interface ILayerTypeSelectStates {
    /** Currently selected layer type */
    selectedType: LayerTypes,
}

/** The property interface for the FileUpload-view (the second view of the import wizard) */
interface IFileUploadProps {
    /** Saves the filename, string content, delimiter and the headers/column names to the import wizard */
    saveValues: (args: IFileUploadStates) => void,
    /** Go back to the previous step of the wizard */
    goBack: () => void
}

/** The React states of the file upload view */
interface IFileUploadStates {
    /** The name of the layer to upload */
    layerName?: string,
    /** The file extension of the updated file */
    fileExtension?: string,
    /** The file's contents as string */
    content?: string,
    /** The headers/column names/property names of the imported file */
    headers?: IHeader[],
    /** If DSV, the delimiter used to separate columns */
    delimiter?: string,
}

/** The file details object interface */
interface IFileDetails {
    /** The name of the latitude field */
    latitudeField?: string,
    /** The name of the longitude field */
    longitudeField?: string,
    /** The name of the coordinate system */
    coordinateSystem?: string,
    /** The heatmap value field */
    heatVal?: string,
}
/** The property interface for the FileDetails-view (the last view of the import wizard) */
interface IFileDetailsProps {

    /** The headers/column names/property names of the imported file */
    headers: IHeader[],
    /** Saves the lat- and lon- field names and the coordinate system name to the import wizard*/
    saveValues: (IFileDetails) => void,
    /** Go to the previous step of the wizard */
    goBack: () => void,
    /** Is the file in GeoJSON? If so, don't show lat-lon-selection*/
    isGeoJSON: boolean,
    /** Is the layer going to be a heatmap?*/
    isHeatMap: boolean,
}

/** The React states of the file details view */
interface IFileDetailsStates extends IFileDetails {

}
