"use strict";

// Require process, so we can mock environment variables.
const process = require("process");
const express = require("express");
const db = require("./database");
const routes = require("./routes");

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

let _conn;

app.get("/articles", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!req.query) {
        const message = "Missing query parameters";
        createLog(_conn, ip, "/articles", req.query, 400, message);
        return res.status(400).send({ status: 400, message: message });
    }
    if (!req.query.period_of_interest_start) {
        const message = "Missing parameter period_of_interest_start";
        createLog(_conn, ip, "/articles", req.query, 400, message);
        return res.status(400).send({ status: 400, message: message });
    }
    if (!req.query.period_of_interest_end) {
        const message = "Missing parameter period_of_interest_end";
        createLog(_conn, ip, "/articles", req.query, 400, message);
        return res.status(400).send({ status: 400, message: message });
    }
    
    if (typeof req.query.key_terms !== "string") {
        const message = "key_terms must be a string";
        createLog(_conn, ip, "/articles", req.query, 400, message);
        return res.status(400).send({ status: 400, message: message });
    }

    // /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/

    try {
        const results = await routes.articles(_conn,
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            req.query.key_terms,
            req.query.location
        );

        createLog(_conn, ip, "/articles", req.query, 200, "success");
        res.send(results);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "An internal server error occurred. " + error });
    }
});

app.get("/reports", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!req.query)
        return res.status(400).send({ status: 400, message: "Missing query parameters" });
    if (!req.query.period_of_interest_start) {
        return res
            .status(400)
            .send({ status: 400, message: "Missing parameter period_of_interest_start" });
    }
    if (!req.query.period_of_interest_end) {
        return res
            .status(400)
            .send({ status: 400, message: "Missing parameter period_of_interest_end" });
    }
    
    if (typeof req.query.key_terms !== "string") {
        return res.status(400).send({ status: 400, message: "key_terms must be a string" });
    }
    if (typeof req.query.location !== "string") {
        const message = "location must be a string";
        createLog(_conn, ip, "/reports", req.query, 400, message, req.query.team);
        return res.status(400).send({ status: 400, message: message });
    }

    try {
        const results = await routes.reports(_conn, 
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            req.query.key_terms,
            req.query.location,
        );
        createLog(_conn, ip, "/reports", req.query, 200, "success", req.query.team);
        res.send(results);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "An internal server error occurred. " + error });
    }
});

app.get("/predictions", async (req, res) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    let threshold = req.query.threshold || 0;

    try {
        const predictions = await routes.predictions(_conn, threshold);
        createLog(_conn, ip, "/predictions", req.query, 200, "success", req.query.team);
        res.send(predictions);
    }
    catch(error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "An internal server error occurred. " + error });
    }
});

app.get("/logs", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    try {
        const logs = await routes.logs(_conn, ip);
        createLog(_conn, ip, "/logs", req.query, 200, "success");
        res.send(logs);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "An internal server error occurred. " + error });
    }
});

async function createLog(conn, ip, route, reqParams, status, message, team) {
    let timestamp = (new Date().toISOString());
    timestamp = timestamp.replace(/\.[0-9]{3}Z$/, "");

    await conn("Log").insert({
        status: status,
        route: route,
        req_params: JSON.stringify(reqParams),
        timestamp: timestamp,
        message: message,
        ip: ip,
        team: team || "Team QQ"
    });
}

const PORT = parseInt(process.env.PORT) || 8080;
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Press Ctrl+C to quit.");
});

module.exports = server;
