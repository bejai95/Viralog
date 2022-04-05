"use strict";

const express = require("express");
const db = require("./database");
const { articles, articlesId } = require("./routes/articles");
const { diseases, diseasesId } = require("./routes/diseases");
const { logs } = require("./routes/logs");
const { predictions } = require("./routes/predictions");
const { reports, reportsId } = require("./routes/reports");
const app = express();
const cors = require('cors')
app.enable("trust proxy");

// Enable cors
app.use(cors())
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

async function getDB() {
    _conn = _conn || (await db.createConnectionPool());
    return _conn;
}

app.get("/articles", async (res, req) => articles(res, req, await getDB()));
app.get("/articles/:id", async (res, req) => articlesId(res, req, await getDB()));

app.get("/reports", async (res, req) => reports(res, req, await getDB()));
app.get("/reports/:id", async (res, req) => reportsId(res, req, await getDB()));

app.get("/predictions", async (res, req) => predictions(res, req, await getDB()));

app.get("/logs", async (res, req) => logs(res, req, await getDB()));

app.get("/diseases", async (res, req) => diseases(res, req, await getDB()));
app.get("/diseases/:id", async (res, req) => diseasesId(res, req, await getDB()));

module.exports.app = app;
module.exports.closeConnections = async function() {
    if (_conn) {
        await _conn.destroy();
    }
};
