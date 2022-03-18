
exports.articles = async function(conn, period_of_interest_start, period_of_interest_end, key_terms, location) {

    const articles = await conn.select("Article.article_url", "Article.date_of_publication", "Article.headline", "Article.main_text").from("Article")
        .where("date_of_publication", ">=", period_of_interest_start)
        .where("date_of_publication", "<=", period_of_interest_end)
        .innerJoin("Report", "Report.article_url", "=", "Article.article_url")
        .modify(queryBuilder => {
            if (key_terms && key_terms != "") {
                const diseases = key_terms.split(",");
                queryBuilder.whereIn("Report.disease_id", diseases);
            }
        });
    const results = [];

    const symptoms = await getDiseaseSymptoms(conn);

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const reportsResult = [];
        
        const reportRecords = await conn.select("Report.disease_id", "Disease.name as disease", "Report.event_date as date", "Report.location").from("Report")
            .where("Report.article_url", "=", article.article_url)
            .modify(queryBuilder => {
                if (location && location != "") {
                    const locations = location.split(",");
                    queryBuilder.whereIn("location", locations);
                }
            })
            .join("Disease", "Report.disease_id", "=", "Disease.disease_id");

        for (let i = 0; i < reportRecords.length; i++) {
            const reportRecord = reportRecords[i];
            reportsResult.push({
                diseases: [reportRecord.disease],
                syndromes: symptoms[reportRecord.disease_id],
                event_date: reportRecord.date,
                location: reportRecord.location
            });
        }
        
        // Only show article if it has 1 or more reports.
        if (reportRecords.length > 0) {
            results.push({
                url: article.article_url,
                date_of_publication: article.date_of_publication,
                headline: article.headline,
                main_text: article.main_text,
                reports: reportsResult
            });
        }
    }

    return results;
};

exports.reports = async function(conn, period_of_interest_start, period_of_interest_end, key_terms, location) {
    // Search query here, key_terms and sources may be empty
    const reportRecords = await conn.select("Report.disease_id", "Disease.name as disease", "Report.event_date as date", "Report.location").from("Report")
        .modify(queryBuilder => {
            if (key_terms && key_terms != "") {
                const diseases = key_terms.split(",");
                queryBuilder.whereIn("Report.disease_id", diseases);
            }
        })
        .modify(queryBuilder => {
            if (location && location != "") {
                const locations = location.split(",");
                queryBuilder.whereIn("location", locations);
            }
        })
        .where("Report.event_date", ">=", period_of_interest_start)
        .where("Report.event_date", "<=", period_of_interest_end)
        .join("Disease", "Report.disease_id", "=", "Disease.disease_id");

    const symptoms = await getDiseaseSymptoms(conn);

    const results = [];
    for (let i = 0; i < reportRecords.length; i++) {
        const reportRecord = reportRecords[i];
        results.push({
            diseases: [reportRecord.disease],
            syndromes: symptoms[reportRecord.disease_id],
            event_date: reportRecord.date,
            location: reportRecord.location
        });
    }

    return results;
};

exports.predictions = async function(conn, threshold) {
    return [];
};

exports.logs = async function(conn, period_of_interest_start, period_of_interest_end, team) {
    const logs = await conn.select("*").from("Log")
        .modify(queryBuilder => period_of_interest_start &&
            queryBuilder.where("timestamp", ">=", period_of_interest_start)
        )
        .modify(queryBuilder => period_of_interest_end &&
            queryBuilder.where("timestamp", "<=", period_of_interest_end)
        )
        .modify(queryBuilder => team && team != "" &&
            queryBuilder.where("team", "=", team)
        );
    return logs;
};

async function getDiseaseSymptoms(conn) {
    const symptomRecords = await conn.select("Disease.disease_id", "symptom").from("Disease").innerJoin("Symptom", "Symptom.disease_id", "Disease.disease_id");
    const diseaseSymptoms = {};
    for (let i = 0; i < symptomRecords.length; i++) {
        const record = symptomRecords[i];
        if (diseaseSymptoms[record.disease_id] == null) {
            diseaseSymptoms[record.disease_id] = [];
        }

        diseaseSymptoms[record.disease_id].push(record.symptom);
    }
    return diseaseSymptoms;
}
