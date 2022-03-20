// check if query parameters are null, or doesn't exist, returns the name
// of the one which doesn't exist
// If is all good, it returns null
exports.findNull = function (obj, keys) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!(key in obj) || obj[key] == null) {
            return key;
        }
    }
    return null;
}


exports.findNotString = function (obj, keys) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if ((key in obj) && typeof obj[key] !== "string") {
            return key;
        }
    }
    return null;
}


exports.timeFormatCorrect = function (timestamp) {
    const timeFormat = /^\d{4}-[01]\d-[0-3]\dT[0-2][0-4]:[0-5]\d:[0-5]\d$/;
    return timeFormat.test(timestamp);
}