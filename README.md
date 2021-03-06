# Covid 19 Simulations in JSON

Script to converts csv's provided by AFRL Explainable Artificial Intelligence Laboratory to json files separated by locations

[Homepage](https://keonik.github.io/covid-19-simulations/)

## Sources

Simulation Sources

-   EXAIL - AFRL Explainable AI Lab data
-   [IHME](http://www.healthdata.org/covid/data-downloads)
-   [Center for Army Analysis (CAA)](https://covid19.torchinsight.com)
-   [Los Alamos National Laboratory(LANL)](https://covid-19.bsvgateway.org/#link%20to%20forecasting%20site)
-   [University of Texas (UT)](https://github.com/UT-Covid/USmortality)
-   [Youyang Gu (YYG)](https://github.com/youyanggu/covid19_projections/tree/master/)

## Example usage

1. Visit [USDA](https://www.nrcs.usda.gov/wps/portal/nrcs/detail/national/home/?cid=nrcs143_013697) and obtain a FIPS Code

    - Counties are the same as this site trimming out the leading zeroes
    - States are multiplied by 1000 (example Alabama --> 1000)
    - Countries only include the United States at this time with FIPS 840

2. Visit desired hierarchy (countries, states, counties)/FIPS.json

-   [Example](https://keonik.github.io/covid-19-simulations/data/states/2000.json)

## Requirements to Edit

-   [nodejs](https://nodejs.org/en/)
-   `.env` file with the following keys

    -   AWS_ACCESS_KEY_ID
    -   AWS_SECRET_ACCESS_KEY
    -   AWS_FOUO_BUCKET_NAME
    -   AWS_BUCKET_NAME
    -   AWS_REGION

    Contact KBR to obtain access keys

## Folder structure

#### data

Stores all json files in hierarchy as follows

-   countries
    -   unique FIPS to country
    -   currently only United States
    -   100,000 indexed to avoid overlap
-   states
    -   unique FIPS to state
    -   US States
-   counties
    -   unique US County FIPS
    -   US Counties
-   selectors (WIP)
    -   used for select drop down options
        -   Nations, US State, US Counties by State

#### scripts

scripts used to parse csv's into json format

##### `npm run build`

Fetches files based on date in script (need to update to fetch yesterday's date automatically), unzips it, and runs the parse script.

##### `npm run parse`

Runs a script located at scripts/parse.js

##### `npm run clean`

Removes ignored files to make fetching fresh

##### `npm run fetch`

Fetches the latest files, unzips them, and places them in the files directory

-   Requires a `.env` file with all the aws associated keys to access the buckets
    -   keys
        -   AWS_ACCESS_KEY_ID
        -   AWS_SECRET_ACCESS_KEY
        -   AWS_FOUO_BUCKET_NAME
        -   AWS_BUCKET_NAME
        -   AWS_REGION
    -   Contact KBR to obtain access keys
