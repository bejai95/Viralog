exports.articles = async function (
    conn,
    period_of_interest_start,
    period_of_interest_end,
    key_terms,
    location,
    sources
) {
    const articles = await conn
        .select(
            "Article.article_id",
            "Article.article_url",
            "Article.date_of_publication",
            "Article.headline",
            "Article.main_text",
            "Article.category",
            "Article.author",
            "Article.source",
        )
        .from("Article")
        .where("date_of_publication", ">=", period_of_interest_start)
        .where("date_of_publication", "<=", period_of_interest_end)
        .modify((queryBuilder) => {
            if (sources && sources != "") {
                const sourcesList = sources.split(",");
                queryBuilder.whereIn("Article.source", sourcesList);
            }
        });
    const results = [];

    const symptoms = await getDiseaseSymptoms(conn);

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const reportsResult = [];

        const reportRecords = await conn
            .select(
                "Report.disease_id",
                "Disease.name as disease",
                "Report.event_date as date",
                "Report.location",
                "Report.lat",
                "Report.long"
            )
            .from("Report")
            .where("Report.article_id", "=", article.article_id)
            .modify((queryBuilder) => {
                if (location && location != "") {
                    const locations = location.split(",");
                    queryBuilder.whereIn("location", locations);
                }
            })
            .join("Disease", "Report.disease_id", "=", "Disease.disease_id");

        let keyTermCount = 0;
        for (let i = 0; i < reportRecords.length; i++) {
            const reportRecord = reportRecords[i];
            reportsResult.push({
                diseases: [reportRecord.disease],
                syndromes: symptoms[reportRecord.disease_id],
                event_date: reportRecord.date,
                location: {
                    location: reportRecord.location,
                    lat: reportRecord.lat,
                    long: reportRecord.long,
                }
            });
            if (key_terms.includes(reportRecord.disease)) {
                keyTermCount++;
            }
        }

        // Only show article if it has 1 or more reports.
        if (reportRecords.length > 0 && (key_terms.length == 0 || keyTermCount > 0)) {
            results.push({
                article_id: article.article_id,
                url: article.article_url,
                date_of_publication: article.date_of_publication,
                headline: article.headline,
                main_text: article.main_text,
                reports: reportsResult,
                category: article.category,
                author: article.author,
                source: article.source,
            });
        }
    }

    return results;
};

exports.reports = async function (
    conn,
    period_of_interest_start,
    period_of_interest_end,
    key_terms,
    location
) {
    // Search query here, key_terms and sources may be empty
    const reportRecords = await conn
        .select(
            "Report.report_id",
            "Report.disease_id",
            "Disease.name as disease",
            "Report.event_date as date",
            "Report.location",
            "Report.lat",
            "Report.long",
            "Report.article_id",
            "Article.article_url",
            "Article.headline",
        )
        .from("Report")
        .modify((queryBuilder) => {
            if (key_terms && key_terms != "") {
                const diseases = key_terms.split(",");
                queryBuilder.whereIn("Report.disease_id", diseases);
            }
        })
        .modify((queryBuilder) => {
            if (location && location != "") {
                const locations = location.split(",");
                queryBuilder.whereIn("location", locations);
            }
        })
        .where("Report.event_date", ">=", period_of_interest_start)
        .where("Report.event_date", "<=", period_of_interest_end)
        .join("Disease", "Report.disease_id", "=", "Disease.disease_id")
        .join("Article", "Article.article_id", "=", "Report.article_id");

    const symptoms = await getDiseaseSymptoms(conn);

    const results = [];
    for (let i = 0; i < reportRecords.length; i++) {
        const reportRecord = reportRecords[i];
        results.push({
            report_id: reportRecord.report_id,
            disease_id: reportRecord.disease_id,
            diseases: [reportRecord.disease],
            syndromes: symptoms[reportRecord.disease_id],
            event_date: reportRecord.date,
            location: {
                location: reportRecord.location,
                lat: reportRecord.lat,
                long: reportRecord.long,
            },
            article_id: reportRecord.article_id,
            article_url: reportRecord.article_url,
            headline: reportRecord.headline,
        });
    }

    return results;
};

exports.predictions = async function (conn, minReportCount, dayCount) {
    let currDate = new Date();
    currDate.setDate(currDate.getDate() - dayCount);

    let results = await conn
        .select("*")
        .from("Report")
        .where("event_date", ">", formatDate(currDate))
        .orderBy(["disease_id", "location"]);

    // Put results into an object indexed by disease name
    let collatedResults = {};
    for (let i = 0; i < results.length; i++) {
        if (!(results[i].disease_id in collatedResults)) {
            collatedResults[results[i].disease_id] = {
                disease: results[i].disease_id,
                reports: [],
            };
        }
        collatedResults[results[i].disease_id].reports.push(results[i]);
    }

    // Add the threshold into each item
    let returnRes = [];
    for (let key in collatedResults) {
        let item = collatedResults[key];
        if (item.reports.length > minReportCount) {
            item.report_count = item.reports.length;
            returnRes.push(item);
        }
    }
    return returnRes;
};

function formatDate(date) {
    return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
}

exports.logs = async function (
    conn,
    period_of_interest_start,
    period_of_interest_end,
    routes, status, team, ip
) {
    const logs = await conn
        .select("*")
        .from("Log")
        .modify(
            (queryBuilder) =>
                period_of_interest_start &&
                queryBuilder.where("timestamp", ">=", period_of_interest_start)
        )
        .modify(
            (queryBuilder) =>
                period_of_interest_end &&
                queryBuilder.where("timestamp", "<=", period_of_interest_end)
        )
        .modify(
            (queryBuilder) =>
                status && queryBuilder.where("status", "=", status)
        )
        .modify(
            (queryBuilder) =>
                ip && ip != "" && queryBuilder.where("ip", "=", ip)
        )
        .modify(
            (queryBuilder) =>
                team && team != "" && queryBuilder.where("team", "=", team)
        )
        .modify((queryBuilder) => {
            if (routes) {
                queryBuilder.whereIn("route", routes);
            }
        })
        .orderBy("timestamp", "desc");
    return logs;
};

exports.diseases = async function (
    conn,
    names
) {
    // Get diseases
    const diseases = await conn
        .select(
            "disease_id"
        )
        .from("Disease");

    // Get the alises of each disease
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
        let symptomCount = 0;  // could put this outside the loop for 'efficiency'
        while (symptomCount < symptoms.length) {
            if (symptoms[symptomCount]["disease_id"] == disease["disease_id"]) {
                symps.push(symptoms[symptomCount]["symptom"]);
            }
            symptomCount++;
        }

        // extract all aliases relating to the given disease
        const als = [];
        let aliasCount = 0;  // could put this outside the loop for 'efficiency'
        while (aliasCount < aliases.length) {
            if (aliases[aliasCount]["disease_id"] == disease["disease_id"]) {
                als.push(aliases[aliasCount]["alias"]);
            }
            aliasCount++;
        }
        
        results.push({
            disease_id: disease["disease_id"],
            disease_symptoms: symps,
            disease_aliases: als
        });
    }

    return results;
};

async function getDiseaseSymptoms(conn) {
    const symptomRecords = await conn
        .select("Disease.disease_id", "symptom")
        .from("Disease")
        .innerJoin("Symptom", "Symptom.disease_id", "Disease.disease_id");
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
