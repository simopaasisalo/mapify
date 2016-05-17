
/** The different kinds of layers that can be created
 */
declare enum LayerTypes {
    /** Area by value maps. Distuingish different areas on map by setting color based on a value*/
    ChoroplethMap,
    /** Dot density and dot maps. TODO*/
    DotMap,
    /** Use different icons,shapes or graphs to pinpoint locations.*/
    SymbolMap,
    /** Show intensity of a phenomenon by color scaling. TODO*/
    HeatMap
}

/** Different supported symbol types
 */
declare enum SymbolTypes {

    /** Basic circular symbol. Uses L.CircleMarker. Can be resized and colored.*/
    Circle,

    /** Basic rectancular symbol. Uses L.DivIcon. Width and height can both be resized, and color can be changed.*/
    Rectangle,

    /** TODO*/
    Chart,
    /** leaflet.Awesome-Markers- type marker. Uses Font Awesome-css to show a specific icon.*/
    Icon
}

// This results in a whole lot of "Cannot find name"-errors
//import {LayerTypes} from './common';
//


/** The interface for React-Select-components */
interface ISelectData {
    /** The data of an select-item*/
    value: any,
    /** The text to show in the select box*/
    label: string
}

/** The interface for imported data columns/headers/property names */
interface IHeader extends ISelectData {
    /**  The data type of a field. Number/string (datetime and others TODO)*/
    type: string,
}

/** The main data object to pass between components. */
interface ILayerData {
    /** The unique identification. Is used for example to delete items*/
    id: number,
    /** The name of the layer. Will be shown in the UI*/
    layerName: string,
    /** The GeoJSON representation of the data.*/
    geoJSON: { features: any[], type: string },
    /** The type of the layer. Will affect the options available.*/
    layerType: LayerTypes,
    /** The data property names.*/
    headers: IHeader[],
    /** The variable by which to create the heat map*/
    heatMapVariable?: string,
    /** The Leaflet layer. Will be modified by changing options*/
    layer?: any,
    /** The active visualization options configuration*/
    visOptions?: IVisualizationOptions
}

interface IMapMainStates {
    /** Is the import wizard visible*/
    importWizardShown?: boolean,
    /** Is the options menu visible*/
    menuShown?: boolean,
    /** The layers of the map. If you remove a layer from the map, remember to update this list as well.*/
    layers?: ILayerData[],
    /** The data filters of the map.*/
    filters?: IFilter[],
    /** The active legend of the map*/
    legend?: ILegend
}


/** The color options to transfer between the menu and the main app */
interface IColorOptions extends L.PathOptions {
    /** If not empty, use choropleth coloring */
    choroplethFieldName: string,
    /** Color name array to use in choropleth*/
    colors?: string[],
    /** Value array to use in choropleth*/
    limits?: number[],
    /** The color scheme name to use in choropleth*/
    colorScheme?: string,
    /** The amount of colors to use in choropleth*/
    steps: number,
    /** The Chroma-js method to calculate colors. Default q->quantiles*/
    mode: string,
    /** Revert the color scheme*/
    revert: boolean,
}
/** Symbol specific options - size, icon etc. */
interface ISymbolOptions {
    symbolType: SymbolTypes,

