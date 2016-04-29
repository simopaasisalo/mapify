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

interface IHeader extends ISelectData {
    type: string,
}

interface ILayerData {
    id: number,
    layerName: string,
    geoJSON: Object,
    layerType: LayerTypes,
    headers: IHeader[],
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



interface IMapMainProps {

}

interface IMapMainStates {
    importWizardShown?: boolean,
    menuShown?: boolean,
    layers?: ILayerData[],
    filters?: { [title: string]: IFilter; },
    legend?: ILegend
}


interface IMenuProps {
    layers: Array<ILayerData>,
    refreshMap: (options: ILayerData) => void,
    changeLayerOrder: (order: number[]) => void,
    addLayer: () => void,
    deleteLayer: (id: number) => void,
    createFilter: (info: IFilter) => void,
    legendStatusChanged: (info: ILegend) => void,
    visible: boolean,
}

interface IMenuStates {
    layerOptionsShown?: boolean,
    colorOptionsShown?: boolean,
    symbolOptionsShown?: boolean,
    filterOptionsShown?: boolean,
    legendOptionsShown?: boolean,
    activeLayer?: ILayerData,

}

interface ISubMenuProps {
    headers?: IHeader[],
    isVisible: boolean

}

interface IColorMenuProps extends ISubMenuProps {
    prevOptions: IColorOptions,
    isChoropleth: boolean,
    saveValues: (values: IColorOptions) => void,
}

interface IColorMenuStates {
    choroFieldName?: string,
    colorScheme?: string,
    opacityField?: string,
    opacity?: number,
    useMultipleColors?: boolean,
    baseColor?: string,
    borderColor?: string,
    colorSelectOpen?: boolean,
    revertChoroplethScheme?: boolean,
    /**
     * The name of the property being edited
     */
    editing?: string,

    /**
     * Helper for showing the clicked item's color on the picker
     */
    startColor?: string,

}

interface IColorSchemeProps {
    gradientName: string,
    steps: number,
    revert: boolean,
}

/** The color options to transfer between the menu and the main app */
interface IColorOptions extends L.PathOptions {

    /** If not empty, use choropleth coloring */
    choroplethFieldName: string,
    /**
     * Color name array to use in choropleth
     */
    colors?: string[],
    /**
     * Value array to use in choropleth
     */
    limits?: number[],
    /**
     * The color scheme name to use in choropleth
     */
    colorScheme?: string,
    /**
     * The amount of colors to use in choropleth
     */
    steps: number,
    /**
     * The Chroma-js method to calculate colors. Default q->quantiles
     */
    mode: string,
    /**
     * Revert the color scheme
     */
    revert: boolean,

}
interface ISymbolMenuProps extends ISubMenuProps {
    prevOptions: ISymbolOptions,
    saveValues: (values: ISymbolOptions) => void,
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

    actualMinValue?: number,
    actualMinRadius?: number,
    actualMaxValue?: number,
    actualMaxRadius?: number,
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

interface IFilterMenuProps extends ISubMenuProps {
    /**
     * adds the filter control to the map
     */
    addFilterToMap: (info: IFilter) => void,
    /**
     * Removes filter by specified title from the map
     */
    removeFilterFromMap?: (filterTitle: string) => void,

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
    id: number,
    /**
     * The name of the filter. Will be shown on the map
     */
    title: string,
    /**
     * Initialized as the unfiltered data. Filtering changes this layer
     */
    layerData?: ILayerData,

    /**
     * The name of the field to filter
     */
    fieldToFilter: string,


    /**
     * Dictionary containing lists of layers by the value being filtered
     */
    filterValues?: { [index: number]: L.ILayer[] },

    maxValue?: number,
    minValue?: number,

}

/** The complete object to be transferred between Menu<->Map */
interface IVisualizationOptions {
    layerName?: string
    onEachFeature?: (feature: any, layer: L.GeoJSON) => void,
    pointToLayer: (featureData: any, latlng: L.LatLng) => L.ILayer
    colorOptions: IColorOptions,
    symbolOptions: ISymbolOptions,


}

interface ILegendMenuProps extends ISubMenuProps {
    valuesChanged: (values: ILegend) => void,
}

interface ILegendMenuStates {
    showLegend?: boolean,
    horizontal?: boolean,
    title?: string,
}


interface IOnScreenLegendProps {
    mapLayers: ILayerData[],
    horizontal: boolean,
}

interface ILegend {
    horizontal: boolean,
    title: string,
    meta: string,
    visible: boolean
}
