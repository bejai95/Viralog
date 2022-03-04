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
    const articles = await _conn.select("*").from("article");

    res.send(articles);
});

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
        period_of_interest_start,
        period_of_interest_end,
        key_terms,
        location,
        sources,
        diseases,
    } = req.query;

    // Search query here, key_terms and sources may be empty
    const articles = await _conn.select("*").from("report");

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
        await _conn.schema.dropTableIfExists("article");
        await _conn.schema.createTable("article", (table) => {
            table.string("url").primary();
            table.string("headline").notNullable();
            table.string("main_text").notNullable();
            table.string("category");
            table.string("source");
            table.string("author").notNullable();
            table.string("date_of_publication").notNullable();
        });

        await _conn.schema.dropTableIfExists("report");
        await _conn.schema.createTable("report", (table) => {
            table.string("id").primary();
            table.date("event_date").notNullable();
            table.string("syndrome").notNullable();
            table.string("disease").notNullable();
            table.string("url").references("url").inTable("article");
            table.string("country").notNullable();
            table.string("city");
        });
        res.send({ status: "success" });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

const PORT = parseInt(process.env.PORT) || 8080;
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Press Ctrl+C to quit.");
});

module.exports = server;
