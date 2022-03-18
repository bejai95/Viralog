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
        return performError(res, "/articles", 400, "Missing query parameters", req.query, ip);
    }
    const nullValue = findNull(req.query, ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"]);
    if (nullValue) {
        return performError(res, "/articles", 400, `Missing parameter ${nullValue}`, req.query, ip);
    }

    const notString = findNotString(req.query, 
        "period_of_interest_start", "period_of_interest_end", "key_terms", "location", "sources"
    );
    if (notString) {
        return performError(res, "/articles", 400, `${notString} must be a string`, req.query, ip);
    }

    if (req.query.period_of_interest_start && !timeFormatCorrect(req.query.period_of_interest_start)) {
        return performError(res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_start', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip);
    }
    if (req.query.period_of_interest_end && !timeFormatCorrect(req.query.period_of_interest_end)) {
        return performError(res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip);
    }

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
        return performError(res, "/articles", 500, "An internal server error occurred. " + error, req.query, ip);
    }
});

app.get("/reports", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!req.query) {
        return res.status(400).send({ status: 400, message: "Missing query parameters" });
    }
    const nullValue = findNull(req.query, ["period_of_interest_start", "period_of_interest_end", "key_terms", "location"]);
    if (nullValue) {
        return performError(res, "/reports", 400, `Missing parameter ${nullValue}`, req.query, ip);
    }

    const notString = findNotString(req.query, 
        "period_of_interest_start", "period_of_interest_end", "key_terms", "location", "sources"
    );
    if (notString) {
        return performError(res, "/reports", 400, `${notString} must be a string`, req.query, ip);
    }

    if (req.query.period_of_interest_start && !timeFormatCorrect(req.query.period_of_interest_start)) {
        return performError(res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_start', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip);
    }
    if (req.query.period_of_interest_end && !timeFormatCorrect(req.query.period_of_interest_end)) {
        return performError(res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip);
    }

    try {
        const results = await routes.reports(_conn, 
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            req.query.key_terms,
            req.query.location,
        );
        createLog(_conn, ip, "/reports", req.query, 200, "success", req.query.team);
        return res.send(results);
    }
    catch (error) {
        console.log(error);
        return performError(res, "/reports", 500, "An internal server error occurred. " + error, req.query, ip);
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
        return performError(res, "/predictions", 500, "An internal server error occurred. " + error, req.query, ip);
    }
});

app.get("/logs", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!req.query) {
        return performError(res, "/logs", 400, "Missing query parameters", req.query, ip);
    }

    const notString = findNotString(req.query, "routes", "period_of_interest_start", "period_of_interest_end", "routes", "team");
    if (notString) {
        return performError(res, "/logs", 400, `${notString} must be a string`, req.query, ip);
    }

    let routesList;
    if (req.query.routes && req.query.routes != "") {
        routesList = req.query.routes.split(",");
        for (let i = 0; i < routesList.length; i++) {
            const routesRegex = /^\/[a-z0-9\/]+$/i;
            if (!routesRegex.test(routesList[i])) {
                return performError(res, "/logs", 400, "invalid route list", req.query, ip);
            }
        }
    }

    let status = req.query.status;
    if (status === "") {
        status = null;
    }
    if (status) {
        status = parseInt(status);
        if (isNaN(status) || !Number.isSafeInteger(status)) {
            return performError(res, "/logs", 400, "status must be an integer", req.query, ip);
        }
    }

    if (req.query.period_of_interest_start && !timeFormatCorrect(req.query.period_of_interest_start)) {
        return performError(res, "/logs", 400,
            "Invalid timestamp for 'period_of_interest_start', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip);
    }
    if (req.query.period_of_interest_end && !timeFormatCorrect(req.query.period_of_interest_end)) {
        return performError(res, "/logs", 400,
            "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip);
    }

    try {
        const logs = await routes.logs(_conn,
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            routesList,
            status,
            req.query.team
        );
        createLog(_conn, ip, "/logs", req.query, 200, "success");
        res.send(logs);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "An internal server error occurred. " + error });
    }
});

function findNull(obj, keys) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!(key in obj) || obj[key] == null) {
            return key;
        }
    }
    return null;
}

function findNotString(obj, keys) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if ((key in obj) && typeof obj[key] !== "string") {
            return key;
        }
    }
    return null;
}

function performError(res, route, status, message, query, ip) {
    createLog(_conn, ip, route, query, 400, message, query.team);
    return res.status(400).send({ status: 400, message: message });
}

async function createLog(conn, ip, route, queryParams, status, message) {
    let timestamp = (new Date().toISOString());
    timestamp = timestamp.replace(/\.[0-9]{3}Z$/, "");

    await conn("Log").insert({
        status: status,
        route: route,
        req_params: JSON.stringify(queryParams),
        timestamp: timestamp,
        message: message,
        ip: ip,
        team: queryParams.team || "Team QQ"
    });
}

function timeFormatCorrect(timestamp) {
    const timeFormat = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d$/;
    return timeFormat.test(timestamp);
}

const PORT = parseInt(process.env.PORT) || 8080;
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Press Ctrl+C to quit.");
});

module.exports = server;
