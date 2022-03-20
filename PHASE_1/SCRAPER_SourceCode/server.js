"use strict";

const db = require("./database");
const scraper = require("./scraper");
const processor = require("./article-processor");
const { default: knex } = require("knex");

async function scrape(message, context) {
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
        await scraper.scrape(conn, parseInt(process.argv[2]) || 1, parseInt(process.argv[3]) || 1,
            async article => processArticle(conn, article)
        );
    }
    catch (error) {
        console.log("Failed to scrape CIDRAP.");
        console.log(error);
        return;
    }

    conn.destroy();
    console.log("Done!");
}

async function processArticle(conn, article) {
    let reports = await processor.processArticle(conn, article);
    console.log(`Article "${article.headline}": ${reports.length} reports`);

    try {
        await conn("Article").insert(article);

        await conn.batchInsert("Report", reports);
    }
    catch (error) {
        console.log(error);
    }
}

if (process.argv[2]) {
    scrape();
}

exports.scrape = scrape;
