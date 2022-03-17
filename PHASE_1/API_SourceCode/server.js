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
        period_of_interest_start,
        period_of_interest_end,
        key_terms,
        location,
        sources,
    } = req.query;

    // Search query here, key_terms and sources may be empty
    // const articles = await _conn.select("*").from("article");

    const diseaseSymptoms = getDiseaseSymptoms(_conn);
    


    res.send(result);
    // res.send(articles);
});

async function getDiseaseSymptoms(conn) {
    const symptomRecords = await conn.select("Disease.disease_id", "symptom").from("Disease").innerJoin("Symptom", "Symptom.disease_id", "Disease.disease_id");
    const diseaseSymptoms = {};
    for (let i = 0; i < symptomRecords.length; i++) {
        const record = symptomRecords[i];
        diseaseSymptoms[record.disease_id] = record.symptom;
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

    var diseases = key_terms.split(",");
    var locations = location.split(",");
    console.log(locations);

    // Search query here, key_terms and sources may be empty
    const articles = await _conn.select("*").from("Report")
        .whereIn("disease_id", diseases)
        .whereIn("location", locations)
        .where('event_date', '>=', period_of_interest_start)
        .where('event_date', '<=', period_of_interest_end);

    console.log(articles);
    res.send(articles);
});

app.get("/predictions", async (req, res) => {
    let threshold = req.query.threshold || 0;

    let articles = [];

    res.send(articles);
});

app.get("/admin/reset", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());

    try {
        schema.resetSchema(_conn);
        res.send({ status: "success" });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

async function createLog(reqParams, status, errMsg) {
    const time = (new Date().toISOString());
    // yyyy-MM-ddTHH:mm:ss

}

const PORT = parseInt(process.env.PORT) || 8080;
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Press Ctrl+C to quit.");
});

module.exports = server;
