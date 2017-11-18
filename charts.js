const colors = require('colors/safe');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const csvjs = require('csv.js');
const chartCounts = require('./lib/chartCounts');
const sortUtil = require('./lib/sortUtil');

const outputLocation = 'data/'; // = ''; // save to data folder or alternatively save to root

// set log text
const log_text = {
    error: `${colors.red.underline('ERROR')}:`,
    success: `${colors.green.underline('SUCCESS')}:`,
    results: `${colors.gray.underline('RESULTS')}:`
};

// argument defaults
const inputFile = argv.file;
if (!inputFile) {
    console.log(`${log_text.error} No filename specified. Use "--file filename" or see README for usage instructions.`);
    process.exit(1);
}

if (!argv.format) argv.format = 'csv';
else if (argv.format === 'text') argv.format = 'txt';
if (!argv.count) argv.count = 'album';
if (!argv.sort) argv.sort = 'count';

// check file exists
let inputData = {};
try {
    inputData = fs.readFileSync(path.join(__dirname, inputFile), 'utf8');
} catch(err) {
    console.log(`${log_text.error} There was an issue reading the file ${inputFile}.`);
    console.log(err);
    process.exit();
}

let tracks = [];

// check file format (csv or json)
const fileExt = inputFile.substring(inputFile.lastIndexOf('.')+1);
if (fileExt === 'csv') {
    console.log(inputData);
    tracks = csvjs.decode(inputData, ',');
    console.log(tracks);
} else if (fileExt === 'json') {
    tracks = JSON.parse(inputData);
} else {
    console.log(`${log_text.error} Unable to read import file format. Please use .csv or .json. Exiting app...`);
    process.exit();
}

// use /charts to calculate charts
let chartsData = {};
if (argv.count === 'artist') {
    chartsData = chartCounts.countArtists(tracks);
} else if (argv.count === 'label') {
    chartsData = chartCounts.countLabels(tracks);
} else {
    chartsData = chartCounts.countArtistAlbums(tracks);
}

// sort chart results based on args, defaults to sort based on counts
if (argv.sort === 'atoz') {
    chartsData = chartsData.sort(sortUtil.AtoZ(argv.count));
} else {
    chartsData = chartsData.sort(sortUtil.Counts());
}

const chartsDataJSON = JSON.stringify(chartsData)

// save to file in the format based on args, defaults to csv
const chartsFile = `${outputLocation}charts-${argv.count}_sort-${argv.sort}.${argv.format}`;
const tabSeparatedResults = csvjs.encode(chartsDataJSON).replace(/,/g, '\t');
let chartsFileData;
if (argv.format === 'json') {
    chartsFileData = chartsDataJSON;
} else if (argv.format === 'txt') {
    chartsFileData = tabSeparatedResults;
} else {
    chartsFileData = csvjs.encode(chartsDataJSON);
}

fs.writeFile(chartsFile, chartsFileData, function(err) {
    if (err) throw err;
    console.log(`${log_text.success} Charts file saved to ${chartsFile}`);

    // output results to console
    console.log(`${log_text.results} Charts tabulations for '${argv.count}' completed. \n\n\t${tabSeparatedResults.replace(/\n/g, '\n\t')}\n`);
});
