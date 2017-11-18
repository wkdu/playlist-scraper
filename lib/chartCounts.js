const stringUtil = require('./stringUtil');

// takes count results and flattens with original capitalizations
function flattenOriginal(counts, key) {
    return Object.keys(counts).map(k => {
        const v = counts[k];
        const obj = {};
        obj[key] = v.original;
        obj.count = v.count;
        return obj;
    });
}

// format: artist: count
// output: { artist1: { original: Artist, count: int }, ... }
const countArtists = function(tracks) {
    const counts = tracks.reduce((allArtists, track) => {
        let escaped = stringUtil.escapeRaw(track.artist);
        let artistName = escaped.toLowerCase();
        
        if (artistName in allArtists) {
            allArtists[artistName].count++;
        } else {
            allArtists[artistName] = { original: escaped, count: 1 };
        }
        return allArtists;
    }, {});
    return flattenOriginal(counts, 'artist');
};

// format: artist - album: count
// pre-flatten: { artistalbum1: { original: ArtistAlbum1, count: int }, ... }
// post-flatten: 
const countArtistAlbums = function(tracks) {
    const counts = tracks.reduce((allAlbums, track) => {
        if (track.artist && track.album) {
            let artistAlbum = `${stringUtil.escapeRaw(track.artist)} - ${stringUtil.escapeRaw(track.album)}`;
            let artistAlbumLC = artistAlbum.toLowerCase();

            if (artistAlbumLC in allAlbums) {
                allAlbums[artistAlbumLC].count++;
            } else {
                allAlbums[artistAlbumLC] = { original: stringUtil.escapeRaw(artistAlbum), count: 1 };
            }
        }
        return allAlbums;
    }, {});
    return flattenOriginal(counts, 'album');
};

// format: label: count
// output: { label1: { original: Label1, count: int }, ... }
const countLabels = function(tracks) {
    const counts = tracks.reduce((allLabels, track) => {
        if (track.label) {
            let escaped = stringUtil.escapeRaw(track.label);
            let labelName = escaped.toLowerCase();
            
            if (labelName in allLabels) {
                allLabels[labelName].count++;
            } else {
                allLabels[labelName] = { original: escaped, count: 1 };
            }
        }
        return allLabels;
    }, {});
    return flattenOriginal(counts, 'label');
};

module.exports = { countArtists, countArtistAlbums, countLabels };
