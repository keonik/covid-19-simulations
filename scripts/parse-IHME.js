import fs from 'fs';
import * as d3 from 'd3-dsv';

const ihmeFile = fs.readFileSync('./public/files/SimCommandIHME-latest.csv', 'utf-8');

const ihmeSimData = d3.csvParse(ihmeFile);

const geoOrganization = [
    { value: 'G', label: 'Country', organizations: [] },
    { value: 'S', label: 'States', organizations: [] },
    { value: 'B', label: 'US Bases', organizations: [] },
    { value: 'C', label: 'US Counties', organizations: [] },
];
const geoLocations = [];

const rowRegex = new RegExp('Prediction_TS_Day_');
const predictionsTSDays = [];
let startGeoLocations = -1;

// get all prediction data columns and major command columns
ihmeSimData.columns.forEach((col, index) => {
    if (rowRegex.test(col)) {
        // reset geoLocations to -1 to avoid adding more columns
        if (startGeoLocations >= 0) {
            startGeoLocations = -1;
        }
        predictionsTSDays.push(col);
        // this is the row before geoLocations
    } else if (col === 'VizN_Date') {
        startGeoLocations = index;
        // geoLocations have started...add them to array
    } else if (startGeoLocations >= 0 && !geoLocations.find(({ value }) => value === col) && !col.startsWith('NAF')) {
        geoLocations.push({ value: col, label: col, locations: [] });
    }
});

ihmeSimData.forEach((row, index) => {
    if (index < 10) {
        console.log(row.Location);
    }
});

fs.writeFileSync('./data/selectors/geo-locations.json', JSON.stringify(geoLocations), 'utf8');

console.log('parsed');
