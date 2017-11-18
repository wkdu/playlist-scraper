
// replaces double quotes with 2 single quotes
const escapeQuotes = function(str) {
    return (str.indexOf('"') >= 0) ? str.replace(/"/g, '\'\'') : str;
}

// replaces commas with ampersands
const escapeCommas = function(str) {
    return (str.indexOf(',') >= 0) ? str.replace(/,/g, '&') : str;
}

// replaces double quotes, commas, and anything else
const escapeRaw = function(raw) {
    return escapeQuotes(escapeCommas(String(raw)));
}

const escapeString = function(str) {
    return escapeQuotes(escapeCommas(str));
}

module.exports = { escapeString, escapeRaw };