
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


interface ILegendMenuProps extends ISubMenuProps {
    valuesChanged: (values: ILegend) => void,
}

interface ILegendMenuStates {
    showLegend?: boolean,
    horizontal?: boolean,
    title?: string,
}
