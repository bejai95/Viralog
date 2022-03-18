"use strict";

// Require process, so we can mock environment variables.
const process = require("process");
const express = require("express");
const db = require("./database");

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
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    let {
        period_of_interest_start,
        period_of_interest_end,
        key_terms,
        location,
    } = req.query;

    if (!req.query) {
        const message = "Missing query parameters";
        createLog(_conn, ip, "/articles", req.query, 400, message);
        return res.status(400).send({ message: message });
    }
    if (!req.query.period_of_interest_start) {
        const message = "Missing parameter period_of_interest_start";
        createLog(_conn, ip, "/articles", req.query, 400, message);
        return res.status(400).send({ message: message });
    }
    if (!req.query.period_of_interest_end) {
        const message = "Missing parameter period_of_interest_end";
        createLog(_conn, ip, "/articles", req.query, 400, message);
        return res.status(400).send({ message: message });
    }
    
    if (typeof req.query.key_terms !== "string") {
        const message = "key_terms must be a string";
        createLog(_conn, ip, "/articles", req.query, 400, message);
        return res.status(400).send({ message: message });
    }

    // /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/

    let diseases = key_terms.split(",");

    const articles = await _conn.select("Article.article_url", "Article.date_of_publication", "Article.headline", "Article.main_text").from("Article")
        .where("date_of_publication", ">=", period_of_interest_start)
        .where("date_of_publication", "<=", period_of_interest_end)
        .innerJoin("Report", "Report.article_url", "=", "Article.article_url")
        .whereIn("Report.disease_id", diseases);
    const results = [];

    const symptoms = await getDiseaseSymptoms(_conn);

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const reportsResult = [];
        
        const reportRecords = await _conn.select("Report.disease_id", "Disease.name as disease", "Report.event_date as date", "Report.location").from("Report")
            .where("Report.article_url", "=", article.article_url)
            .modify(queryBuilder => {
                if (location && location != "") {
                    const locations = location.split(",");
                    queryBuilder.whereIn("location", locations);
                }
            })
            .join("Disease", "Report.disease_id", "=", "Disease.disease_id");

        for (let i = 0; i < reportRecords.length; i++) {
            const reportRecord = reportRecords[i];
            reportsResult.push({
                diseases: [reportRecord.disease],
                syndromes: symptoms[reportRecord.disease_id],
                event_date: reportRecord.date,
                location: reportRecord.location
            });
        }
        
        // Only show article if it has 1 or more reports.
        if (reportRecords.length > 0) {
            results.push({
                url: article.article_url,
                date_of_publication: article.date_of_publication,
                headline: article.headline,
                main_text: article.main_text,
                reports: reportsResult
            });
        }
    }

    createLog(_conn, ip, "/articles", req.query, 200, "success");
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
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    let {
        period_of_interest_start,
        period_of_interest_end,
        key_terms,
        location,
        sources
    } = req.query;

    if (!req.query)
        return res.status(400).send({ message: "Missing query parameters" });
    if (!req.query.period_of_interest_start) {
        return res
            .status(400)
            .send({ message: "Missing parameter period_of_interest_start" });
    }
    if (!req.query.period_of_interest_end) {
        return res
            .status(400)
            .send({ message: "Missing parameter period_of_interest_end" });
    }
    
    if (typeof req.query.key_terms !== "string") {
        return res.status(400).send({ message: "key_terms must be a string" });
    }
    if (typeof req.query.location !== "string") {
        return res.status(400).send({ message: "location must be a string" });
    }

    // Search query here, key_terms and sources may be empty
    const reportRecords = await _conn.select("Report.disease_id", "Disease.name as disease", "Report.event_date as date", "Report.location").from("Report")
        .modify(queryBuilder => {
            if (key_terms && key_terms != "") {
                const diseases = key_terms.split(",");
                queryBuilder.whereIn("Report.disease_id", diseases);
            }
        })
        .modify(queryBuilder => {
            if (location && location != "") {
                const locations = location.split(",");
                queryBuilder.whereIn("location", locations);
            }
        })
        .where("Report.event_date", ">=", period_of_interest_start)
        .where("Report.event_date", "<=", period_of_interest_end)
        .join("Disease", "Report.disease_id", "=", "Disease.disease_id");

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

    createLog(_conn, ip, "/reports", req.query, 200, "success");
    res.send(results);
});

app.get("/predictions", async (req, res) => {
    let threshold = req.query.threshold || 0;

    // dummy data - todo
    let articles = [{disease: "COVID-19",
	             syndromes: ["fever", "cough", "fatigue", "shortness of breath", "vomiting", "loss of taste", "loss of smell"],
                     reports: [
			       [{
			         "diseases": [
		                      "COVID-19"
				 ],
			     "syndromes":[
			     "fever",
			     "cough",
			     "fatigue",
			     "shortness of breath",
			     "vomiting",
			     "loss of taste",
			     "loss of smell"
			     ],
			     "event_date":"2022-03-14T13:00:00",
			     "location":"China"
				     }]],
	    	       threshold: 0.92}];
    
    res.send(articles);
});

app.get("/logs", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const logs = await _conn.select("*").from("Log");

    createLog(_conn, ip, "/logs", {}, 200, "success");
    res.send(logs);
});

app.get("/predictions", async (req, res) => {
    let threshold = req.query.threshold || 0;

    let articles = [];

    res.send(articles);
});

async function createLog(conn, ip, route, reqParams, status, message) {
    let timestamp = (new Date().toISOString());
    timestamp = timestamp.replace(/\.[0-9]{3}Z$/, "");

    await conn("Log").insert({
        status: status,
        route: route,
        req_params: JSON.stringify(reqParams),
        timestamp: timestamp,
        message: message,
        ip: ip
    });
}

const PORT = parseInt(process.env.PORT) || 8080;
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Press Ctrl+C to quit.");
});

module.exports = server;
