const colors = require('colors/safe');
const argv = require('minimist')(process.argv.slice(2));
const async = require('async');
const scrapeIt = require('scrape-it');
const csvStringify = require('csv-stringify');
const fs = require('fs');
const stringUtil = require('./lib/stringUtil');

const outputLocation = 'data/'; // = ''; // save to data folder or alternatively save to root

// set log text
const log_text = {
    error: `${colors.red.underline('ERROR')}:`,
    warning: `${colors.yellow.underline('WARNING')}:`,
    success: `${colors.green.underline('SUCCESS')}:`,
    info: `${colors.gray.underline('INFO')}:`
};

// check for required start/end args
if (!argv.start || !argv.end) {
    console.log(`${log_text.error} Requires two content nodeID arguments [start, end] to begin scraping playlists. See README.`);
    process.exit();
} else if (typeof argv.start !== 'number' || typeof argv.end !== 'number') {
    console.log(`${log_text.error} Start or end argument is not a number. NodeIDs must be integer values.`);
    process.exit();
} else if (argv.end - argv.start > 500) { // warning for large number of requests
    console.log(`${log_text.warning} Website or app may fail from the large number (${argv.end-argv.start}) of requested playlist scrapes.`);
}

// set defaults for optional args if undefined
if (!argv.format) argv.format = 'csv';
if (!argv.tracks) argv.tracks = 'all';
if (!argv.charts) argv.charts = 'none';

const urls = [];
const playlists = [];

for (let nid = argv.start; nid <= argv.end; nid++) {
    urls.push(`http://wkdu.org/playlist/${nid}`);
}

async.eachLimit(urls, 3, function(playlistUrl, callback) {
    scrapeIt(playlistUrl, {
        tracks: {
            listItem: '.views-table tbody tr',
            data: {
                artist: '.views-field-artist',
                title: '.views-field-title',
                album: '.views-field-album',
                label: '.views-field-label',
                new: '.views-field-newtrack',
                local: '.views-field-local-music'
            }
        },
        show: '.panel-col-first .blockpanel .pane-title a'
    }).then(playlist => {
        const newObj = {};
        let nid = playlistUrl.substring(25); // 25 = "http://wkdu.org/playlist/".length

        // invalid or empty playlist 
        if (!playlist.show || playlist.tracks.length === 0) {
            console.log(`${log_text.warning} Playlist #${nid} did not exist or was empty. Skipping...`);
        } else {
            playlist.nid = nid;
            playlist.url = playlistUrl;

            // escape raw text in track info
            playlist.tracks.map(trk => {
                return {
                    artist: stringUtil.escapeRaw(trk.artist),
                    title: stringUtil.escapeRaw(trk.title),
                    album: stringUtil.escapeRaw(trk.album),
                    label: stringUtil.escapeRaw(trk.label),
                    new: trk.new,
                    local: trk.local
                };
            });

            // filter out tracks to only new/local if needed
            if (argv.tracks === 'new' && argv.charts !== 'local') {
                playlist.tracks = playlist.tracks.filter(trk => trk.new.length > 0);
            } else if (argv.tracks === 'local' && argv.charts !== 'new') {
                playlist.tracks = playlist.tracks.filter(trk => trk.local.length > 0);
            }

            playlists.push(playlist);
            console.log(`${log_text.info} Playlist #${nid} added with ${playlist.tracks.length} tracks. (${playlist.show})`);
        }
        callback();
    });
}, function (err) {
    if (err) {
        // encountered an error while scraping playlists
        console.log(`${log_text.error} There was an unexpected issue while scraping playlists. Exiting program...`);
        process.exit();
    } else {
        // all playlists scraped
        console.log(`${log_text.info} ${playlists.length} playlists have been successfully scraped.`);
        
        // proceed to save playlists and tracks
        const tracks = gatherTracks();
        saveInfo(playlists, tracks);

        // calculate charts if needed
        if (argv.charts && (argv.charts === 'new' || argv.charts === 'local' || argv.charts === 'all')) {
            calculateCharts(tracks);
        }
    }
});

// gather tracks from all playlists into a single array
function gatherTracks() {
    return playlists.map(plist => {
        return plist.tracks.map(track => {
            track.show = plist.show;
            track.url = plist.url;
            return track;
        });
    }).reduce((a, b) => a.concat(b), []);
}

function saveInfo(playlists, tracks) {
    // filename should be playlists-${argv.start}-${argv.end}.json or tracks-${argv.start}-${argv.end}.csv/json
    const playlistsFile = `${outputLocation}playlists-${argv.start}-${argv.end}.json`;
    const playlistsData = JSON.stringify(playlists);

    const tracksFile = `${outputLocation}tracks-${argv.tracks}-${argv.start}-${argv.end}.${argv.format}`;

    let tracksData = JSON.stringify(tracks);
    if (argv.format === 'csv') {
        const fields = ['artist', 'title', 'album', 'label', 'new', 'local', 'show', 'url'];
        tracksData = csvStringify(tracks, { columns: fields, header: true }, function(err, csv) {
            if (err) throw err;
            else {
                fs.writeFile(tracksFile, csv, function(err) {
                    if (err) throw err;
                    console.log(`${log_text.success} Tracks file saved to ${tracksFile}`);
                });
            }
        });
    } else {
        fs.writeFile(tracksFile, tracksData, function(err) {
            if (err) throw err;
            console.log(`${log_text.success} Tracks file saved to ${tracksFile}`);
        });
    }

    fs.writeFile(playlistsFile, playlistsData, function(err) {
        if (err) throw err;
        console.log(`${log_text.success} Playlists file saved to ${playlistsFile}`);
    });
}

function calculateCharts(tracks) {
    // get tracks together for charts
    if (argv.charts === 'new' || argv.charts === 'local') {
        tracks = tracks.filter(track => track[argv.charts].length > 0);
    }

    // save to json for use by charts.js process
    const filename = `${outputLocation}tracks-${argv.charts}-${argv.start}-${argv.end}.json`;
    fs.writeFile(filename, JSON.stringify(tracks), function(err) {
        if (err) throw err;
        console.log(`${log_text.success} Pre-chart JSON file saved to ${filename}. Starting charts.js process...`);
        startChartsApp(filename);
    });
}

function startChartsApp(filename) {
    // kick off child process to calculate charts
    const childProcess = require('child_process');
    const path = require('path');
    const cp = childProcess.fork(path.join(__dirname, 'charts.js'), ['--file', filename]);

    cp.on('exit', function (code, signal) {
        if (!code) console.log(`${log_text.success} Chart calculation app finished. (code: ${code}, signal: ${signal})\n`);
        else console.log(`${log_text.warning} Chart calculation app finished with possible errors. (code: ${code}, signal: ${signal})\n`);
    });
    cp.on('error', console.error.bind(console));
}
