"use strict";

const db = require("./database");
const fs = require("fs");

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
        // Load modified disease list.
        let jsonStr = fs.readFileSync("disease_list.json");
        let diseases = JSON.parse(jsonStr);

        await conn("DiseaseAlias").del();
        await conn("Symptom").del();
        await conn("Disease").del();

        for (let idx = 0; idx < diseases.length; idx++) {
            const disease = diseases[idx];
            process.stdout.write(disease.name + ", ");
            await conn("Disease").insert({disease_id: disease.name, name: disease.name});

            let aliases = disease.aliases || [];
            let symptoms = disease.symptoms || [];

            for (let i = 0; i < aliases.length; i++) {
                await conn("DiseaseAlias").insert({disease_id: disease.name, alias: aliases[i]});
            }
            for (let i = 0; i < symptoms.length; i++) {
                await conn("Symptom").insert({disease_id: disease.name, symptom: symptoms[i]});
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
