/** The different kinds of layers that can be created */
enum LayerTypes {
    /** Area by value maps. Distuingish different areas on map by setting color based on a value */
    ChoroplethMap,
    /** Dot density and dot maps. TODO */
    DotMap,
    /** Use different icons,shapes or graphs to pinpoint locations. */
    SymbolMap,
    /** Show intensity of a phenomenon by color scaling. TODO */
    HeatMap
}

/** Different supported symbol types */
enum SymbolTypes {
    /** Basic circular symbol. Uses L.CircleMarker. Can be resized and colored. */
    Circle,
    /** Basic rectancular symbol. Uses L.DivIcon. Width and height can both be resized, and color can be changed. */
    Rectangle,
    /** TODO */
    Chart,
    /** leaflet.Awesome-Markers- type marker. Uses Font Awesome-css to show a specific icon. */
    Icon
}

/** Projection names to show in import wizard */
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