    /** The font-awesome tag. Used if symbolType == Icon*/
    iconFA?: string,
    /** The Extra-Markers- shape Used if symbolType == Icon*/
    iconShape?: 'circle' | 'square' | 'star' | 'penta',
    /** If symbol is of scalable type, the variable by which to scale the symbol width */
    sizeXVariable?: string,
    /** If symbol is of scalable type, the variable by which to scale the symbol height */
    sizeYVariable?: string,
    /** If symbol is of scalable type, the minimum size that will be rendered */
    sizeLowerLimit?: number,
    /** If symbol is of scalable type, the maximum size that will be rendered */
    sizeUpperLimit?: number,
    /** If symbol is of scalable type, the value by which to multiply the value to get the final size of the symbol */
    sizeMultiplier?: number,
    /** If symbol is of scalable type, the minimum of all the x-values being calculated. Is used in the legend */
    actualMinXValue?: number,
    /** If symbol is of scalable type, the minimum of all the y-values being calculated. Is used in the legend */
    actualMinYValue?: number,
    /** If symbol is of scalable type, the minimum of all the x being calculated. Is used in the legend */
    actualMinX?: number,
    /** If symbol is of scalable type, the minimum of all the y being calculated. Is used in the legend */
    actualMinY?: number,
    /** If symbol is of scalable type, the maximum of all the x-values being calculated. Is used in the legend */
    actualMaxXValue?: number,
    /** If symbol is of scalable type, the maximum of all the y-values being calculated. Is used in the legend */
    actualMaxYValue?: number,
    /** If symbol is of scalable type, the maximum of all the x being calculated. Is used in the legend */
    actualMaxX?: number,
    /** If symbol is of scalable type, the maximum of all the y being calculated. Is used in the legend */
    actualMaxY?: number,
    /** The fields which to draw on a chart*/
    chartFields?: string[]
}
/** The React properties of the filters shown on the map */
interface IOnScreenFilterProps {
    /** Filter identification */
    id: number,
    /** The name of the filter. Is visible in the UI */
    title: string,
    /** The lowest value being filtered.  */
    minValue: number,
    /** The maximum of the value being filtered */
    maxValue: number,
    /** The event for following the current values  */
    valueChanged: (id: number, lowerLimit: number, upperLimit: number) => void,
    steps: [number, number][],
}
/** The React statuses of the filters shown on the map */
interface IOnScreenFilterStates {
    /** The current lower limit of the filtered value. Values below this point will be hidden */
    lowerLimit?: number,
    /** The current upper limit of the filtered value. Values above this point will be hidden */
    upperLimit?: number,
    step?: number,
    /** Keep the distance between the min and max the same when the slider is being moved.
     * Useful for keeping a locked range to filter
     */
    lockDistance?: boolean,
}

/** The filter information*/
interface IFilter {
    /** The unique id of the filter */
    id: number,
    /** The name of the filter. Will be shown on the map*/
    title: string,
    /** Initialized as the unfiltered data when Filter created. Filtering changes this layer*/
    layerDataId?: number,
    /** The name of the field to filter*/
    fieldToFilter: string,
    /** Dictionary containing lists of layers by the value being filtered*/
    filterValues?: { [value: number]: L.ILayer[] },
    /** Current maximum value */
    currentMax?: number,
    /** Current min value */
    currentMin?: number,
    /** Original maximum value */
    totalMax?: number,
    /** Original min value */
    totalMin?: number,
    /** User defined steps*/
    steps?: [number, number][],
    /** Whether to remove the filtered layer completely or change opacity*/
    remove?: boolean,
    /** The storage of already filtered indices */
    filteredIndices?: number[],


}

/** The complete visual options object to be transferred between Menu<->Map */
interface IVisualizationOptions {
    /** The function to run on every feature of the layer. Is used to place pop-ups to map features */
    onEachFeature?: (feature: any, layer: L.GeoJSON) => void,
    /** The function to convert a geojson point to a layer. Is used in symbol maps ie. to convert a point to a circle marker */
    pointToLayer: (featureData: any, latlng: L.LatLng) => any,
    /** The coloring options of the layer. Contains ie. border color and opacity */
    colorOptions: IColorOptions,
    /**  The symbol options for symbol layers. Contains ie. symbol type  */
    symbolOptions: ISymbolOptions,
}
/** The object interface of the map legend */
interface ILegend {
    /** The name of the legend. Is shown in the UI */
    title?: string,
    /** A description of the data or other user-generated text. Is shown in the bottom of the legend */
    meta?: string,
    /** Should the legend be horizontally aligned */
    horizontal?: boolean,
    /** Is the legend shown on the map */
    visible?: boolean
}

/** The React properties of the map legend */
interface IOnScreenLegendProps extends ILegend {
    /** The layers from which to draw the legend */
    mapLayers: ILayerData[],
}
