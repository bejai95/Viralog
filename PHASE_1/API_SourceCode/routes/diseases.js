"use strict";

const {
    findNull,
    findNotString,
    timeFormatCorrect,
    parseInteger,
    performError,
    createLog,
    getDiseaseSymptoms,
    formatDate
} = require("../util");

exports.diseases = async (req, res, conn) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!req.query) {
        return res.status(400).send({
            status: 400,
            message: "Missing query parameters"
        });
    }

    // Check parameter values are a string
    const notString = findNotString(req.query, [
        "names"
    ]);
    if (notString) {
        return performError(conn,
            res, "/diseases", 400,
            `${notString} must be a string`,
            req.query, ip
        );
    }

    try {
        const results = await diseases(
            conn,
            req.query.names
        );
        createLog(conn, ip, "/diseases", req.query, 200, "success", req.query.team);
        return res.send(results);
    } catch (error) {
        console.log(error);
        return performError(conn, res, "/diseases", 500,
            "An internal server error occurred. " + error,
            req.query, ip
        );
    }
};

exports.diseasesId = async (req, res, conn) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    try {
        const results = await diseasesId(conn, req.params.id);
        createLog(conn, ip, "/diseases/" + req.params.id, req.query, 200, "success");
        res.send(results);
    } catch (error) {
        console.log(error);
        return performError(conn, res, "/diseases/" + req.params.id, 500,
            "An internal server error occurred. " + error,
            req.params.id, ip
        );
    }
};

async function diseases(
    conn,
    names
) {
    // Get diseases (and be able to filter by aliases)
    let diseases = await conn
        .select(
            "disease_id"
        )
        .from("Disease");
    
    // If users have inputted a filter
    if (names != "") {
        diseases = await conn
            .select(
                "Disease.disease_id",
                "DiseaseAlias.alias"
            )
            .from("Disease")
            .join("DiseaseAlias", "DiseaseAlias.disease_id", "=", "Disease.disease_id")
            .modify((queryBuilder) => {
                if (names && names != "") {
                    const nms = names.split(",");
                    // the list of aliases always contains the actual disease name
                    queryBuilder.whereIn("alias", nms);
                }
            });
    }
    
    // Get the alises of each disease - we still need this because the above
    // select filtered out other non-searched-for aliases of the disease we want to search for
    const aliases = await conn
        .select(
            "Disease.disease_id",
            "DiseaseAlias.alias"
        )
        .from("Disease")
        .join("DiseaseAlias", "DiseaseAlias.disease_id", "=", "Disease.disease_id");

    // for some reason symptoms function is returning as empty
    // get the symptoms for each disease
    const symptoms = await conn
        .select(
            "Disease.disease_id",
            "Symptom.symptom"
        )
        .from("Disease")
        .join("Symptom", "Symptom.disease_id", "=", "Disease.disease_id");

    const results = [];
    for (let i = 0; i < diseases.length; i++) {
        const disease = diseases[i];

        // extract all symptoms relating to the given disease
        const symps = [];
        // this is inside the loop as filters applied may not be in alphabetical order
        for (let s = 0; s < symptoms.length; s++) {
            const symptom = symptoms[s];
            if (symptom["disease_id"] == disease["disease_id"]) {
                symps.push(symptom["symptom"]);
            }
        }

        // extract all aliases relating to the given disease
        const als = [];
        for (let a = 0; a < aliases.length; a++) {
            const alias = aliases[a];
            if (alias["disease_id"] == disease["disease_id"]) {
                als.push(alias["alias"]);
            }
        }
        
        // Only add the disease if an alias of that disease was added as a filter
        if (als.length > 0) {
            results.push({
                disease_id: disease["disease_id"],
                symptoms: symps,
                aliases: als
            });
        }
    }

    return results;
}

async function diseasesId(conn, diseaseId) {
    const diseases = await conn.select("*").from("Disease");
    if (diseases.length == 0) {
        return null;
    }

    const aliases = await conn
        .select("DiseaseAlias.alias")
        .from("DiseaseAlias")
        .where("DiseaseAlias.disease_id", "=", diseaseId);

    const symptoms = await conn
        .select("Symptom.symptom")
        .from("Symptom")
        .where("Symptom.disease_id", "=", diseaseId);

    let currDate = new Date();
    const periodEnd = formatDate(currDate);
    currDate.setDate(currDate.getDate() - 90);
    const periodStart = formatDate(currDate);

    const recentCountRes = await conn("Report")
        .count("*", {as: "count"})
        .where("disease_id", "=", diseaseId)
        .where("event_date", ">=", periodStart)
        .where("event_date", "<=", periodEnd);
    
    const totalCountRes = await conn("Report")
        .where("disease_id", "=", diseaseId)
        .count("*", {as: "count"});

    const recentReports = await conn("Report")
        .select(
            "Report.report_id",
            "Report.disease_id",
            "Report.event_date",
            "Report.location",
            "Report.lat",
            "Report.long",
            "Article.article_id",
            "Article.headline",
        )
        .join("Article", "Article.article_id", "=", "Report.article_id")
        .where("disease_id", "=", diseaseId)
        .orderBy("event_date", "desc")
        .limit(16);

    return {
        disease_id: diseaseId,
        aliases: aliases.map(row => row.alias),
        symptoms: symptoms.map(row => row.symptom),
        recent_report_count: parseInt(recentCountRes[0].count),
        total_report_count: parseInt(totalCountRes[0].count),
        recent_reports: recentReports.map(report => ({
            report_id: report.report_id,
            diseases: [report.disease_id],
            event_date: report.event_date,
            location: {
                location: report.location,
                lat: parseFloat(report.lat),
                long: parseFloat(report.long),
            },
            article_id: report.article_id,
            headline: report.headline
        }))
    };
}
