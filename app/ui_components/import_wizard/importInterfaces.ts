interface ILayerImportProps {
    submit: (ILayerData) => void,
    cancel: () => void,
}

interface ILayerImportStates {
    step: number,
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
    selected: boolean,
}

/** The property interface for the LayerTypeSelect-view (the first view of the import wizard) */
interface ILayerTypeSelectProps {
    /** saves the selected layer type to the import wizard */
    saveValues: (type: LayerTypes) => void,
    cancel: () => void,
}

interface ILayerTypeSelectStates {
    selectedType: LayerTypes,
}


/** The property interface for the FileUpload-view (the second view of the import wizard) */
interface IFileUploadProps {
    /** Saves the filename, string content, delimiter and the headers/column names to the import wizard */
    saveValues: (args: IFileUploadStates) => void,
    goBack: () => void
}

interface IFileUploadStates {
    layerName?: string,
    fileExtension?: string,
    content?: string,
    headers?: IHeader[],
    delimiter?: string,
}

interface IFileDetails {
    latitudeField: string,
    longitudeField: string,
    coordinateSystem: string,
}
/** The property interface for the FileDetails-view (the last view of the import wizard) */
interface IFileDetailsProps {

    headers: IHeader[],
    /** Saves the lat- and lon- field names and the coordinate system name to the import */
    saveValues: (IFileDetails) => void,
    goBack: () => void
}

interface IFileDetailsStates {
    latField: string,
    lonField: string,
    coordinateSystem: string,
}
