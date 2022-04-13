"use strict";

const {
    findNull,
    findNotString,
    timeFormatCorrect,
    parseInteger,
    performError,
    createLog,
    getDiseaseSymptoms
} = require("../util");

exports.reports = async (req, res, conn) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!req.query) {
        return res.status(400).send({
            status: 400,
            message: "Missing query parameters"
        });
    }
    const nullValue = findNull(req.query, [
        "period_of_interest_start", "period_of_interest_end",
        "key_terms", "location"
    ]);
    if (nullValue) {
        return performError(conn, res, "/reports", 400,
            `Missing parameter ${nullValue}`,
            req.query,
            ip
        );
    }

    const notString = findNotString(req.query, [
        "period_of_interest_start", "period_of_interest_end",
        "key_terms", "location", "sources"
    ]);
    if (notString) {
        return performError(conn,
            res, "/reports", 400,
            `${notString} must be a string`,
            req.query, ip
        );
    }

    if (req.query.period_of_interest_start &&
        !timeFormatCorrect(req.query.period_of_interest_start))
    {
        return performError(conn, res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_start', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }
    if (req.query.period_of_interest_end &&
        !timeFormatCorrect(req.query.period_of_interest_end))
    {
        return performError(conn, res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }

    try {
        const results = await reports(
            conn,
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            req.query.key_terms,
            req.query.location
        );
        createLog(conn, ip, "/reports", req.query, 200, "success", req.query.team);
        return res.send(results);
    } catch (error) {
        console.log(error);
        return performError(conn, res, "/reports", 500,
            "An internal server error occurred. " + error,
            req.query, ip
        );
    }
};

exports.reportsId = async (req, res, conn) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    try {
        const results = await reportsId(conn, req.params.id);
        createLog(conn, ip, "/reports/" + req.params.id, req.query, 200, "success");
        res.send(results);
    } catch (error) {
        console.log(error);
        return performError(conn, res, "/reports/" + req.params.id, 500,
            "An internal server error occurred. " + error,
            req.params.id, ip
        );
    }

};

async function reportsId(conn, report_id) {
    const reports = await conn
        .select(
            "Report.report_id",
            "Report.disease_id",
            "Disease.name as disease",
            "Report.event_date as date",
            "Report.location",
            "Report.lat",
            "Report.long"
        )
        .from("Report")
        .where("Report.report_id", "=", report_id)
        .join("Disease", "Report.disease_id", "=", "Disease.disease_id");

    if (reports.length == 0) {
        console.log("Error: disease_id not found.");
    }

    const symptoms = await getDiseaseSymptoms(conn);

    let result = reports[0];
    result["symptoms"] = symptoms[result.disease];

    return result;
}

async function reports(
    conn,
    period_of_interest_start,
    period_of_interest_end,
    key_terms,
    location
) {
    // Search query here, key_terms and sources may be empty
    const reportRecords = await conn
        .select(
            "Report.report_id",
            "Report.disease_id",
            "Disease.name as disease",
            "Report.event_date as date",
            "Report.location",
            "Report.lat",
            "Report.long",
            "Report.article_id",
            "Article.article_url",
            "Article.headline",
            "Article.source"
        )
        .from("Report")
        .modify((queryBuilder) => {
            if (key_terms && key_terms != "") {
                const diseases = key_terms.split(",");
                queryBuilder.whereIn("Report.disease_id", diseases);
            }
        })
        .modify((queryBuilder) => {
            if (location && location != "") {
                const locations = location.split(",");
                queryBuilder.whereIn("location", locations);
            }
        })
        .where("Report.event_date", ">=", period_of_interest_start)
        .where("Report.event_date", "<=", period_of_interest_end)
        .join("Disease", "Report.disease_id", "=", "Disease.disease_id")
        .join("Article", "Article.article_id", "=", "Report.article_id")
        .orderBy("Report.event_date", "desc");

    const symptoms = await getDiseaseSymptoms(conn);

    const results = [];
    for (let i = 0; i < reportRecords.length; i++) {
        const reportRecord = reportRecords[i];
        results.push({
            report_id: reportRecord.report_id,
            disease_id: reportRecord.disease_id,
            diseases: [reportRecord.disease],
            syndromes: symptoms[reportRecord.disease_id],
            event_date: reportRecord.date,
            location: {
                location: reportRecord.location,
                lat: parseFloat(reportRecord.lat),
                long: parseFloat(reportRecord.long),
            },
            article_id: reportRecord.article_id,
            article_url: reportRecord.article_url,
            headline: reportRecord.headline,
            source: reportRecord.source
        });
    }

    return results;
}
