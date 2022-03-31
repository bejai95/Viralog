"use strict";

const express = require("express");
const db = require("./database");
const routes = require("./routes");
const { findNull, findNotString, timeFormatCorrect, parseInteger } = require("./util");

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
        return performError(_conn, res, "/articles", 400,
            "Missing query parameters", req.query, ip);
    }
    const nullValue = findNull(req.query, [
        "period_of_interest_start", "period_of_interest_end",
        "key_terms", "location",
    ]);
    if (nullValue) {
        return performError(_conn, res, "/articles", 400,
            `Missing parameter ${nullValue}`, req.query, ip );
    }

    const notString = findNotString(req.query, [
        "period_of_interest_start", "period_of_interest_end",
        "key_terms", "location", "sources",
    ]);
    if (notString) {
        return performError(_conn, res, "/articles", 400,
            `${notString} must be a string`, req.query, ip);
    }

    if (req.query.period_of_interest_start &&
        !timeFormatCorrect(req.query.period_of_interest_start))
    {
        return performError(_conn, res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_start', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }
    if (req.query.period_of_interest_end &&
        !timeFormatCorrect(req.query.period_of_interest_end))
    {
        return performError(_conn, res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }

    try {
        const results = await routes.articles(
            _conn,
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            req.query.key_terms,
            req.query.location,
            req.query.sources
        );

        createLog(_conn, ip, "/articles", req.query, 200, "success");
        res.send(results);
    } catch (error) {
        console.log(error);
        return performError(_conn, res, "/articles", 500,
            "An internal server error occurred. " + error,
            req.query, ip
        );
    }
});

app.get('/article/:id', async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    try {
        const results = await routes.article(_conn, req.params.id);
        res.send(results);
    } catch (error) {
        console.log(error);
        return performError(_conn, res, "/article/" + req.params.id, 500,
            "An internal server error occurred. " + error,
            req.params.id, ip
        );
    }

});

app.get("/reports", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());
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
        return performError(_conn, res, "/reports", 400,
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
        return performError(_conn,
            res, "/reports", 400,
            `${notString} must be a string`,
            req.query, ip
        );
    }

    if (req.query.period_of_interest_start &&
        !timeFormatCorrect(req.query.period_of_interest_start))
    {
        return performError(_conn, res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_start', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }
    if (req.query.period_of_interest_end &&
        !timeFormatCorrect(req.query.period_of_interest_end))
    {
        return performError(_conn, res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }

    try {
        const results = await routes.reports(
            _conn,
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            req.query.key_terms,
            req.query.location
        );
        createLog(_conn, ip, "/reports", req.query, 200, "success", req.query.team);
        return res.send(results);
    } catch (error) {
        console.log(error);
        return performError(_conn, res, "/reports", 500,
            "An internal server error occurred. " + error,
            req.query, ip
        );
    }
});

app.get("/predictions", async (req, res) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    _conn = _conn || (await db.createConnectionPool());

    const nullValue = findNull(req.query, [
        "min_report_count", "day_count",
    ]);
    if (nullValue) {
        return performError(_conn, res, "/predictions", 400,
            `Missing parameter ${nullValue}`,
            req.query, ip);
    }

    const min_report_count = parseInteger(req.query.min_report_count);
    if (min_report_count === null) {
        return performError(_conn, res, "/predictions", 400,
            "min_report_count must be an integer",
            req.query, ip);
    }

    const day_count = parseInteger(req.query.day_count);
    if (day_count === null) {
        return performError(_conn, res, "/predictions", 400,
            "day_count must be an integer",
            req.query, ip);
    }

    if (min_report_count <= 0) {
        return performError(_conn, res, "/predictions", 400,
            "Parameter 'min_report_count' must be greater than 0.",
            req.query, ip
        );
    }
    if (day_count <= 0) {
        return performError(_conn, res, "/predictions", 400,
            "Parameter 'day_count' must be greater than 0.",
            req.query, ip
        );
    }

    try {
        const predictions = await routes.predictions(_conn, min_report_count, day_count);
        createLog(_conn, ip, "/predictions", req.query, 200, "success", req.query.team);
        res.send(predictions);
    } catch (error) {
        console.log(error);
        return performError(_conn,
            res, "/predictions", 500,
            "An internal server error occurred. " + error,
            req.query,  ip
        );
    }
});

app.get("/logs", async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!req.query) {
        return performError(_conn, res, "/logs", 400,
            "Missing query parameters", req.query, ip);
    }

    // Check parameters are strings.
    const notString = findNotString(req.query, [
        "period_of_interest_start", "period_of_interest_end",
        "routes", "team", "ip",
    ]);
    if (notString) {
        return performError(_conn,
            res, "/logs", 400,
            `${notString} must be a string`,
            req.query,
            ip
        );
    }

    // Check route list format.
    let routesList;
    if (req.query.routes && req.query.routes != "") {
        routesList = req.query.routes.split(",");
        for (let i = 0; i < routesList.length; i++) {
            const routesRegex = /^\/[a-z0-9\/]+$/i;
            if (!routesRegex.test(routesList[i])) {
                return performError(_conn, res, "/logs", 400, "invalid route list", req.query, ip);
            }
        }
    }

    // Check status is an integer.
    let status = req.query.status;
    if (status === "") {
        status = null;
    }
    if (status) {
        status = parseInt(status);
        if (isNaN(status) || !Number.isSafeInteger(status)) {
            return performError(_conn,
                res, "/logs", 400,
                "status must be an integer",
                req.query,
                ip
            );
        }
    }

    // Check dates are in correct format.
    if (req.query.period_of_interest_start &&
        !timeFormatCorrect(req.query.period_of_interest_start))
    {
        return performError(_conn, res, "/logs", 400,
            "Invalid timestamp for 'period_of_interest_start', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }
    if (req.query.period_of_interest_end &&
        !timeFormatCorrect(req.query.period_of_interest_end))
    {
        return performError(_conn, res, "/logs", 400,
            "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }

    try {
        // Run logs command with validated parameters.
        const logs = await routes.logs(
            _conn,
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            routesList,
            status,
            req.query.team,
            req.query.ip
        );
        createLog(_conn, ip, "/logs", req.query, 200, "success");
        res.send(logs);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: 500,
            message: "An internal server error occurred. " + error,
        });
    }
});

function performError(conn, res, route, status, message, query, ip) {
    createLog(conn, ip, route, query, status, message, query.team);
    return res.status(400).send({ status: status, message: message });
}

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

module.exports.app = app;
module.exports.closeConnections = async function() {
	if (_conn) {
		await _conn.destroy();
	}
};
