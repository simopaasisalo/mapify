import {observable, computed} from 'mobx';
import {LayerTypes, SymbolTypes} from "./common_items/common";

export class AppState {

    @observable welcomeShown: boolean = true;
    /** Is the import wizard visible*/
    @observable importWizardShown: boolean = false;
    /** Is the options menu visible*/
    @observable menuShown: boolean = false;
    /** The layers of the map.*/
    @observable layers: Layer[] = [];
    /** The data filters of the map.*/
    @observable filters: IFilter[] = [];
    /** The active legend of the map*/
    @observable legend: ILegend = new Legend();
    /** Currently selected layer on the menu*/
    @observable editingLayer: Layer;
    /** Currently open submenu index. 0=none*/
    @observable visibleMenu: number = 0;
    /** UI state of the color menu*/
    @observable colorMenuState: ColorMenuState = new ColorMenuState();

    @observable symbolMenuState: SymbolMenuState = new SymbolMenuState();

    @observable filterMenuState: FilterMenuState = new FilterMenuState();

    @computed get editingFilter() {
        return this.filters.filter(function(f) { return f.id === this.filterMenuState.selectedFilterId })[0];
    }

    @observable layerMenuState: LayerMenuState = new LayerMenuState();

    @observable exportMenuState: ExportMenuState = new ExportMenuState();

    @observable autoRefresh: boolean = true;
}

/** The state to be saved when exportin a map to a file*/
export class SaveState {
    /** The layers of the map.*/
    layers: Layer[] = [];
    /** The data filters of the map.*/
    filters: IFilter[] = [];
    /** The active legend of the map*/
    legend: ILegend = new Legend();
}

export class ImportWizardState {
    /** The currently active step of the wizard */
    @observable step: number = 0;
    @observable layer: Layer = new Layer();
    @observable fileName: string;
    /** The file extension of the updated file */
    @observable fileExtension: string;
    /** The file's contents as string */
    @observable content: string;
    /** If DSV; the delimiter used to separate columns */
    @observable delimiter: string;
    /** The name of the latitude field */
    @observable latitudeField: string;
    /** The name of the longitude field */
    @observable longitudeField: string;
    /** The name of the coordinate system */
    @observable coordinateSystem: string;
    /** Is the file in GeoJSON? If so, don't show lat-lon-selection*/
    @computed get isGeoJSON() {
        return this.layer.geoJSON ? true : false;
    };
    /** Is the layer going to be a heatmap?*/
    @computed get isHeatMap() {
        return this.layer.layerType === LayerTypes.HeatMap;
    }
}

//TODO: filterstore, layerstore, legendstore(?)

export class Legend implements ILegend {
    /** The name of the legend. Is shown in the UI */
    @observable title: string;
    /** A description of the data or other user-generated text. Is shown in the bottom of the legend */
    @observable meta: string;
    /** Should the legend be horizontally aligned */
    @observable horizontal: boolean;
    /** Is the legend shown on the map */
    @observable visible: boolean;
    @observable showPercentages: boolean;
}

export class Layer {
    /** The unique identification. Is used for example to delete items*/
    id: number;
    /** The name of the layer. Will be shown in the UI*/
    @observable layerName: string;
    /** The GeoJSON representation of the data.*/
    @observable geoJSON: { features: any[], type: string };
    /** The type of the layer. Will affect the options available.*/
    @observable layerType: LayerTypes;
    /** The data property names.*/
    @observable headers: IHeader[] = [];

    @computed get numberHeaders() {
        return this.headers.filter(function(val) { return val.type === 'number' });
    }

    @observable popupHeaders: IHeader[] = [];

    /** The variable by which to create the heat map*/
    @observable heatMapVariable: string;
    /** The Leaflet layer. Will be modified by changing options*/
    @observable layer: any;
    /** The active visualization options configuration*/
    @observable visOptions: VisualizationOptions = new VisualizationOptions();


}

export class VisualizationOptions {
    /** The function to run on every feature of the layer. Is used to place pop-ups to map features */
    onEachFeature: (feature: any, layer: L.GeoJSON) => void = null;
    /** The function to convert a geojson point to a layer. Is used in symbol maps ie. to convert a point to a circle marker */
    pointToLayer: (featureData: any, latlng: L.LatLng) => any = null;
    /** The coloring options of the layer. Contains ie. border color and opacity */
    @observable colorOptions: ColorOptions = new ColorOptions();
    /**  The symbol options for symbol layers. Contains ie. symbol type  */
    @observable symbolOptions: SymbolOptions = new SymbolOptions();
}

