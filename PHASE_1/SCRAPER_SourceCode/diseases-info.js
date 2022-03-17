"use strict";

const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./database");


const diseases = {
    covid: {
        name: "COVID-19", aliases: ["COVID-19", "COVID", "SARS-CoV-2"],
        symptoms: ["fever", "cough", "fatigue", "shortness of breath", "vomiting", "loss of taste", "loss of smell"]
    },
    zika: { symptoms: ["fever", "rash", "headache", "joint pain", "red eyes", "muscle pain"] },
    mers: {
        aliases: ["mers", "Middle East respiratory syndrome", "MERS-CoV"],
        symptoms: ["fever", "cough", "shortness of breath", "nausea", "vomiting", "diarrhoea"]
    },
    salmonella: {
        aliases: ["salmonella", "salmonellosis"],
        symptoms: ["diarrhoea", "fever", "chills", "abdominal pain", "headache"]
    },
    legionnaire: {
        aliases: ["legionnaire", "legionella pneumonia"],
        symptoms: ["cough", "shortness of breath", "fever", "muscle ache", "headache", "chills"]
    },
    measles: {
        aliases: ["measles", "rubeola"],
        symptoms: ["fever", "cough", "runny nose", "watery eyes"]
    },
    anthrax: {
        symptoms: [
            "fever", "chills", "Swelling of neck or neck glands", "Sore throat", "Painful swallowing", "Hoarseness", "Nausea",
            "vomiting", "bloody vomiting", "diarrhea", "bloody diarrhea", "headache"
        ]
    },
    botulism: {
        symptoms: [
            "difficulty swallowing", "muscle weakness", "double vision","drooping eyelids", "blurry vision",
            "slurred speech", "difficulty breathing", "difficulty moving the eyes"
        ]
    },
    bubonic_plague: {
        name: "bubonic plague",
        aliases: ["bubonic plague", "black death"],
        symptoms: [
            "swollen lymph nodes", "fever", "chills", "headache", "fatigue", "muscle aches"
        ]
    },
    smallpox: {
        aliases: ["smallpox", "small pox", "variola"],
        symptoms: ["fever", "discomfort", "headache", "fatigue", "back pain", "vomiting" ]
    },
    tularemia: {
        aliases: ["tularemia", "rabbit fever"],
        symptoms: ["skin ulcers", "swollen and painful lymph glands", "inflamed eyes", "sore throat", "mouth sores", "diarrhea", "pneumonia"]
    },
    avian_flu: {
        aliases: ["avian flu", "avianflu"],
        symptoms: []
    }
};

async function uploadDiseases() {
    let conn;
    try {
        conn = await db.createConnectionPool();
    }
    catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
        return;
    }

    try {
        await conn("DiseaseAlias").del();
        await conn("Symptom").del();
        await conn("Disease").del();

        for (let key in diseases) {
            if (diseases.hasOwnProperty(key)) {
                console.log(key);
                await conn("Disease").insert({disease_id: key, name: diseases[key].name || key});

                let aliases = diseases[key].aliases || [];
                let symptoms = diseases[key].symptoms || [];

                for (let i = 0; i < aliases.length; i++) {
                    await conn("DiseaseAlias").insert({disease_id: key, alias: aliases[i]});
                }
                for (let i = 0; i < symptoms.length; i++) {
                    await conn("Symptom").insert({disease_id: key, symptom: symptoms[i]});
                }
            }
        }
    }
    catch (error) {
        console.log(error);
    }

    conn.destroy();
}

// scrapeWiki();

uploadDiseases();

console.log("Done");
