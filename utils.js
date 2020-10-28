/**
 * Parse a string to extract digits and dots in floating point value
 * @param {String} str The string containing a decimal representation of the price
 * @returns {Number}
 */
const parsePrice = str => {
    try {
        return parseFloat(str.match(/\d|\./g).join(""));
    } catch (error) {
        return undefined;
    }
};


module.exports = {
    parsePrice,
}