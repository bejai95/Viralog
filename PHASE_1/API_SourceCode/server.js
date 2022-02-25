'use strict';

// Require process, so we can mock environment variables.
const process = require('process');
const express = require('express');
const db = require('./database');

const app = express();
app.enable('trust proxy');

// Automatically parse request body as form data.
app.use(express.urlencoded({ extended: false }));
// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

// Set Content-Type for all responses for these routes.
app.use((req, res, next) => {
    res.set('Content-Type', 'application/json');
    next();
});

// Create a Winston logger that streams to Stackdriver Logging.
const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
    level: 'info',
    transports: [new winston.transports.Console(), loggingWinston],
});

// Set up a variable to hold our connection pool. It would be safe to
// initialize this right away, but we defer its instantiation to ease
// testing different configurations.
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

app.get('/articles', async (req, res) => {
    _conn = _conn || (await db.createConnectionPool());

    const articles = await _conn.select('*').from('article');

    res.send(articles);
});

const PORT = parseInt(process.env.PORT) || 8080;
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = server;