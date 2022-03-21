"use strict";

const nlp = require("compromise");

async function processArticle(conn, article) {
    if (!article.headline || !article.date_of_publication || !article.author || !article.main_text || !article.article_url || !article.category) {
        throw "Missing field(s) from parameter 'article'"
    }

    // Generate disease alias table for "compromise".
    const records = await conn.select("*").from("DiseaseAlias");
    const diseases = {};
    for (let i = 0; i < records.length; i++) {
        const diseaseId = records[i].disease_id;
        const alias = records[i].alias;
        
        if (diseases[diseaseId] == null) {
            diseases[diseaseId] = {};
        }
        
        diseases[diseaseId][alias] = diseaseId;

        if (alias.indexOf("-") > -1) {
            const modifiedAlias = alias.replace(/-/g, " ");
            diseases[diseaseId][modifiedAlias] = diseaseId;
        }
    }

    return findReports(article, diseases);
}

async function findReports(article, diseases) {
    const text = article.headline + ". " + article.main_text;
    const reports = [];

    for (let diseaseId in diseases) {
        if (!diseases.hasOwnProperty(diseaseId)) continue;

        const doc = nlp(text, diseases[diseaseId]);
        const behindPlaces = doc.match("#" + diseaseId + "+").lookBehind("#Place+").out("array");
        const aheadPlaces = doc.match("#" + diseaseId + "+").lookAhead("#Place+").out("array");

        // Interleave arrays.
        const places = [];
        const maxLen = behindPlaces.length > aheadPlaces.length ? behindPlaces.length : aheadPlaces.length;
        for (let idx = 0; idx < maxLen; idx++) {
            // Remove trailing "'s"
            if (idx < behindPlaces.length) {
                places.push(behindPlaces[idx]);
            }
            if (idx < aheadPlaces.length) {
                places.push(aheadPlaces[idx]);
            }
        }

        if (places.length > 0) {
            const location = places[0];

            reports.push({
                article_url: article.article_url,
                disease_id: diseaseId,
                event_date: article.date_of_publication,
                location: processLocation(location)
            });
        }
    }
    return reports;
}

/**
 * Strips bad characters from location names.
 * @param {string} location 
 */
function processLocation(location) {
    location = location.replace(/[.,!#"]/gi, "");
    location = location.replace(/'s?$/i, "");
    location = location.replace(/'/gi, "");
    return location;
}

exports.processArticle = processArticle;
exports.findReports = findReports