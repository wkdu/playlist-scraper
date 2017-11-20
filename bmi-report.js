// BMI College Radio Report scraper for wkdu.org
//
//  Fields required for report -- 'Date Played', 'Time Played', 'Song Title', 'Artist Name', 'Composer Name'
//  Fields added for convenience to validate show times -- 'Show Name', 'Show URL' (columns to be deleted manually before BMI submission)
const colors = require('colors/safe');
const argv = require('minimist')(process.argv.slice(2));
const async = require('async');
const scrapeIt = require('scrape-it');
const moment = require('moment');
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

//tracks = all
//format = csv
//charts = none

const urls = [];
const playlists = [];

// parses text for MM/DD/YYY formatted string
// momentMDY - moment('Tue 11/14/17', 'ddd MM/DD/YY').format('MM/DD/YYYY') => 11/14/2017
const momentMDY = (b => moment(b, 'ddd MM/DD/YY').format('MM/DD/YYYY'));

// parses text for HH:mm:ss formatted string
// momentHMS - moment('12am', 'HHa').format('HH:mm:ss') => 00:00:00
const momentHMS = (a => moment(a, 'HHa').format('HH:mm:ss'));

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
            }
        },
        date: {
            selector: '.panel-col-first .blockpanel .pane-title a',
        },
        show: '.panel-col-last .blockpanel .pane-title a',
        schedule: {
            selector: '.panel-col-last .pane-content .station-schedule-times-heading',
            eq: 0
        },
        times: {
            selector: '.panel-col-last .pane-content .station-schedule-times .form-item',
            eq: 0,
            how: (node => {
                if (node.length > 0) return node[0].children[2].data; // show with current schedule time
                else return null; // 'open air' or invalid playlist
            })
        }
    }).then(playlist => {
        let nid = playlistUrl.substring(25); // 25 = "http://wkdu.org/playlist/".length

        // invalid or empty playlist 
        if (!playlist.show || playlist.tracks.length === 0) {
            console.log(`${log_text.warning} Playlist #${nid} did not exist or was empty. Skipping...`);
        } else {
            playlist.url = playlistUrl;

            // parse and format date text (example: "Open air on Tue 11/14/17" => "11/14/2017")
            playlist.date = momentMDY(playlist.date.substring(playlist.date.lastIndexOf('on')+3));

            // parse and format schedule times text (example: "Tuesday 4-6pm" => "16:00:00-18:00:00")
            if (playlist.show === 'Open air') {
                playlist.time = 'CHECK PROGRAM TIMES - OPEN AIR';
                console.log(`${log_text.warning} "Open air" has no pre-scheduled time, need to check playlist times manually.`);
            }
            else if (playlist.schedule !== 'Current schedule:') {
                playlist.time = 'CHECK PROGRAM TIMES - SHOW NOT CURRENTLY SCHEDULED';
                console.log(`${log_text.warning} Show "${playlist.show}" is not currently scheduled, need to check playlist times manually.`);
            }
            else {
                let [start, end] = playlist.times.substring(playlist.times.indexOf(' ')+1).split('-');

                // escape raw text in track info
                playlist.tracks.map(trk => {
                    return {
                        artist: stringUtil.escapeRaw(trk.artist),
                        title: stringUtil.escapeRaw(trk.title),
                    };
                });

                // program is on current schedule and has no listed show times (possible site bug?)
                if (!start || !end) {
                    playlist.time = 'CHECK PROGRAM TIMES - NO TIMES FOUND ON WEBSITE';
                    console.log(`${log_text.warning} No show times found for "${playlist.show}", need to check playlist times manually.`);
                    // console.log(`${log_text.error} Playlist #${nid}'s show is on the current schedule but no times are listed. Stopping program...`);
                    // process.exit();
                } else {
                    let meridiem = end.substr(-2); // get am/pm
                    if (start.indexOf('am') === -1 || start.indexOf('pm') === -1) start += meridiem; // add am/pm if not on string yet

                    playlist.time = `${momentHMS(start)}-${momentHMS(end)}`;
                }
            }
            delete playlist.times;

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
        saveInfo(tracks);
    }
});

// sort playlists by date, then gather tracks from all playlists into a single array
function gatherTracks() {
    // sort playlists by time ascending then date ascending ('check times' strings go to beginning of list)
    return playlists.sort((a, b) => {
        // sort by time ascending
        if (a.time.indexOf('CHECK') >= 0 && b.time.indexOf('CHECK') === -1) return -1;
        else if (b.time.indexOf('CHECK') >= 0 && a.time.indexOf('CHECK') === -1) return 1;
        else {
            if (a.time > b.time) return 1;
            if (a.time < b.time) return -1;
            return 0;
        }
    }).sort((a, b) => {
        // sort by date ascending
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
        return 0;
    }).map(plist => {
        return plist.tracks.map(track => {
            track.composer = '';
            track.date = plist.date;
            track.time = plist.time;
            track.show = plist.show;
            track.url = plist.url;
            return track;
        });
    }).reduce((a, b) => a.concat(b), []);
}

// fields = 'Date Played', 'Time Played', 'Song Title', 'Artist Name', 'Composer Name'
function saveInfo(tracks) {
    // filename should be tracks-${argv.start}-${argv.end}.csv/json
    const tracksFile = `${outputLocation}bmi-report-${argv.start}-${argv.end}.csv`;
    const fields = ['date', 'time', 'title', 'artist', 'composer', 'show', 'url'];

    csvStringify(tracks, { columns: fields, header: true }, function(err, csv) {
        if (err) throw err;
        else {
            fs.writeFile(tracksFile, csv, function(err) {
                if (err) throw err;
                console.log(`${log_text.success} Tracks file saved to ${tracksFile}`);
            });
        }
    });
}
