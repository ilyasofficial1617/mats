/**
 * Convert a JavaScript object (dictionary) to a JSON string.
 * @param {Object} obj - The object to convert.
 * @returns {string} - The JSON string representation of the object.
 */
function dictToString(obj) {
    return JSON.stringify(obj);
}

/**
 * Convert a JSON string to a JavaScript object (dictionary).
 * @param {string} str - The JSON string to convert.
 * @returns {Object} - The JavaScript object representation of the string.
 */
function stringToDict(str) {
    return JSON.parse(str);
}

function setGlobal(name, dictinput){
    str_dictinput = dictToString(dictinput);
    GlobalVars.putString(name,str_dictinput);
}
function getGlobal(name){
    str_dictoutput = GlobalVars.getString(name);
    return(stringToDict(str_dictoutput));
}

module.exports = {setGlobal, getGlobal};