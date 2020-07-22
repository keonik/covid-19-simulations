import fs, { mkdirSync, rmdirSync } from 'fs';
import * as d3 from 'd3-dsv';

// relies on files under files directory
const ihmeFile = fs.readFileSync('./files/SimCommandIHME-latest.csv', 'utf-8');
const caaFile = fs.readFileSync('./files/SimCommandCAA-latest.csv', 'utf-8');
const lanlFile = fs.readFileSync('./files/SimCommandLANL-latest.csv', 'utf-8');
const utFile = fs.readFileSync('./files/SimCommandUT-latest.csv', 'utf-8');
const yygFile = fs.readFileSync('./files/SimCommandYYG-latest.csv', 'utf-8');

const ihmeSimData = d3.csvParse(ihmeFile);
const caaSimData = d3.csvParse(caaFile);
const lanlSimData = d3.csvParse(lanlFile);
const utSimData = d3.csvParse(utFile);
const yygSimData = d3.csvParse(yygFile);

const geoOrganizations = [
    { value: 'G', label: 'Country', disabled: false, locations: [], folder: 'data/countries' },
    { value: 'S', label: 'States', disabled: false, locations: [], folder: 'data/states' },
    { value: 'B', label: 'US Bases', disabled: true, locations: [], folder: 'data/bases' },
    { value: 'C', label: 'US Counties', disabled: false, locations: [], folder: 'data/counties' },
];

const geoLocations = [];

function pushToGeoOrganization(Type_Indicator, Location, FIPS) {
    switch (Type_Indicator) {
        case 'G': {
            geoOrganizations[0].locations.push({ value: FIPS, label: Location });
            break;
        }
        case 'S': {
            geoOrganizations[1].locations.push({ value: FIPS, label: Location });
            break;
        }
        case 'B': {
            geoOrganizations[2].locations.push({ value: FIPS, label: Location });
            break;
        }
        case 'C': {
            geoOrganizations[3].locations.push({ value: FIPS, label: Location });
            break;
        }
        default:
            break;
    }
}

function formatPoints(PredictionTSDays, index) {
    const points = [];
    // all prediction values into array [{x: null, y :Date}, {x: 0, y: Date}]
    PredictionTSDays.forEach((rowName) => {
        const y = rowName.replace('Prediction_TS_Day_', '');
        const value = parseFloat(ihmeSimData[index][rowName]);

        if (value) {
            if (value > 0) {
                points.push({ x: +parseInt(value), y });
            }
            // set minimum 0 (show no negatives)
            else {
                points.push({ x: 0, y });
            }
        } else {
            // push null to avoid rendering unneeded data in plots/charts
            points.push({ x: null, y });
        }
    });

    return points;
}

function getPredictionColumns(simData) {
    const rowRegex = new RegExp('Prediction_TS_Day_');
    const predictionsTSDays = [];
    let startGeoLocations = -1;

    // get all prediction data columns and major command columns
    simData.columns.forEach((col, index) => {
        if (rowRegex.test(col)) {
            // reset geoLocations to -1 to avoid adding more columns
            if (startGeoLocations >= 0) {
                startGeoLocations = -1;
            }
            predictionsTSDays.push(col);
            // this is the row before geoLocations
        } else if (col === 'VizN_Date') {
            startGeoLocations = index;
            // geoLocations have started...add them to array // exclude NAF's
        } else if (
            startGeoLocations >= 0 &&
            !geoLocations.find(({ value }) => value === col) &&
            !col.startsWith('NAF')
        ) {
            geoLocations.push({ value: col, label: col, locations: [] });
        }
    });
    return predictionsTSDays;
}

let predictionsTSDays = getPredictionColumns(ihmeSimData);

ihmeSimData.forEach((row, index) => {
    const { Sim_ID, Location, FIPS, Type_Indicator, Run_Type } = row;

    const parentLocation = geoLocations.find(({ value }) => +row[value] === 1);
    const { locations } = parentLocation;

    const locationExists = locations.find(({ value }) => value === +FIPS);

    // xy points
    const points = formatPoints(predictionsTSDays, index);

    // Location hasn't been added yet
    if (!locationExists) {
        // add Location to appropriate org based on Type_Indicator
        pushToGeoOrganization(Type_Indicator, Location, FIPS);

        locations.push({
            value: +FIPS,
            label: Location,
            indicator: Type_Indicator,
            startDate: predictionsTSDays[0].replace('Prediction_TS_Day_', ''),
            predictions: [{ id: +Sim_ID, runType: Run_Type, values: points }],
        });
    } else {
        const locationIndex = locations.findIndex(({ value }) => value === +FIPS);
        locations[locationIndex].predictions.push({ id: +Sim_ID, runType: Run_Type, values: points });
    }
});

predictionsTSDays = getPredictionColumns(caaSimData);

caaSimData.forEach((row, index) => {
    const { Sim_ID, FIPS, Run_Type } = row;

    const parentLocation = geoLocations.find(({ value }) => +row[value] === 1);
    const { locations } = parentLocation;

    // xy points
    const points = formatPoints(predictionsTSDays, index);

    const locationIndex = locations.findIndex(({ value }) => value === +FIPS);
    locations[locationIndex].predictions.push({ id: +Sim_ID, runType: Run_Type, values: points });
});

predictionsTSDays = getPredictionColumns(lanlSimData);

lanlSimData.forEach((row, index) => {
    const { Sim_ID, FIPS, Run_Type } = row;

    const parentLocation = geoLocations.find(({ value }) => +row[value] === 1);
    const { locations } = parentLocation;

    // xy points
    const points = formatPoints(predictionsTSDays, index);

    const locationIndex = locations.findIndex(({ value }) => value === +FIPS);
    locations[locationIndex].predictions.push({ id: +Sim_ID, runType: Run_Type, values: points });
});

predictionsTSDays = getPredictionColumns(utSimData);

utSimData.forEach((row, index) => {
    const { Sim_ID, FIPS, Run_Type } = row;

    const parentLocation = geoLocations.find(({ value }) => +row[value] === 1);
    const { locations } = parentLocation;

    // xy points
    const points = formatPoints(predictionsTSDays, index);

    const locationIndex = locations.findIndex(({ value }) => value === +FIPS);
    locations[locationIndex].predictions.push({ id: +Sim_ID, runType: Run_Type, values: points });
});

predictionsTSDays = getPredictionColumns(yygSimData);

yygSimData.forEach((row, index) => {
    const { Sim_ID, FIPS, Run_Type } = row;

    const parentLocation = geoLocations.find(({ value }) => +row[value] === 1);
    const { locations } = parentLocation;

    // xy points
    const points = formatPoints(predictionsTSDays, index);

    const locationIndex = locations.findIndex(({ value }) => value === +FIPS);
    locations[locationIndex].predictions.push({ id: +Sim_ID, runType: Run_Type, values: points });
});

geoLocations.forEach((parentLocation) => {
    parentLocation.locations.forEach((location) => {
        const orgFolder = geoOrganizations.find(({ value }) => value === location.indicator)?.folder;

        const { value } = location;
        if (orgFolder) {
            const fileName = `./${orgFolder}/${value}.json`;
            fs.writeFileSync(fileName, JSON.stringify(location), 'utf8');
            console.log(`finished ${fileName}`);
        }
    });
});

fs.writeFileSync('./data/selectors/geo-organizations.json', JSON.stringify(geoOrganizations), 'utf8');
