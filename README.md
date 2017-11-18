# playlist-scraper
Scrapes track information from wkdu.org playlists and optionally calculates music charts (i.e. plays)

## Usage

Node version required: >=v6.7.0

Required arguments: `start`, `end`

`start` and `end` refer to the first and last integer node IDs you want to scrape from wkdu.org (wkdu.org/playlist/*nodeID*)

Optional arguments:

* `format` (`json` or `csv`, defaults to `csv`)
* `tracks` (`new`, `local`, or `all`, defaults to `all`)
* `charts` (`new`, `local`, `all`, or `none`, defaults to `none`) - Calculate charts for new/local/all tracks (not case-sensitive but does not account for spelling mistakes)

``` bash
# clone repo / download zip
git clone https://github.com/wkdu/playlist-scraper.git
cd playlist-scraper

# install dependencies
npm install

# run app (replace x and y with your start/end node IDs, format is optional)
node app.js --start x --end y --format csv

# run charting calculation app as a standalone without having to run the scraper again
# (replace filename with the playlist-tracks file you get from running app.js)
node charts.js --file filename

```
