
/**
 * The possible layer types to create. Used in determining the UI menu items to show
 */
enum LayerTypes {
    ChoroplethMap,
    DotMap,
    SymbolMap,
    HeatMap
}


/**
 * The possible symbol types for symbol maps
 */
enum SymbolTypes {
    Circle,
    Rectangle,
    Chart,
    Icon
}

let DefaultProjections: Array<string> = ['WGS84', 'EPSG:4269', 'EPSG:3857', 'ETRS-GK25FIN'];

function GetSymbolRadius(val: number, sizeMultiplier: number, minSize: number, maxSize: number) {
    let radius = Math.sqrt(val * sizeMultiplier / Math.PI) * 2;
    if (radius < minSize)
        radius = minSize;
    else if (radius > maxSize)
        radius = maxSize;
    return radius;

}

export {LayerTypes, SymbolTypes, DefaultProjections, GetSymbolRadius}
