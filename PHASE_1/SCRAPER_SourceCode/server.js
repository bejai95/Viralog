"use strict";

const db = require("./database");
const scraper = require("./scraper");
const processor = require("./article-processor");
const { default: knex } = require("knex");

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
        await scraper.scrape(conn, parseInt(process.argv[2]) || 1,
            article => articles.push(article)
        );

        console.log(`${articles.length} CIDRAP pages will be processed...`);
    }
    catch (error) {
        console.log("Failed to scrape CIDRAP.");
        console.log(error);
        return;
    }

    for (let i = 0; i < articles.length; i++) {
        let reports = await processor.processArticle(conn, articles[i]);
        console.log(`Article "${articles[i].headline}": ${reports.length} reports`);

        try {
            await conn("Article").insert(articles[i]);

            await conn.batchInsert("Report", reports);
        }
        catch (error) {
            console.log(error);
            return;
        }
    }

    conn.destroy();
    console.log("Done!");
}

scrape();
