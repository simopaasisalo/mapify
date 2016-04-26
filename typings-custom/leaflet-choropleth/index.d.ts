

declare namespace L {

    export interface Choropleth extends L.GeoJSONStatic { }
    /**

      * Creates a choropleth layer.

      */

    export function choropleth(data: any, options: IColorOptions): L.GeoJSON;

}
