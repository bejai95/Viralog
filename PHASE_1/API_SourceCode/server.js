"use strict";

// Require process, so we can mock environment variables.
const process = require("process");
const express = require("express");
const db = require("./database");
const schema = require("./schema");

const app = express();
app.enable("trust proxy");

// Automatically parse request body as form data.
app.use(express.urlencoded({ extended: false }));
// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

// Set Content-Type for all responses for these routes.
app.use((req, res, next) => {
    res.set("Content-Type", "application/json");
    next();
});

// Create a Winston logger that streams to Stackdriver Logging.
const winston = require("winston");
const { LoggingWinston } = require("@google-cloud/logging-winston");
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
    level: "info",
    transports: [new winston.transports.Console(), loggingWinston],
});

let _conn;

app.use(async (req, res, next) => {
    if (_conn) {
        return next();
    }
    try {
        _conn = await db.createConnectionPool();
        next();
    } catch (err) {
        logger.error(err);
        return next(err);
    }
});

app.get("/articles", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());

    if (!req.query)
        return res.status(400).send({ message: "Missing query parameters" });
    if (!req.query.period_of_interest_start)
        return res
            .status(400)
            .send({ message: "Missing parameter period_of_interest_start" });
    if (!req.query.period_of_interest_end)
        return res
            .status(400)
            .send({ message: "Missing parameter period_of_interest_end" });
    if (!req.query.location)
        return res.status(400).send({ message: "Missing parameter location" });

    let {
        period_of_interest_start = req.params.period_of_interest_start,
        period_of_interest_end = req.params.period_of_interest_end,
        key_terms = req.params.key_terms,
        location = req.params.location,
    } = req.query;

    let diseases = key_terms.split(",");
    let locations = location.split(",");

    const articles = await _conn.select("Article.article_url", "Article.date_of_publication", "Article.headline", "Article.main_text").from("Article")
        .where('date_of_publication', '>=', period_of_interest_start)
        .where('date_of_publication', '<=', period_of_interest_end);
    const results = [];

    const symptoms = await getDiseaseSymptoms(_conn);

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const reportsResult = [];
        
        const reportRecords = await _conn.select("Report.disease_id", "Disease.name as disease", "Report.event_date as date", "Report.location").from("Report")
            .where("Report.article_url", "=", article.article_url)
            .whereIn("Report.disease_id", diseases)
            .whereIn("location", locations)
            .join('Disease', 'Report.disease_id', '=', 'Disease.disease_id');

        for (let i = 0; i < reportRecords.length; i++) {
            const reportRecord = reportRecords[i];
            reportsResult.push({
                diseases: [reportRecord.disease],
                syndromes: symptoms[reportRecord.disease_id],
                event_date: reportRecord.date,
                location: reportRecord.location
            });
        }

        results.push({
            url: article.article_url,
            date_of_publication: article.date_of_publication,
            headline: article.headline,
            main_text: article.main_text,
            reports: reportsResult
        });
    }

    res.send(results);
});

async function getDiseaseSymptoms(conn) {
    const symptomRecords = await conn.select("Disease.disease_id", "symptom").from("Disease").innerJoin("Symptom", "Symptom.disease_id", "Disease.disease_id");
    const diseaseSymptoms = {};
    for (let i = 0; i < symptomRecords.length; i++) {
        const record = symptomRecords[i];
        if (diseaseSymptoms[record.disease_id] == null) {
            diseaseSymptoms[record.disease_id] = [];
        }

        diseaseSymptoms[record.disease_id].push(record.symptom);
    }
    return diseaseSymptoms;
}

app.get("/reports", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());

    if (!req.query)
        return res.status(400).send({ message: "Missing query parameters" });
    if (!req.query.period_of_interest_start)
        return res
            .status(400)
            .send({ message: "Missing parameter period_of_interest_start" });
    if (!req.query.period_of_interest_end)
        return res
            .status(400)
            .send({ message: "Missing parameter period_of_interest_end" });
    if (!req.query.location)
        return res.status(400).send({ message: "Missing parameter location" });

    let {
        period_of_interest_start = req.params.period_of_interest_start,
        period_of_interest_end = req.params.period_of_interest_end,
        key_terms = req.params.key_terms,
        location = req.params.location,
        sources = req.params.sources,
    } = req.query;

    let diseases = key_terms.split(",");
    let locations = location.split(",");

    // Search query here, key_terms and sources may be empty
    const reportRecords = await _conn.select("Report.disease_id", "Disease.name as disease", "Report.event_date as date", "Report.location").from("Report")
        .whereIn("Report.disease_id", diseases)
        .whereIn("location", locations)
        .where('Report.event_date', '>=', period_of_interest_start)
        .where('Report.event_date', '<=', period_of_interest_end)
        .join('Disease', 'Report.disease_id', '=', 'Disease.disease_id');

    const symptoms = await getDiseaseSymptoms(_conn);

    const results = [];
    for (let i = 0; i < reportRecords.length; i++) {
        const reportRecord = reportRecords[i];
        results.push({
            diseases: [reportRecord.disease],
            syndromes: symptoms[reportRecord.disease_id],
            event_date: reportRecord.date,
            location: reportRecord.location
        });
    }

    res.send(results);
});

app.get("/predictions", async (req, res) => {
    let threshold = req.query.threshold || 0;

    let articles = [];

    res.send(articles);
});

async function createLog(reqParams, status, errMsg) {
    let time = (new Date().toISOString());
    time = time.replace(/\.[0-9]{3}Z$/, "");
    // yyyy-MM-ddTHH:mm:ss

}

const PORT = parseInt(process.env.PORT) || 8080;
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Press Ctrl+C to quit.");
});

module.exports = server;
