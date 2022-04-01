"use strict";

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
    const timeFormat = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d$/;
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

exports.formatDate = function(date) {
    return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
};

exports.getDiseaseSymptoms = async function (conn) {
    const symptomRecords = await conn
        .select("Disease.disease_id", "symptom")
        .from("Disease")
        .innerJoin("Symptom", "Symptom.disease_id", "Disease.disease_id");
    const diseaseSymptoms = {};
    for (let i = 0; i < symptomRecords.length; i++) {
        const record = symptomRecords[i];
        if (diseaseSymptoms[record.disease_id] == null) {
            diseaseSymptoms[record.disease_id] = [];
        }

        diseaseSymptoms[record.disease_id].push(record.symptom);
    }
    return diseaseSymptoms;
};

exports.performError = function(conn, res, route, status, message, query, ip) {
    createLog(conn, ip, route, query, status, message, query.team);
    return res.status(400).send({ status: status, message: message });
};

async function createLog(conn, ip, route, queryParams, status, message) {
    let timestamp = new Date().toISOString();
    timestamp = timestamp.replace(/\.[0-9]{3}Z$/, "");

    await conn("Log").insert({
        status: status,
        route: route,
        req_params: JSON.stringify(queryParams),
        timestamp: timestamp,
        message: message,
        ip: ip,
        team: queryParams.team || "Team QQ",
    });
}

exports.createLog = createLog;
