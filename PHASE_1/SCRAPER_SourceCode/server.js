"use strict";

// Require process, so we can mock environment variables.
const db = require("./database");
const scraper = require("./scraper");

let _conn;

exports.scrape = async (message, context) => {
    _conn = _conn || await db.createConnectionPool();

    console.log("Scraping...");

    const articles = [];
    await scraper.scrape(
        article => articles.push(article)
    );

    console.log("Finished.");
};
