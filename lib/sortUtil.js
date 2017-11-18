// sort descending numerically (5, 4, 3..)
const Counts = function() {
    return function(a, b) {
        if (a.count && b.count) return b.count - a.count;
        else return 0;
    }
}

// sort ascending alphabetically (a, b, c...)
const AtoZ = function(key) {
    return function(a, b) {
        if (a[key] && b[key]) {
            let nameA = a[key].toUpperCase();
            let nameB = b[key].toUpperCase();
    
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        } else return 0;
    }
}

module.exports = { Counts, AtoZ };
