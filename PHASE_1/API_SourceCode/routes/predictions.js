"use strict";

const {
    findNull,
    findNotString,
    timeFormatCorrect,
    parseInteger,
    performError,
    createLog,
    getDiseaseSymptoms,
    formatDate
} = require("../util");

exports.predictions = async (req, res, conn) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const nullValue = findNull(req.query, [
        "min_report_count", "day_count",
    ]);
    if (nullValue) {
        return performError(conn, res, "/predictions", 400,
            `Missing parameter ${nullValue}`,
            req.query, ip);
    }

    const min_report_count = parseInteger(req.query.min_report_count);
    if (min_report_count === null) {
        return performError(conn, res, "/predictions", 400,
            "min_report_count must be an integer",
            req.query, ip);
    }

    const day_count = parseInteger(req.query.day_count);
    if (day_count === null) {
        return performError(conn, res, "/predictions", 400,
            "day_count must be an integer",
            req.query, ip);
    }

    if (min_report_count <= 0) {
        return performError(conn, res, "/predictions", 400,
            "Parameter 'min_report_count' must be greater than 0.",
            req.query, ip
        );
    }
    if (day_count <= 0) {
        return performError(conn, res, "/predictions", 400,
            "Parameter 'day_count' must be greater than 0.",
            req.query, ip
        );
    }

    try {
        const result = await predictions(conn, min_report_count, day_count);
        createLog(conn, ip, "/predictions", req.query, 200, "success", req.query.team);
        res.send(result);
    } catch (error) {
        console.log(error);
        return performError(conn,
            res, "/predictions", 500,
            "An internal server error occurred. " + error,
            req.query,  ip
        );
    }
};

async function predictions(conn, minReportCount, dayCount) {
    let currDate = new Date();
    currDate.setDate(currDate.getDate() - dayCount);

    let results = await conn
        .select("*")
        .from("Report")
        .where("event_date", ">", formatDate(currDate))
        .orderBy(["disease_id", "location"]);

    // Put results into an object indexed by disease name
    let collatedResults = {};
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (!(result.disease_id in collatedResults)) {
            collatedResults[result.disease_id] = {
                disease: result.disease_id,
                reports: [],
            };
        }
        collatedResults[result.disease_id].reports.push({
            report_id: result.report_id,
            disease_id: result.disease_id,
            event_date: result.event_date,
            location: {
                location: result.location,
                lat: parseFloat(result.lat),
                long: parseFloat(result.long),
            },
        });
    }

    // Add the threshold into each item
    let returnRes = [];
    for (let key in collatedResults) {
        let item = collatedResults[key];
        if (item.reports.length > minReportCount) {
            item.report_count = item.reports.length;
            returnRes.push(item);
        }
    }
    return returnRes;
}
