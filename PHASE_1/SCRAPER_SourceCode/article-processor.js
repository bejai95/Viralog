"use strict";

const csv = require("csv-parser");
const fs = require("fs");
const nlp = require("compromise");

let countries;
let cities;

// function loadLocationData() {
//     // const results = [];
//     countries = {};
//     cities = {};

//     fs.createReadStream("data/worldcities.csv")
//         .pipe(csv())
//         .on("data", (data) => {
//             countries[data.country] = true;
//             cities[data.city] = data;
//         })
//         .on("end", () => {
//             console.log("Loaded data/worldcities.csv");
//         });
// }

async function processArticle(conn, article) {
    console.log(article);

    if (countries == null || cities == null) {
        // loadLocationData();
    }
    
    
    
    const records = await conn.select("*").from("DiseaseAlias");
    const diseases = {};
    for (let i = 0; i < records.length; i++) {
        const alias = records[i].alias;
        diseases[alias] = "Disease";

        if (alias.indexOf("-") > -1) {
            const modifiedAlias = alias.replace(/-/g, " ");
            diseases[modifiedAlias] = "Disease";
        }
    }

    console.log(diseases);

    const text = article.title + ". " + article.body;
    const doc = nlp(text, diseases);

    // console.log(doc.match("#Disease+").out("array"));
    // console.log(doc.match("#Place+").out("array"));
    console.log(doc.match("#Disease").lookBehind("#Place").out("array"));
    console.log(doc.match("#Disease").lookAhead("#Place").out("array"));



    //     let alias = records[i].alias;

    //     console.log(alias);
    //     const behindPlaces = doc.match(alias).lookBehind("#Place").out("array");
    //     const aheadPlaces = doc.match(alias).lookAhead("#Place").out("array");

    //     // Interleave arrays.
    //     const places = [];
    //     const maxLen = behindPlaces.length > aheadPlaces.length ? behindPlaces.length : aheadPlaces.length;
    //     for (let idx = 0; idx < maxLen; idx++) {
    //         if (idx < behindPlaces.length) {
    //             places.push(behindPlaces[idx]);
    //         }
    //         if (idx < aheadPlaces.length) {
    //             places.push(aheadPlaces[idx]);
    //         }
    //     }



    // }

    // let places = doc.places();





    // console.log(places);
}

exports.processArticle = processArticle;
