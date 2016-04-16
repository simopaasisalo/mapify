declare enum LayerTypes {
    ChoroplethMap,
    DotMap,
    SymbolMap,
    HeatMap
}

// This results in a whole lot of "Cannot find name"-errors
//import {LayerTypes} from './common';
//

//import {GeoJSON} from 'leaflet';

interface ILayerImportProps {
    submit: (ILayerData) => void,
    cancel: () => void,
}

interface ILayerImportStates {
    step: number,
}

/** The property interface for MapType-components (shown when the user selects the type of a new layer) */
interface IMapTypeProps {
    /** The name of the map type; i.e. Choropleth Map*/
    name: string,
    /** The layer type as defined in Common.LayerTypes  */
    type: LayerTypes,
    /** A short description of the map's appearance and common use cases*/
    description: string,
    /** The url of an example image*/
    imageLocation: string,
    /** Is the map type available (==implemented)? */
    enabled: boolean,
    /** The selection event */
    onClick: (type: LayerTypes) => void,
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
    saveValues: ({fileName, content, headers, delimiter}: { fileName: string, content: string, headers: { value: string, label: string }[], delimiter: string }) => void,
    goBack: () => void
}

interface IFileUploadStates {
    layerName: string,
}

/** The property interface for the FileDetails-view (the last view of the import wizard) */
interface IFileDetailsProps {

    headers: { value: string, label: string }[],
    /** Saves the lat- and lon- field names and the coordinate system name to the import */
    saveValues: ({latitudeField, longitudeField, coordinateSystem}: { latitudeField: string, longitudeField: string, coordinateSystem: string }) => void,
    goBack: () => void
}

interface IFileDetailsStates {
    latField: string,
    lonField: string,
    coordinateSystem: string,
}

interface ILayerData {
    layerName: string,
    geoJSON: Object,
    layerType: LayerTypes
    headers: { value: string, label: string }[]
    layer?: any
}

interface IMapMainProps {

}

interface IMapMainStates {
    importWizardShown: boolean,
    menuShown: boolean,
    layers?: Array<ILayerData>
}

interface IMenuProps {
    layers: Array<ILayerData>,
    originalOptions: IVisualizationOptions,
    refreshMap: (options: IVisualizationOptions) => void,
    addLayer: () => void,
}

interface IMenuStates {
    colorOptionsShown?: boolean,
    symbolOptionsShown?: boolean,
    activeLayer?: ILayerData,

}

interface IColorOptionsProps {
    headers: { value: string, label: string }[],
    saveValues: (values: IColorOptions) => void,
    isVisible: boolean
}

interface IColorOptionsStates {
    propertyVar?: string,
    choroplethGradientName?: string
}

interface ISymbolOptionsProps {
    headers: { value: string, label: string }[],
    saveValues: (values: ISymbolOptions) => void,
    isVisible: boolean,
}

interface ISymbolOptionsStates {
    sizeVar?: string,
}

interface IColorSchemeProps {
    gradientName: string,
    steps: number
}

/** The color options to transfer between the menu and the main app */
interface IColorOptions {

    /** The options to use for regular choropleth maps */
    choroplethOptions?: L.ChoroplethOptions

}



/** Symbol specific options - size, icon etc. */
interface ISymbolOptions {
    /** the link to the icon file (if used) */
    iconURL?: string,
    /** the variable by which to scale the symbol size */
    sizeVariable?: string,
}


/** The complete object to be transferred between Menu<->Map */
interface IVisualizationOptions {
    layerName?: string
    colorOptions: IColorOptions,
    symbolOptions: ISymbolOptions,
}
