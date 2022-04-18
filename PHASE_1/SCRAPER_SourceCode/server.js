"use strict";

const db = require("./database");
const scraper = require("./scraper");
const processor = require("./article-processor");

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
    let reports;
    try {
        const res = await conn("Article").insert(article).returning("article_id");
        article.article_id = res[0].article_id;

        reports = await processor.processArticle(conn, article);
    } catch (error) {
        console.log(error);
        return;
    }
    console.log(`Article "${article.headline}": ${reports.length} reports`);

    try {
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
