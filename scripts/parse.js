import fs, { mkdirSync, rmdirSync } from 'fs';
import * as d3 from 'd3-dsv';

// relies on files under files directory
const ihmeFile = fs.readFileSync('./files/SimCommandIHME-latest.csv', 'utf-8');
const caaFile = fs.readFileSync('./files/SimCommandCAA-latest.csv', 'utf-8');
const lanlFile = fs.readFileSync('./files/SimCommandLANL-latest.csv', 'utf-8');
const utFile = fs.readFileSync('./files/SimCommandUT-latest.csv', 'utf-8');
const yygFile = fs.readFileSync('./files/SimCommandYYG-latest.csv', 'utf-8');
const exailFile = fs.readFileSync('./files/SimCommandXAIL-latest.csv', 'utf-8');

const ihmeSimData = d3.csvParse(ihmeFile);
const caaSimData = d3.csvParse(caaFile);
const lanlSimData = d3.csvParse(lanlFile);
const utSimData = d3.csvParse(utFile);
const yygSimData = d3.csvParse(yygFile);
const exailSimData = d3.csvParse(exailFile);

const geoOrganizations = [
    { value: 'G', label: 'Countries', disabled: false, locations: [], folder: 'data/countries' },
    { value: 'S', label: 'US States', disabled: false, locations: [], folder: 'data/states' },
    { value: 'B', label: 'US Bases and Commands', disabled: false, locations: [], folder: 'data/bases' },
    { value: 'C', label: 'US Counties by State', disabled: false, locations: [], folder: 'data/counties' },
];

const geoLocations = [];

function pushToGeoOrganization(Type_Indicator, Location, FIPS, parent) {
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
            const index = geoOrganizations[2].locations.findIndex(({ label }) => label === parent);
            if (index !== -1) {
                geoOrganizations[2].locations[index].options.push({ value: FIPS, label: Location });
            } else {
                geoOrganizations[2].locations.push({
                    label: parent,
                    options: [{ value: FIPS, label: Location }],
                });
            }
            break;
        }
        case 'C': {
            const index = geoOrganizations[3].locations.findIndex(
                ({ label }) => label === parent.replace('County_', '')
            );
            if (index !== -1) {
                geoOrganizations[3].locations[index].options.push({ value: FIPS, label: Location });
            } else {
                geoOrganizations[3].locations.push({
                    label: parent.replace('County_', ''),
                    options: [{ value: FIPS, label: Location }],
                });
            }

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
        pushToGeoOrganization(Type_Indicator, Location, FIPS, parentLocation.value);

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

predictionsTSDays = getPredictionColumns(exailSimData);

exailSimData.forEach((row, index) => {
    const { Sim_ID, FIPS, Run_Type } = row;

    const standardDeviationRunType = Run_Type.includes('STD');

    if (!standardDeviationRunType) {
        // Mean Run type
        const parentLocation = geoLocations.find(({ value }) => +row[value] === 1);
        const { locations } = parentLocation;

        // xy points
        const points = formatPoints(predictionsTSDays, index);

        const locationIndex = locations.findIndex(({ value }) => value === +FIPS);

        // the standard deviation run type always follows after the Mean run type so we can calculate upper/lower at the same time
        const standardDeviationRow = exailSimData[index + 1];

        const stdPoints = formatPoints(predictionsTSDays, index + 1);

        const upperPoints = points.map(({ x, y }, index) => {
            if (!x) {
                return { x, y };
            }
            return { x: x + stdPoints[index]?.x, y };
        });

        const lowerPoints = points.map(({ x, y }, index) => {
            if (!x) {
                return { x, y };
            }
            const xVal = x - stdPoints[index]?.x;
            if (xVal < 0) {
                return { x: 0, y };
            }
            return { x: xVal, y };
        });

        locations[locationIndex].predictions.push(
            { id: +Sim_ID, runType: Run_Type, values: points },
            { id: +Sim_ID, runType: Run_Type.replace('Mean', 'Upper'), values: upperPoints },
            { id: +Sim_ID, runType: Run_Type.replace('Mean', 'Lower'), values: lowerPoints }
        );
    }
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

// const outputDropdownStructure = [];
// geoOrganizations.forEach((tier1, index) => {
//     if (index === 0) {
//         console.log(tier1);
//     }
//     tier1.locations.forEach((tier2, ind) => {
//         if (ind === 0) {
//             console.log(tier2);
//         }
//     });
// });
fs.writeFileSync('./data/selectors/geo-organizations.json', JSON.stringify(geoOrganizations), 'utf8');
console.log(`finished writing geo organizations`);
