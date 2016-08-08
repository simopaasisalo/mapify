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
    /** Pie- or donut chart based on multiple icons. Can be resized, but color scheme is static. */
    Chart,
    /** leaflet.Awesome-Markers- type marker. Uses Font Awesome-css to show a specific icon. */
    Icon,
    /** Create a stack of squares. Uses L.DivIcon. Square amount adjustable */
    Blocks,
}

/** Projection names to show in import wizard */
let DefaultProjections: Array<string> = ['WGS84', 'EPSG:4269', 'EPSG:3857', 'ETRS-GK25FIN'];

function GetSymbolSize(val: number, sizeMultiplier: number, minSize: number, maxSize: number) {
    let r = Math.sqrt(val * sizeMultiplier / Math.PI) * 2;
    if (r < minSize)
        r = minSize;
    else if (r > maxSize)
        r = maxSize;
    return r;

}



/** Calculate a set of limits between a minimum and maximum values*/
function CalculateLimits(min: number, max: number, count: number) {
    let limits: number[] = [];
    for (let i = min; i < max; i += (max - min) / count) {
        limits.push(Math.round(i));
    }
    if (limits.indexOf(max) === -1)
        limits.push(max)
    return limits;
}

function GetItemBetweenLimits(limits: any[], items: any[], value: number) {

    if (!isNaN(value)) {
        if (limits.length > 0)
            for (let i = 0; i < limits.length; i++) {

                if (i < limits.length - 1) {
                    let lowerLimit = limits[i];
                    let upperLimit = limits[i + 1];
                    if (lowerLimit <= value && value <= upperLimit) {
                        return items[i];
                    }
                }
                else {
                    return items[items.length - 1]
                }
            }
        else {
            return items[0];
        }
    }
}


/**
 * LoadSavedMap - Loads a specified .mapify-file
 *
 * @param  filename   name of the file, without extension
 * @param  onLoad     function to run on load complete
 * @param  path       custom path. If null, defaults to demos/
 */
function LoadSavedMap(filename: string, onLoad: (string) => void, path?: string) {

    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", (path ? path : 'demos/') + filename + '.mapify', false);
    rawFile.onreadystatechange = uploadComplete.bind(this)
    function uploadComplete() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                onLoad(JSON.parse(rawFile.responseText));
            }
        }
    }
    rawFile.send(null);
}

export { LayerTypes, SymbolTypes, DefaultProjections, GetSymbolSize, CalculateLimits, GetItemBetweenLimits, LoadSavedMap }
