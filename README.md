# playlist-scraper
Scrapes track information from wkdu.org playlists and optionally calculates music charts (i.e. play counts)

## Requirements

* [Node version](https://nodejs.org/en/) required: `>=v6.7.0`

## Scraper Usage

**Required arguments**: `start`, `end`

`start` and `end` refer to the first and last integer node IDs you want to scrape from wkdu.org (wkdu.org/playlist/*nodeID*)

**Optional arguments**: `tracks`, `format`, `charts`

* `tracks` (`all`, `local` or `new`, defaults to `all`) - Filter out tracks to those marked new or local only, or gather all tracks
* `format` (`csv` or `json`, defaults to `csv`) - Output file format for tracks data. Playlist data is always exported as a JSON file
* `charts` (`all`, `local`, `new` , or `none`, defaults to `none`) - Automatically runs charts app afterwards to calculate charts for new/local/all tracks

## Charts Usage

**Required arguments**: `file`

`file` refers to the filename for tracks collected by the scraper app.

**Optional arguments**: `count`, `format`, `sort`

* `count` (`album`, `artist`, or `label`, defaults to `album`) - Counts total number of plays by "artist" or by album with "artist - album", or by record "label".
* `tracks` (`all`, `local`, or `new`, defaults to `all`) - 
* `format` (`csv`, `json`, or `txt`, defaults to `csv`) - Output file format
* `sort` (`atoz` or `count`, defaults to `count`) - Sort output ascending alphabetically (`atoz`) or descending numerically (`count`)

**Note**: Chart calculation is not case-sensitive but it does not account for spelling and grammatical mistakes in track information.

## BMI Report Usage

Exports a .CSV file containing fields required for the annual BMI College Radio Report ('Date Played', 'Time Played', 'Song Title', 'Artist Name', 'Composer Name')

'Show Name' and 'Show URL' are added to the end of each track for convenience to validate potential playlist timing issues. (the columns should be deleted before an official BMI report submission)

**Required arguments**: `start`, `end`

`start` and `end` refer to the first and last integer node IDs you want to scrape from wkdu.org (wkdu.org/playlist/*nodeID*)

## Installation

```bash
# clone repo / download zip
git clone https://github.com/wkdu/playlist-scraper.git
cd playlist-scraper

# install dependencies
npm install

# run scraper app (replace x and y with your start/end node IDs, format is optional)
node scraper --start x --end y --format csv

# run scraper app and calculate new music charts
node scraper --start x --end y --charts new

# run charting calculation app as a standalone without having to run the scraper again
# (replace filename with the playlist-tracks file you get from running app.js, make sure file is relative to charts.js)
node charts --file data/filename

```

All output files are saved to the `data/` directory by default.

## Example Output

See [data/examples folder](data/examples) for raw files and additional output examples.

Example output below is gathered from node IDs 47420 to 47447 (Sunday 11/12/2017 to Saturday 11/18/2017)

### New charts for week of 11/12/2017

Raw files are located at [data/examples/local](data/examples/local).

#### Albums sorted numerically (by count)

```
$ node scraper --start 47420 --end 47447 --charts new

INFO: Playlist #47421 added with 25 tracks. (Talk of the Town on Sun 11/12/17)
INFO: Playlist #47420 added with 8 tracks. (1100ccs of Hate covered by yoni191 on Sun 11/12/17)
INFO: Playlist #47423 added with 30 tracks. (Dial Error on Mon 11/13/17)
INFO: Playlist #47424 added with 31 tracks. (Gallimaufry on Mon 11/13/17)
INFO: Playlist #47426 added with 34 tracks. (Open air on Tue 11/14/17)
INFO: Playlist #47425 added with 19 tracks. (Open air on Mon 11/13/17)
INFO: Playlist #47422 added with 14 tracks. (Independent Clause on Mon 11/13/17)
WARNING: Playlist #47427 did not exist or was empty. Skipping...
INFO: Playlist #47428 added with 24 tracks. (Flaming Arrow on Tue 11/14/17)
WARNING: Playlist #47430 did not exist or was empty. Skipping...
INFO: Playlist #47429 added with 28 tracks. (Double Hockey Sticks on Tue 11/14/17)
INFO: Playlist #47432 added with 23 tracks. (Idle Noise on Wed 11/15/17)
WARNING: Playlist #47431 did not exist or was empty. Skipping...
WARNING: Playlist #47434 did not exist or was empty. Skipping...
INFO: Playlist #47433 added with 27 tracks. (Bleeder Radio on Wed 11/15/17)
WARNING: Playlist #47435 did not exist or was empty. Skipping...
INFO: Playlist #47437 added with 29 tracks. (Your Brain On Ska on Wed 11/15/17)
INFO: Playlist #47436 added with 23 tracks. (Snack Time on Wed 11/15/17)
INFO: Playlist #47440 added with 23 tracks. (Music Against the Patriarchy on Thu 11/16/17)
INFO: Playlist #47438 added with 25 tracks. (Clangour on Wed 11/15/17)
INFO: Playlist #47439 added with 27 tracks. (Off The Deep End on Wed 11/15/17)
WARNING: Playlist #47441 did not exist or was empty. Skipping...
INFO: Playlist #47442 added with 22 tracks. (Aging Anarchist's Radio Program on Thu 11/16/17)
WARNING: Playlist #47444 did not exist or was empty. Skipping...
INFO: Playlist #47443 added with 21 tracks. (Dr. Plotkin's Majikal Evening X-Perience on Thu 11/16/17)
WARNING: Playlist #47445 did not exist or was empty. Skipping...
INFO: Playlist #47446 added with 16 tracks. (Electric Zoo on Fri 11/17/17)
INFO: Playlist #47447 added with 18 tracks. (Malthusian Blues on Sat 11/18/17)
INFO: 20 playlists have been successfully scraped.
SUCCESS: Tracks file saved to data/tracks-all-47420-47447.csv
SUCCESS: Playlists file saved to data/playlists-47420-47447.json
SUCCESS: Pre-chart JSON file saved to data/tracks-new-47420-47447.json. Starting charts.js process...
SUCCESS: Charts file saved to data/charts-album_sort-count.csv
RESULTS: Charts tabulations for 'album' completed. 

    album   count
    Protomartyr - Relatives In Descent  3
    Com Truise - Iteration  2
    Red Martian - Retrailing    2
    Washed Out - Mister Mellow  2
    Dead Cross - Dead Cross 2
    Exhumed - Death Revenge 2
    Dan Blacksberg - Radiant Others 2
    Shilpa Ray - Door Girl  2
    Headroom - Head In the Clouds   2
    ORB - Naturality    2
    Duds - OF A NATURE OR DEGREE    1
    Writhing Squares Too - 7''  1
    JD McPherson - UNDIVIDED HEART & SOUL   1
    Melkbelly - NOTHING VALLEY  1
    Antisocialites - Alvvays    1
    Fujiya + Miyagi - Fujiya + Miyagi   1
    Kaitlyn Aurelia Smith - The Kid 1
    Richard Walters - The Animal    1
    Hothead - Summer Single Series 2017 1
    Cut Copy - Haiku From Zero  1
    Alvvays - Antisocialites    1
    Wild Cub - Closer   1
    Jim-E Stack - It's Jim-Ee   1
    Chassol - Big Sun   1
    Dj Flugvel Og Geimskip - Made in Iceland Vol. 8 1
    Sudo Williams - Me You & Them   1
    Maximo Park - Risk to Exist (Deluxe)    1
    St. Vincent - Masseduction  1
    The National - Sleep Well Beast 1
    Power Trip - Nightmare Logic    1
    Bully - Losing  1
    Ghoul - Dungeon Bastards    1
    Code Orange - Forever   1
    Necrot - Blood Offerings    1
    OMNI - Multitask    1
    Hothead - 7''   1
    Jack Cooper - Sandgrown 1
    Church Girls - HIDALGO  1
    Birds - EVERYTHING ALL AT ONCE  1
    Taiwan Housing Project - Veblen Death Mask  1
    Myrkur - Mareidt    1
    Primitive Man - Caustic 1
    Incantation - Profane Nexus 1
    Brief Candles - Retreater   1
    The Pineapples - 7''    1
    Oh Sees - Orc   1
    Chad VanGaalen - Light Information  1
    Ariel Pink - Dedicated to Bobby Jameson 1
    L.A. Witch - L.A. Witch 1
    Buffalo Killers - Alive and Well in Ohio    1
    Emptyset - Skin 1
    Cults - Offering    1
    Pauline Anna Strom - Trans-Millenia Music   1
    Cobra Family Picnic - Magnetic Anomaly  1
    Moonchild - Voyager 1
    Khan Tengri - KT2   1
    Good NightOwl - Psycle  1
    KMFDM - Hell Yeah   1
    Haikus - Onigiri    1
    Dirty Fences - Goodbye Love 1
    Au.Ra - Cultivations    1
    Angelo De Augustine - Swim Inside the Moon  1
    Beliefs - Habitat   1
    Cymbals - Light In Your Mind    1
    Tracy Bryant - A Place for Nothing and Everything in Its Place  1
    The Kickbacks - Weddings and Funerals   1
    Grooms - Exit Index 1
    A Giant Dog - Toy   1
    Phono Pony - Death by Blowfish  1
    Otis the Destroyer - Keep Bashing   1
    Maximo Park - Risk to Exist 1
    David Nance Band - summer single series 2017    1
    Metz - Strange Peace    1
    Destroyer - ken 1
    Glazer - On a Prairie Live in the Dirt  1
    Everyone's Dirty - My Neon's Dead   1
    Omni - Multi-Task   1
    Lee Ranaldo - Electric Trim 1

SUCCESS: Chart calculation app finished. (code: 0, signal: null)

```

#### Albums sorted alphabetically (by atoz)

```
$ node charts --file data/examples/new/tracks-new-47420-47447.json  --count album --sort atoz

SUCCESS: Charts file saved to data/examples/new/charts-album_sort-count.csv
RESULTS: Charts tabulations for 'album' completed. 

    album   count
    A Giant Dog - Toy   1
    Alvvays - Antisocialites    1
    Angelo De Augustine - Swim Inside the Moon  1
    Antisocialites - Alvvays    1
    Ariel Pink - Dedicated to Bobby Jameson 1
    Au.Ra - Cultivations    1
    Beliefs - Habitat   1
    Birds - EVERYTHING ALL AT ONCE  1
    Brief Candles - Retreater   1
    Buffalo Killers - Alive and Well in Ohio    1
    Bully - Losing  1
    Chad VanGaalen - Light Information  1
    Chassol - Big Sun   1
    Church Girls - HIDALGO  1
    Cobra Family Picnic - Magnetic Anomaly  1
    Code Orange - Forever   1
    Com Truise - Iteration  2
    Cults - Offering    1
    Cut Copy - Haiku From Zero  1
    Cymbals - Light In Your Mind    1
    Dan Blacksberg - Radiant Others 2
    David Nance Band - summer single series 2017    1
    Dead Cross - Dead Cross 2
    Destroyer - ken 1
    Dirty Fences - Goodbye Love 1
    Dj Flugvel Og Geimskip - Made in Iceland Vol. 8 1
    Duds - OF A NATURE OR DEGREE    1
    Emptyset - Skin 1
    Everyone's Dirty - My Neon's Dead   1
    Exhumed - Death Revenge 2
    Fujiya + Miyagi - Fujiya + Miyagi   1
    Ghoul - Dungeon Bastards    1
    Glazer - On a Prairie Live in the Dirt  1
    Good NightOwl - Psycle  1
    Grooms - Exit Index 1
    Haikus - Onigiri    1
    Headroom - Head In the Clouds   2
    Hothead - 7''   1
    Hothead - Summer Single Series 2017 1
    Incantation - Profane Nexus 1
    Jack Cooper - Sandgrown 1
    JD McPherson - UNDIVIDED HEART & SOUL   1
    Jim-E Stack - It's Jim-Ee   1
    Kaitlyn Aurelia Smith - The Kid 1
    Khan Tengri - KT2   1
    KMFDM - Hell Yeah   1
    L.A. Witch - L.A. Witch 1
    Lee Ranaldo - Electric Trim 1
    Maximo Park - Risk to Exist 1
    Maximo Park - Risk to Exist (Deluxe)    1
    Melkbelly - NOTHING VALLEY  1
    Metz - Strange Peace    1
    Moonchild - Voyager 1
    Myrkur - Mareidt    1
    Necrot - Blood Offerings    1
    Oh Sees - Orc   1
    Omni - Multi-Task   1
    OMNI - Multitask    1
    ORB - Naturality    2
    Otis the Destroyer - Keep Bashing   1
    Pauline Anna Strom - Trans-Millenia Music   1
    Phono Pony - Death by Blowfish  1
    Power Trip - Nightmare Logic    1
    Primitive Man - Caustic 1
    Protomartyr - Relatives In Descent  3
    Red Martian - Retrailing    2
    Richard Walters - The Animal    1
    Shilpa Ray - Door Girl  2
    St. Vincent - Masseduction  1
    Sudo Williams - Me You & Them   1
    Taiwan Housing Project - Veblen Death Mask  1
    The Kickbacks - Weddings and Funerals   1
    The National - Sleep Well Beast 1
    The Pineapples - 7''    1
    Tracy Bryant - A Place for Nothing and Everything in Its Place  1
    Washed Out - Mister Mellow  2
    Wild Cub - Closer   1
    Writhing Squares Too - 7''  1

```

### BMI Report for 11/12/17 to 11/14/17

```
$ node bmi-report --start 47420 --end 47429

INFO: Playlist #47420 added with 8 tracks. (1100ccs of Hate)
INFO: Playlist #47421 added with 25 tracks. (Talk of the Town)
INFO: Playlist #47422 added with 14 tracks. (Independent Clause)
INFO: Playlist #47423 added with 30 tracks. (Dial Error)
INFO: Playlist #47424 added with 31 tracks. (Gallimaufry)
WARNING: "Open air" has no pre-scheduled time, need to check playlist times manually.
INFO: Playlist #47425 added with 19 tracks. (Open air)
WARNING: Playlist #47427 did not exist or was empty. Skipping...
WARNING: "Open air" has no pre-scheduled time, need to check playlist times manually.
INFO: Playlist #47426 added with 34 tracks. (Open air)
INFO: Playlist #47428 added with 24 tracks. (Flaming Arrow)
INFO: Playlist #47429 added with 28 tracks. (Double Hockey Sticks)
INFO: 9 playlists have been successfully scraped.
SUCCESS: Tracks file saved to data/bmi-report-47420-47429.csv

```

Raw file: [data/examples/bmi-report-47420-47429.csv](data/examples/bmi-report-47420-47429.csv)
