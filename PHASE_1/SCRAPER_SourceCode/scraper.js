"use strict";

const axios = require("axios");
const cheerio = require("cheerio");

const CIDRAP_URL = "https://www.cidrap.umn.edu";
const ARTICLES_URL =
    "https://www.cidrap.umn.edu/news-perspective?f%5B0%5D=type%3Ass_news";

exports.scrape = async (conn, pageCount, processFn) => {
    for (let i = 0; i < pageCount; i++) {
        console.log(`Scraping list page ${i + 1}`);
        await scrapeArticleList(conn, processFn, i);
    }
};

async function scrapeArticleList(conn, processFn, index) {
    const res = await axios.get(ARTICLES_URL + "&page=" + index);
    const $ = cheerio.load(res.data);

    const promises = [];
    $("h3.node-title.fieldlayout.node-field-title > a").each(
        async (_idx, el) => {
            let urlStub = $(el).attr("href");
            let articleUrl = CIDRAP_URL + urlStub;

            promises.push(
                articleExists(conn, articleUrl).then(async (exists) => {
                    if (!exists) {
                        await scrapeArticle(processFn, urlStub);
                    }
                })
            );
        }
    );
    await Promise.all(promises);
}

async function articleExists(conn, articleUrl) {
    const result = await conn("Article")
        .count("*")
        .where("article_url", articleUrl);
    return result[0].count > 0;
}

async function scrapeArticle(processFn, urlStub) {
    if (!urlStub.startsWith("/news-perspective/")) {
        console.log("Bad CIDRAP article url: " + urlStub);
        return;
    }

    const res = await axios.get(CIDRAP_URL + urlStub);
    const $ = cheerio.load(res.data);

    const data = {
        headline: $("#page-title").first().text(),
        date_of_publication: $("span.date-display-single").first().text(),
        author: $(
            "a[href$='/ongoing-programs/news-publishing/news-publishing-staff']"
        )
            .first()
            .text(),
        main_text: $(
            "div.field.field-name-field-body.field-type-text-long.field-label-hidden"
        )
            .first()
            .text(),
        article_url: CIDRAP_URL + urlStub,
        source: "CIDRAP",
        category: $(
            "div.fieldlayout-inline.fieldlayout.node-field-filed_under div div:nth-child(2)"
        )
            .first()
            .text(),
    };

    // Ensure none of the article values are empty (empty string, null or undefined)
    for (let key in data) {
        if (!data[key]) return;
    }
    processFn(data);
}
