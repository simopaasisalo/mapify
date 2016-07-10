
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
    /** Pie- or donut chart based on multiple icons. Can be resized, but color scheme is static. */
    Chart,
    /** leaflet.Awesome-Markers- type marker. Uses Font Awesome-css to show a specific icon.*/
    Icon,
    /** TODO */
    Blocks,
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



interface IIcon {
    /** If creating Icon symbols, the font-awesome class name to display*/
    fa?: string,
    /** The Extra-Markers- shape. Used if symbolType == Icon*/
    shape?: 'circle' | 'square' | 'star' | 'penta',
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

/** The object interface of the map legend */
interface ILegend {
    /** The name of the legend. Is shown in the UI */
    title?: string,
    /** A description of the data or other user-generated text. Is shown in the bottom of the legend */
    meta?: string,
    /** Should the legend be horizontally aligned */
    horizontal?: boolean,
    /** Is the legend shown on the map */
    visible?: boolean,
    showPercentages?: boolean,
}


interface ISaveData {
    //layers: ILayerData[],
    legend: ILegend,
    filters: IFilter[],
}

interface IWelcomeScreenProps {
    loadMap: (saveData: ISaveData) => void,
    openLayerImport: () => void,
}
interface IWelcomeScreenStates {
    /** User selected filename to upload*/
    fileName?: string,
    /** The JSON of the saved data */
    savedJSON?: ISaveData,
}
interface IDemoPreviewProps {
    imageURL: string,
    description: string,
    loadDemo: () => void,
}
interface IDemoPreviewStates {
    overlayOpen?: boolean
}
