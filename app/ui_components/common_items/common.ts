
/**
 * The possible layer types to create. Used in determining the UI menu items to show
 */
enum LayerTypes{
  ChoroplethMap,
  DotMap,
  SymbolMap,
  HeatMap
}

let DefaultProjections : Array<string> = ['WGS84', 'EPSG:4269', 'EPSG:3857', 'ETRS-GK25FIN'];

export {LayerTypes, DefaultProjections}
