import * as Papa from 'papaparse';
var csv2geojson = require('csv2geojson');
var proj4 = require('proj4');

export class FilePreProcessModel {


    /**
     * public - Returns the headers from the input text
     * TODO: implement support for other formats than csv
     *
     * @param  {string} input         the whole input as string
     * @param  {string} fileExtension the file format, ie. .csv, .xml
     * @return {[string[], string]}   tuple containing headers in an array and the delimiter
     */
    public ParseHeaders(input: string, fileExtension: string) {
        let headers: Array<string> = [];
        let delim: string = '';
        if (fileExtension === 'csv') {
            let parse = Papa.parse(input, { preview: 1, header: true });
            headers = parse.meta.fields;
            delim = parse.meta.delimiter;
        }
        return [headers, delim];
    }


    /**
     * public - Converts input data into Leaflet layer
     * TODO: implement support for other formats besides CSV
     *
     * @param  input      the import file in text format
     * @param  latField  latitude field name
     * @param  lonField  longitude field name
     * @param  fileFormat the file extension
     * @param  delim     delimiter
     * @return           GeoJSON featurecollection
     */
    public ParseToGeoJSON(input: string, latField: string, lonField: string, fileFormat: string, delim: string, coordSystem: string) {
        let geoJSON: L.GeoJSON = null;
        if (fileFormat === 'csv') {
            geoJSON = parseCSV();
        }

        function parseCSV() {
            csv2geojson.csv2geojson(input, {
                latfield: latField,
                lonfield: lonField,
                delimiter: delim
            },
                function(err, data) {
                    if (!err) {
                        geoJSON = projectCoords(data, coordSystem);
                    }
                    else {
                        //TODO
                        console.log(err);
                    }
                });
            return geoJSON;
        }

        function projectCoords(geoJSON, fromProj: string) {
            geoJSON.features.forEach(feature => {
                let x = feature.geometry.coordinates[0];
                let y = feature.geometry.coordinates[1];
                let convert = proj4(fromProj, 'WGS84', [x, y]);
                feature.geometry.coordinates[1] = convert[1];
                feature.geometry.coordinates[0] = convert[0];
            });
            return geoJSON;

        }
        return geoJSON;

    }



}
