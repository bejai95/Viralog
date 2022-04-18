"use strict";

const db = require("./database");
const axios = require("axios");
const Maps = require("@googlemaps/google-maps-services-js");

const TEAMVIRAL_ARTICLES_URL = "https://teamviral-api.herokuapp.com/api/v1/articles/dump";

async function scrapeTeamViral() {
    console.log("Scraping team viral...");
    let conn;
    try {
        conn = conn || await db.createConnectionPool();
    }
    catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
        return;
    }

    const reportsRes = await axios.get(TEAMVIRAL_ARTICLES_URL);
    if (!reportsRes.data || !reportsRes.data.articles) {
        console.log("No reports");
        return;
    }
    const tvArticles = reportsRes.data.articles;

    for (let i = 0; i < tvArticles.length; i++) {
        const tvArticle = tvArticles[i];
        console.log(tvArticle.url);

        if (!await articleExists(conn, tvArticle.url) && tvArticle.reports.length > 0) {
            await processTeamViralArticle(conn, tvArticle);
        }
        else {
            console.log("article already added.");
        }
    }

    conn.destroy();
    console.log("Done!");
}

async function articleExists(conn, articleUrl) {
    const result = await conn("Article")
        .count("*")
        .where("article_url", articleUrl);
    return result[0].count > 0;
}

async function getDiseaseId(conn, diseaseAlias) {
    const result = await conn.select("Disease.disease_id")
        .from("Disease")
        .join("DiseaseAlias", "Disease.disease_id", "=", "DiseaseAlias.disease_id")
        .whereLike("DiseaseAlias.alias", "%" + diseaseAlias + "%");
    if (result.length > 0) {
        return result[0].disease_id;
    }
    return null;
}

async function processTeamViralArticle(conn, tvArticle) {

    let date = tvArticle.dateOfPublication;
    date = new Date(date).toISOString();
    date = date.replace(/\.[0-9]{3}Z$/, "");

    if (date > new Date().toISOString().replace(/\.[0-9]{3}Z$/, "")) {
        console.log("BAD DATE ", tvArticle.dateOfPublication, "to", date);
        return;
    }


    const article = {
        headline:  tvArticle.headline,
        date_of_publication: date,
        author: "World Health Organization",
        main_text: "",
        article_url: tvArticle.url,
        source: "World Health Organization",
        category: "Disease Outbreak News",
    };

    const reports = [];
    for (let i = 0; i < tvArticle.reports.length; i++) {
        const tvReport = tvArticle.reports[i];
        const report = await processTeamViralReport(conn, tvReport, date);

        if (report) {
            reports.push(report);
        }
        else {
            // console.log("Bad report: ", tvReport.diseases, tvReport.locations);
        }
    }
    if (reports.length == 0) {
        console.log("No reports");
        return;
    }
    
    // Add article to database.
    const res = await conn("Article").insert(article).returning("article_id");
    article.article_id = res[0].article_id;

    // Add reports to database.
    for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        report.article_id = article.article_id;
        await conn("Report").insert(report);
    }
}

async function processTeamViralReport(conn, report, date) {
    const diseaseId = await getDiseaseId(conn, report.diseases[0]);
    if (!diseaseId) {
        return null;
    }

    const reportResult = {
        disease_id: diseaseId,
        event_date: date
    };

    const client = new Maps.Client();
    for (let i = 0; i < report.locations.length; i++) {
        const location = report.locations[i];

        const mapsRes = await client.geocode({
            params: {
                key: "AIzaSyCJ1xWD_QmnEHqll9tm1HMgDGhcY7MXxuI",
                address: location
            }
        });
    
        if (mapsRes.data.results.length > 0) {
            reportResult.location = location;
            reportResult.lat = mapsRes.data.results[0].geometry.location.lat;
            reportResult.long = mapsRes.data.results[0].geometry.location.lng;
            return reportResult;
        }
    }
    return null;
}

scrapeTeamViral();
