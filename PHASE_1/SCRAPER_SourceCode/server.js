"use strict";

// Require process, so we can mock environment variables.
const db = require("./database");
const scraper = require("./scraper");

async function scrape() {
    let conn;

    try {
        conn = conn || await db.createConnectionPool();
    }
    catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
        return;
    }

    console.log("Scraping...");

    const articles = [];
    try {
        await scraper.scrape(
            article => articles.push(article)
        );

        console.log("Success.");
    }
    catch (error) {
        console.log("Failed to scrape. ");
        console.log(error);
    }
}

scrape();
