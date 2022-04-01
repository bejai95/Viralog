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

exports.logs = async (req, res, conn) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!req.query) {
        return performError(conn, res, "/logs", 400,
            "Missing query parameters", req.query, ip);
    }

    // Check parameters are strings.
    const notString = findNotString(req.query, [
        "period_of_interest_start", "period_of_interest_end",
        "routes", "team", "ip",
    ]);
    if (notString) {
        return performError(conn,
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
                return performError(conn, res, "/logs", 400, "invalid route list", req.query, ip);
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
            return performError(conn,
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
        return performError(conn, res, "/logs", 400,
            "Invalid timestamp for 'period_of_interest_start', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }
    if (req.query.period_of_interest_end &&
        !timeFormatCorrect(req.query.period_of_interest_end))
    {
        return performError(conn, res, "/logs", 400,
            "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }

    try {
        // Run logs command with validated parameters.
        const result = await logs(
            conn,
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            routesList,
            status,
            req.query.team,
            req.query.ip
        );
        createLog(conn, ip, "/logs", req.query, 200, "success");
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: 500,
            message: "An internal server error occurred. " + error,
        });
    }
};

async function logs(
    conn,
    period_of_interest_start,
    period_of_interest_end,
    routes, status, team, ip
) {
    const logs = await conn
        .select("*")
        .from("Log")
        .modify(
            (queryBuilder) =>
                period_of_interest_start &&
                queryBuilder.where("timestamp", ">=", period_of_interest_start)
        )
        .modify(
            (queryBuilder) =>
                period_of_interest_end &&
                queryBuilder.where("timestamp", "<=", period_of_interest_end)
        )
        .modify(
            (queryBuilder) =>
                status && queryBuilder.where("status", "=", status)
        )
        .modify(
            (queryBuilder) =>
                ip && ip != "" && queryBuilder.where("ip", "=", ip)
        )
        .modify(
            (queryBuilder) =>
                team && team != "" && queryBuilder.where("team", "=", team)
        )
        .modify((queryBuilder) => {
            if (routes) {
                queryBuilder.whereIn("route", routes);
            }
        })
        .orderBy("timestamp", "desc").limit(4096);
    return logs;
}
