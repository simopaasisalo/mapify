/** The React properties of the menu */
interface IMenuProps {
    /** The current list of map layers*/
    layers: ILayerData[],
    /** The current list of map filters*/
    filters: IFilter[],
    /** Update the selected layer with new options*/
    refreshMap: (options: ILayerData) => void,
    /** Reorder the layers on the map*/
    changeLayerOrder: (order: number[]) => void,
    /** Add a new layer (by opening import wizard)*/
    addLayer: () => void,
    /** Remove a layer from the map*/
    deleteLayer: (id: number) => void,
    /** Create a new filter or replace an existing one. Returns id*/
    saveFilter: (info: IFilter) => number,
    /** Remove a filter from the map */
    deleteFilter: (id: number) => void,
    /** Update the map legend*/
    legendStatusChanged: (info: ILegend) => void,
    /** Should the menu be rendered*/
    visible: boolean,
    /** Export map as .png */
    saveImage: (options: IExportMenuStates) => void,
    /** Export map as .mapify*/
    saveFile: () => void,
}

/** The React states of the menu */
interface IMenuStates {
    /** 1-layer,2-color,3-symbol,4-filter,5-legend,6-popup,7-export*/
    visibleOptions?: number,

    /** The currently selected layer*/
    activeLayer?: ILayerData,
}
/** The interface shared by the sub menus */
interface ISubMenuProps {
    /** Current active layer's headers*/
    headers?: IHeader[],
    /** Should the menu be rendered*/
    isVisible: boolean
}

/** The React properties of the color menu*/
interface IColorMenuProps extends ISubMenuProps {
    /** Previous color options. Used to keeping the selected values the same between transitions*/
    prevOptions: IColorOptions,
    /** Is the current layer using color scaling*/
    isChoropleth: boolean,
    /**Is the current layer using icon symbols*/
    isIconSymbol: boolean,
    /** Save the current options to the layer*/
    saveValues: (values: IColorOptions) => void,
    /** layer being edited*/
    layer: ILayerData,
}

/** The React states of the color menu*/
interface IColorMenuStates {
    /** The name of the field to scale the fill color by*/
    colorSchemeFieldName?: string,
    /** The color scheme to use when scaling by value*/
    colorScheme?: string,
    /** Use a premade scale or user defined one*/
    useCustomScheme?: boolean,
    /** Either user selected limits or chroma-js calculated ones*/
    limits?: number[],
    /** Either user selected colors or chroma-js calculated ones*/
    colors?: string[],
    /** The current opacity. Modifies both the fill and border opacity*/
    opacity?: number,
    /** Is the layer using multiple fill colors (ie. choropleth layers)*/
    useMultipleFillColors?: boolean,
    /** Fill color for single color layers. Hex or CSS color name*/
    fillColor?: string,
    /** Border color of layers. Hex or CSS color name*/
    borderColor?: string,
    /** Icon symbol fa-color. Hex or CSS color name*/
    iconTextColor?: string,
    /** Should the color display be rendered*/
    colorSelectOpen?: boolean,
    /** Reverse the color schemes*/
    revertColorScheme?: boolean,
    /** The amount of different colors in color schemes*/
    steps?: number,
    /** Chroma-js-modes. q=quantiles, k=k-means, e=equidistant */
    mode?: string,
    /** The name of the color being edited in color selection */
    editing?: string,
    /** Helper for showing the clicked item's color on the Chrome-style picker */
    startColor?: string,
}

/** The React properties of the color schemes*/
interface IColorSchemeProps {
    /** The ColorBrewer color scheme name*/
    gradientName: string,
    /** Should the scheme be reversed*/
    revert: boolean,
}

/** The React properties of the symbol menu*/
interface ISymbolMenuProps extends ISubMenuProps {
    /** Previous symbol options. Used to keeping the selected values the same between transitions*/
    prevOptions: ISymbolOptions,
    /** Save the current options to the layer*/
    saveValues: (values: ISymbolOptions) => void,
    /** Layer being edited */
    layer: ILayerData,

}

/** The React states of the symbol menu*/
interface ISymbolMenuStates extends ISymbolOptions {
    /** Is the icon selection visible*/
    iconSelectOpen?: boolean,
    /** Use steps to define different icons*/
    useIconSteps?: boolean,


    /** The icon being edited */
    currentIconIndex?: number,
    iconStepCount?: number,
    /** Headers of number type */
    selectableHeaders?: IHeader[],

}



/** The React properties of the layer menu*/
interface ILayerMenuProps {
    /** Current list of active layers*/
    layers: ILayerData[],
    /** Function to signal the opening of the layer import wizard. Triggered by button press*/
    addNewLayer: () => void,
    /** Function to remove a layer from the map. Triggered by button press*/
    deleteLayer: (id: number) => void,
    /** Save the current order to the map. Triggered by button press*/
    saveOrder: (order: number[]) => void,
    /** Should the menu be rendered*/
    isVisible: boolean,

}
/** The React states of the layer menu */
interface ILayerMenuStates {
    /** The current order of layers */
    order: { name: string, id: number }[],
}

/** The React properties of the filter menu*/
interface IFilterMenuProps {
    filters: IFilter[],
    /** adds the filter control to the map. Is triggered by button press. Returns the id of the created filter */
    addFilterToMap: (info: IFilter) => number,
    /** Removes filter by specified id from the map */
    deleteFilter: (id: number) => void,
    /** Should the menu be displayed */
    isVisible: boolean,
    /** The currently selected layer from the Menu*/
    layer: ILayerData,


}

/** The React states of the filter menu */
interface IFilterMenuStates {
    /** Currently selected filter*/
    selectedFilterId?: number,
    /** Currently selected field to filter*/
    selectedField?: string,
    /** The title of the filter to be rendered*/
    filterTitle?: string,
    /** Let the user define custom steps for the filter */
    useCustomSteps?: boolean,
    /** Amount of steps. Default 5*/
    customStepCount?: number,
    /** The custom steps (minVal-maxVal)[]*/
    customSteps?: [number, number][],
    /** Use distinct values as steps*/
    useDistinctValues?: boolean,
    /** Layer's feature's minimum value*/
    minVal?: number,
    /** Layer's feature's maximum value*/
    maxVal?: number,
    /** Whether to remove the filtered layer completely or change opacity*/
    remove?: boolean,
}

/** The React properties of the legend menu */
interface ILegendMenuProps extends ISubMenuProps {
    /** Save the legend options. Is triggered any time a value is changed */
    valuesChanged: (values: ILegend) => void,
}

/** The React properties of the pop-up menu */
interface IPopUpMenuProps extends ISubMenuProps {
    /** Save the currently selected headers to the map. Is triggered when the user presses the save button*/
    saveSelection: (headers: IHeader[]) => void,
}

/** The React states of the pop-up menu */
interface IPopUpMenuStates {
    /** The pop-up contents */
    shownHeaders: IHeader[],
}

/** The React states of the export menu */
interface IExportMenuProps extends ISubMenuProps {
    /** Save map as a .png image*/
    saveImage: (options: IExportMenuStates) => void,
    /** Save map as a .mapify file*/
    saveFile: () => void,
}

/** The React states of the export menu */
interface IExportMenuStates {
    showLegend?: boolean,
    showFilters?: boolean,
    imageName?: boolean,
}
