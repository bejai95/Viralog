"use strict";
const Fuse = require("fuse.js");

const {
    findNull,
    findNotString,
    timeFormatCorrect,
    parseInteger,
    performError,
    createLog,
    getDiseaseSymptoms,
    formatDate,
    bundleToWeeks
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
        "names", "search", "symptoms", "min_reports"
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
            req.query.search,
            req.query.diseases,
            req.query.symptoms,
            req.query.min_reports,
            req.query.max_reports,
            req.query.orderBy
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
        const results = (req.query.weekly_reports === 'true') ? await getReportsByWeek(conn, req.params.id) : await diseasesId(conn, req.params.id);
        if (results.length == 0) {
            return performError(conn,
                res, `/diseases/${req.params.id}`, 404,
                "Disease not found",
                req.query, ip
                );
        }
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

async function getReportsByWeek(conn, diseaseId) {
    const diseases = await conn.select("*").from("Disease").where("disease_id", diseaseId);
    
    if (diseases.length == 0) {
        return [];
    }

    const visualisationReports = await conn("Report")
        .select(
            "Report.report_id",
            "Report.event_date"
        )
        .where("disease_id", "=", diseaseId)
        .orderBy("event_date", "desc")
    return {
        reports_by_week: bundleToWeeks(visualisationReports),
        diseaseId: diseaseId

    }
}

async function diseases(
    conn,
    search,
    diseases_list,
    symptoms_list,
    min_reports,
    max_reports,
    orderBy
) {
    // Get diseases (and be able to filter by aliases)
    const diseases = await conn
        .select("Disease.disease_id")
        .from("Disease")
        .leftOuterJoin("Report", "Report.disease_id", "=", "Disease.disease_id")
        .count("Report.report_id", {as: "report_count"})
        .groupBy("Disease.disease_id")
        .modify(queryBuilder => {
            if (orderBy == "alphabetical") {
                queryBuilder.orderBy("Disease.disease_id", "asc");
            }
            else {
                queryBuilder
                    .orderBy("report_count", "desc");
            }
        });

    if (diseases.length == 0) {
        return [];
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
    
    let currDate = new Date();
    const periodEnd = formatDate(currDate);
    currDate.setDate(currDate.getDate() - 90);
    const periodStart = formatDate(currDate);
    
    const recentCountRes = await conn("Report")
    .select("disease_id")
    .count("*", {as: "count"})
    .groupBy("disease_id")
    .where("event_date", ">=", periodStart)
    .where("event_date", "<=", periodEnd);
    
    let results = diseases.map(disease => {
        const recentCountItems = recentCountRes.filter(entry => entry["disease_id"] == disease["disease_id"]);
        
        return {
            disease_id: disease["disease_id"],
            symptoms: symptoms.filter(symptom => symptom["disease_id"] == disease["disease_id"]).map(symptom => symptom["symptom"]),
            aliases: aliases.filter(alias => alias["disease_id"] == disease["disease_id"]).map(alias => alias["alias"]),
            recent_report_count: recentCountItems.length > 0 ? recentCountItems[0].count : 0,
            total_report_count: disease["report_count"]
        };
    });

    if (min_reports) results = results.filter(x => parseInt(x["recent_report_count"]) >= min_reports);
    if (max_reports) results = results.filter(x => parseInt(x["recent_report_count"]) <= max_reports);

    let searchResults = [];
    if (search && search != "") {
        // Split and trim search string.
        const searchItems = search.split(",")
            .map(item => item.trim());

            for (let i = 0; i < searchItems.length; i++) {
                const searchItem = searchItems[i];
                
                const options = {
                    includeScore: true,
                    keys: ["disease_id", "aliases", "symptoms"]
                };
                
                const fuse = new Fuse(results, options);
                
                let result = fuse.search(searchItem);
                result = result.filter(x => x.score < 0.2);
                
            
            for (let r in result) {
                if (searchResults.indexOf(result[r].item) == -1) {
                    searchResults.push(result[r].item);
                }
            }
        }
        return searchResults;
    }
    else if (!diseases_list && !symptoms_list) {
        return results;
    }

    let diseasesResults = [];
    if (diseases_list && diseases_list != "") {
    
        const diseasesItems = diseases_list.split(",")
            .map(item => item.trim());

        for (let i = 0; i < diseasesItems.length; i++) {
            const diseaseItem = diseasesItems[i];

            const options = {
                includeScore: true,
                keys: ["disease_id", "aliases"]
            };

            const fuse = new Fuse(results, options);

            let result = fuse.search(diseaseItem);
            result = result.filter(x => x.score < 0.2);

            for (let r in result) {
                if (diseasesResults.indexOf(result[r].item) == -1) {
                    diseasesResults.push(result[r].item);
                }
            }
        }
    }
    // console.log(diseasesResults);

    
    let symptomResults = [];
    if (symptoms_list && symptoms_list != "") {
        const symptomItems = symptoms_list.split(",")
        .map(item => item.trim());
        
        for (let i = 0; i < symptomItems.length; i++) {
            const symptomItem = symptomItems[i];
            
            
            const options = {
                includeScore: true,
                keys: ["symptoms"]
            };
            
            const fuse = new Fuse(results, options);
            
            let result = fuse.search(symptomItem);
            // console.log(result);
            result = result.filter(x => x.score < 0.2);
            
            for (let r in result) {
                if (symptomResults.indexOf(result[r].item) == -1) {
                    symptomResults.push(result[r].item);
                }
            }  
        }
    }
    
    // console.log(searchResults);
    // console.log(symptomResults);
    // consozle.log();
    
    
    if (diseases_list && !symptoms_list) return diseasesResults;
    if (symptoms_list && !diseases_list) return symptomResults;
    
    const out = diseasesResults.filter(value => symptomResults.includes(value));
    
    return out;
    
}

async function diseasesId(conn, diseaseId) {
    const diseases = await conn.select("*").from("Disease").where("disease_id", diseaseId);
    
    if (diseases.length == 0) {
        return [];
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
        })),
    };
}
