

declare namespace L {

    export interface Choropleth extends L.GeoJSONStatic { }

    export interface ChoroplethOptions extends L.GeoJSONOptions {

        valueProperty: string,

        scale: string,

        steps: number,

        mode: string,

    }

    /**

      * Creates a choropleth layer.

      */

    export function choropleth(data: any, options: ChoroplethOptions): L.GeoJSON;

}
