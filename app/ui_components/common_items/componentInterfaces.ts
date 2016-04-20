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
    layer?: L.GeoJSON,
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
    layers?: Array<ILayerData>,
}


interface IMenuProps {
    layers: Array<ILayerData>,
    refreshMap: (options: ILayerData) => void,
    changeLayerOrder: (order: number[]) => void,
    addLayer: () => void,
    deleteLayer: (id: number) => void,
    createFilter: (IFilterInfo) => void,
    visible: boolean,
}

interface IMenuStates {
    layerOptionsShown?: boolean,
    colorOptionsShown?: boolean,
    symbolOptionsShown?: boolean,
    filterOptionsShown?: boolean,
    activeLayer?: ILayerData,

}

interface IColorMenuProps {
    headers: { value: string, label: string }[],
    prevOptions: IColorOptions,
    saveValues: (values: IColorOptions) => void,
    isVisible: boolean
}

interface IColorMenuStates {
    propertyVar?: string,
    choroplethGradientName?: string
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
interface ISymbolMenuProps {
    headers: ISelectData[],
    prevOptions: ISymbolOptions,
    saveValues: (values: ISymbolOptions) => void,
    isVisible: boolean,
}

interface ISymbolMenuStates {
    sizeVar?: string,
    sizeLowLimit?: number,
    sizeUpLimit?: number,
    sizeMultiplier?: number,
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

interface ILayerMenuProps {
    layers: ILayerData[],
    addNewLayer: () => void,
    deleteLayer: (id: number) => void,
    saveOrder: (order: number[]) => void,
    isVisible: boolean,

}
interface ILayerMenuStates {
    /**
     * The new order of layers
     */
    order: { name: string, id: number }[],
}

interface IFilterMenuProps {
    headers: ISelectData[],
    /**
     * adds the filter control to the map
     */
    addFilterToMap: (IFilterInfo) => void,
    /**
     * Removes filter by specified title from the map
     */
    removeFilterFromMap?: (filterTitle: string) => void,

    isVisible: boolean,
}

interface IFilterMenuStates {
    selectedField?: string,
    filterTitle?: string,

}

interface IOnScreenFilterProps {
    title: string,
    minValue: number,
    maxValue: number,
    valueChanged: (title: string, lowerLimit: number, upperLimit: number) => void
}

interface IOnScreenFilterStates {
    lowerLimit?: number,
    upperLimit?: number,
    step?: number,
    lockDistance?: boolean,
}

/**
 * The filter information
 */
interface IFilter {
    /**
     * The name of the filter. Will be shown on the map
     */
    title: string,
    /**
     * Initialized as the unfiltered data. Filtering changes this layer
     */
    layerData: ILayerData,

    /**
     * The features that are filtered from the originalLayer
     */
    removedFeatures: L.ILayer[],
    /**
     * The name of the field to filter
     */
    fieldToFilter: string,

    maxValue: number,
    minValue: number,

}

/** The complete object to be transferred between Menu<->Map */
interface IVisualizationOptions {
    layerName?: string
    onEachFeature?: (feature: any, layer: L.GeoJSON) => void,
    pointToLayer: (featureData: any, latlng: L.LatLng) => L.ILayer
    filter: (feature: any, layer: L.GeoJSON) => boolean,
    colorOptions: IColorOptions,
    symbolOptions: ISymbolOptions,


}
