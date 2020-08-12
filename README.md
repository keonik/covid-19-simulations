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

##

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

##### `npm run parse`

If you have access to the csv's you can manipulate the scripts/parse.js file to tweak the output data under the data directory