export class ColorOptions implements L.PathOptions {
    /** If not empty, use choropleth coloring */
    @observable choroplethField: string;
    /** Is the scale user-made?*/
    @observable useCustomScheme: boolean;
    /** Color name array to use in choropleth*/
    @observable colors: string[] = [];
    /** Value array to use in choropleth*/
    @observable limits: number[] = [];
    /** The color scheme name to use in choropleth. Default black-white*/
    @observable colorScheme: string = 'Greys';
    /** The amount of colors to use in choropleth. Default 5*/
    @observable steps: number = 5;
    /** Is the scheme reversed. This is used only to keep the menu selection synced with map*/
    @observable revert: boolean;
    /** The Chroma-js method to calculate colors. Default q->quantiles*/
    @observable mode: string = 'q';
    /** The color of the icon in symbol maps. Default white */
    @observable iconTextColor: string = '#FFF';
    /** Main fill color. Default yellow*/
    @observable fillColor: string = '#E0E62D';
    /** Border color. Default black*/
    @observable color: string = '#000';
    /** Main opacity. Default 0.8*/
    @observable fillOpacity: number = 0.8;
    /** Border opacity. Default 0.8*/
    @observable opacity: number = 0.8;
}

export class SymbolOptions {
    /** The type of the symbol. Default circle*/
    @observable symbolType: SymbolTypes = SymbolTypes.Circle;
    /** The list of icons to use. Default: one IIcon with shape='circle' and fa='anchor'*/
    @observable icons: IIcon[] = [{ shape: 'circle', fa: 'anchor' }];

    /** Name of the field by which to calculate icon values*/
    @observable iconField: string;
    /** The steps of the field values by which to choose the icons */
    @observable iconLimits: number[] = [];
    /** The name of the field to scale size x-axis by*/
    @observable sizeXVar: string;
    /** The name of the field to scale size y-axis by*/
    @observable sizeYVar: string;
    /** The minimum allowed size when scaling*/
    @observable sizeLowLimit: number;
    /** The maximum allowed size when scaling*/
    @observable sizeUpLimit: number;
    /** The multiplier to scale the value by*/
    @observable sizeMultiplier: number;
    /** Currently selected chart fields*/
    @observable chartFields: IHeader[] = [];
    /** The type of chart to draw*/
    @observable chartType: 'pie' | 'donut';
    /** How many units does a single block represent*/
    @observable blockValue: number;
    /** If symbol is of scalable type; the minimum of all the x-values being calculated. Is used in the legend */
    @observable actualMinXValue: number;
    /** If symbol is of scalable type; the minimum of all the y-values being calculated. Is used in the legend */
    @observable actualMinYValue: number;
    /** If symbol is of scalable type; the minimum of all the x(pixels) being calculated. Is used in the legend */
    @observable actualMinX: number;
    /** If symbol is of scalable type; the minimum of all the y(pixels) being calculated. Is used in the legend */
    @observable actualMinY: number;
    /** If symbol is of scalable type; the maximum of all the x-values being calculated. Is used in the legend */
    @observable actualMaxXValue: number;
    /** If symbol is of scalable type; the maximum of all the y-values being calculated. Is used in the legend */
    @observable actualMaxYValue: number;
    /** If symbol is of scalable type; the maximum of all the x being calculated. Is used in the legend */
    @observable actualMaxX: number;
    /** If symbol is of scalable type; the maximum of all the y being calculated. Is used in the legend */
    @observable actualMaxY: number;
}

export class ColorMenuState {
    /** The name of the color being edited in color selection */
    @observable editing: string;
    /** Helper for showing the clicked item's color on the Chrome-style picker */
    @observable startColor: string;
    /** Should the color display be rendered*/
    @observable colorSelectOpen: boolean;

    @observable useMultipleFillColors: boolean;

}

export class SymbolMenuState {
    /** Is the icon selection visible*/
    @observable iconSelectOpen: boolean;
    /** Use steps to define different icons*/
    @observable useIconSteps: boolean;
    /** The icon being edited */
    @observable currentIconIndex: number;
    @observable iconStepCount: number;
}

export class FilterMenuState {
    /** Currently selected filter*/
    @observable selectedFilterId: number;
    /** Currently selected field to filter*/
    @observable selectedField: string;
    /** The title of the filter to be rendered*/
    @observable filterTitle: string;
    /** Let the user define custom steps for the filter */
    @observable useCustomSteps: boolean;
    /** Amount of steps. Default 5*/
    @observable customStepCount: number = 5;
    /** The custom steps (minVal-maxVal)[]*/
    @observable customSteps: [number, number][] = [];
    /** Use distinct values as steps*/
    @observable useDistinctValues: boolean;
    /** Layer's feature's minimum value*/
    @observable minVal: number;
    /** Layer's feature's maximum value*/
    @observable maxVal: number;
    /** Whether to remove the filtered layer completely or change opacity*/
    @observable remove: boolean;
}

export class LayerMenuState {
    /** The current order of layers */
    @observable order: { name: string, id: number }[] = [];
}

export class ExportMenuState {
    @observable showLegend: boolean;
    @observable showFilters: boolean;
    @observable imageName: boolean;
}
