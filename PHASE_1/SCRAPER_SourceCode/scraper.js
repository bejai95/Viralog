"use strict";

const axios = require("axios");
const cheerio = require("cheerio");

const CIDRAP_URL = "https://www.cidrap.umn.edu";
const ARTICLES_URL = "https://www.cidrap.umn.edu/news-perspective?f%5B0%5D=type%3Ass_news";
const LIST_PAGE_COUNT = 1;

exports.scrape = async (processFn) => {
    const promises = [];
    for (let i = 0; i < LIST_PAGE_COUNT; i++) {
        promises.push(scrapeArticleList(processFn, i));
    }
    await Promise.all(promises);
};

async function scrapeArticleList(processFn, index) {
    const res = await axios.get(ARTICLES_URL + "&page=" + index);
    const $ = cheerio.load(res.data);

    const promises = [];
    $("h3.node-title.fieldlayout.node-field-title > a").each((_idx, el) => {
        promises.push(scrapeArticle(processFn, $(el).attr("href")));
    });
    await Promise.all(promises);
}

async function scrapeArticle(processFn, url) {
    if (!url.startsWith("/news-perspective/")) {
        console.log("Bad CIDRAP article url: " + url);
        return;
    }

    const res = await axios.get(CIDRAP_URL + url);
    const $ = cheerio.load(res.data);

    const data = {
        title:  $("#page-title").first().text(),
        date:   $("span.date-display-single").first().text(),
        author: $("a[href$='/ongoing-programs/news-publishing/news-publishing-staff']").first().text(),
        body:   $("div.field.field-name-field-body.field-type-text-long.field-label-hidden").first().text()
    };
    processFn(data);
}
