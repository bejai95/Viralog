
/**
 * Check whether an object is missing any keys.
 * Used for parameter testing.
 * @param {*} obj The object with keys 'keys'
 * @param {string[]} keys The list of keys to check.
 * @returns The first key which does not exist or is null.
 */
exports.findNull = function (obj, keys) {
    // check if query parameters are null, or doesn't exist, returns the name
    // of the one which doesn't exist
    // If is all good, it returns null
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!(key in obj) || obj[key] === null) {
            return key;
        }
    }
    return null;
};

/**
 * Check whether an object has any values which are not a string.
 * Used for parameter testing.
 * @param {*} obj The object with keys 'keys'
 * @param {string[]} keys The list of keys to check.
 * @returns The first key whose value is not null and not a string.
 */
exports.findNotString = function (obj, keys) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if ((key in obj) && typeof obj[key] !== "string") {
            return key;
        }
    }
    return null;
};


exports.timeFormatCorrect = function (timestamp) {
    const timeFormat = /^\d{4}-[01]\d-[0-3]\dT[0-2][0-4]:[0-5]\d:[0-5]\d$/;
    return timeFormat.test(timestamp);
};

exports.parseInteger = function(strInt) {
    if (strInt === null) {
        console.log("is null");
        return null;
    }
    
    if (!/^-?[0-9]+$/.test(strInt)) {
        console.log("not match");
        return null;
    }

    const num = parseInt(strInt);
    if (isNaN(num) || !Number.isSafeInteger(num)) {
        console.log("NaN or unsafe");
        return null;
    }
    return num;
};
