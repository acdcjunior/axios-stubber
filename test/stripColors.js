module.exports = function stripColors(s) {
    return s.replace(/\x1b\[\d+m/g, '');
};