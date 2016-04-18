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

interface ISelectData {
    value: any,
    label: string
}

interface ILayerData {
    id: number,
    layerName: string,
    geoJSON: Object,
    layerType: LayerTypes,
    headers: ISelectData[],
    layer?: any,
    visOptions?: IVisualizationOptions
}

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

interface IFileUpload {
    fileName: string,
    content: string,
    headers: ISelectData[]
    delimiter: string
}

/** The property interface for the FileUpload-view (the second view of the import wizard) */
interface IFileUploadProps {
    /** Saves the filename, string content, delimiter and the headers/column names to the import wizard */
    saveValues: (IFileUpload) => void,
    goBack: () => void
}

interface IFileUploadStates {
    layerName: string,
}

interface IFileDetails {
    latitudeField: string,
    longitudeField: string,
    coordinateSystem: string,
}
/** The property interface for the FileDetails-view (the last view of the import wizard) */
interface IFileDetailsProps {

    headers: ISelectData[],
    /** Saves the lat- and lon- field names and the coordinate system name to the import */
    saveValues: (IFileDetails) => void,
    goBack: () => void
}

interface IFileDetailsStates {
    latField: string,
    lonField: string,
    coordinateSystem: string,
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
    refreshMap: (options: ILayerData) => void,
    changeLayerOrder: (order: number[]) => void,
    addLayer: () => void,
    deleteLayer: (id: number) => void,
    visible: boolean,
}

interface IMenuStates {
    layerOptionsShown?: boolean,
    colorOptionsShown?: boolean,
    symbolOptionsShown?: boolean,
    activeLayer?: ILayerData,

}

interface IColorOptionsProps {
    headers: { value: string, label: string }[],
    prevOptions: IColorOptions,
    saveValues: (values: IColorOptions) => void,
    isVisible: boolean
}

interface IColorOptionsStates {
    propertyVar?: string,
    choroplethGradientName?: string
}

interface ISymbolOptionsProps {
    headers: { value: string, label: string }[],
    prevOptions: ISymbolOptions,
    saveValues: (values: ISymbolOptions) => void,
    isVisible: boolean,
}

interface ISymbolOptionsStates {
    sizeVar?: string,
    sizeLowLimit?: number,
    sizeUpLimit?: number,
    sizeMultiplier?: number,
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

    sizeLowerLimit?: number,
    sizeUpperLimit?: number,
    sizeMultiplier?: number,
}


/** The complete object to be transferred between Menu<->Map */
interface IVisualizationOptions {
    layerName?: string
    onEachFeature?: (feature: any, layer: L.GeoJSON) => void,
    pointToLayer: (featureData: any, latlng: L.LatLng) => L.ILayer
    colorOptions: IColorOptions,
    symbolOptions: ISymbolOptions,


}

interface ILayerControlProps {
    layers: ILayerData[],
    addNewLayer: () => void,
    deleteLayer: (id: number) => void,
    saveOrder: (order: number[]) => void,
    isVisible: boolean,

}
interface ILayerControlStates {
    /**
     * The new order of layer.id's
     */
    order: { name: string, id: number }[],
}
