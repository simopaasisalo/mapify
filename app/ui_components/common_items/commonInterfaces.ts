declare enum LayerTypes {
    ChoroplethMap,
    DotMap,
    SymbolMap,
    HeatMap
}

declare enum SymbolTypes {
    Circle,
    Chart,
    Icon
}

// This results in a whole lot of "Cannot find name"-errors
//import {LayerTypes} from './common';
//

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

interface IMapMainStates {
    importWizardShown?: boolean,
    menuShown?: boolean,
    layers?: ILayerData[],
    filters?: { [title: string]: IFilter; },
    legend?: ILegend
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
/** Symbol specific options - size, icon etc. */
interface ISymbolOptions {
    symbolType: SymbolTypes,

    /** the font-awesome tag. used if symbolType == Icon*/
    iconFA?: string,
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

/** The complete visual options object to be transferred between Menu<->Map */
interface IVisualizationOptions {
    layerName?: string
    onEachFeature?: (feature: any, layer: L.GeoJSON) => void,
    pointToLayer: (featureData: any, latlng: L.LatLng) => any,
    colorOptions: IColorOptions,
    symbolOptions: ISymbolOptions,
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
