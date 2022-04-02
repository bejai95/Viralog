"use strict";

const {
    findNull,
    findNotString,
    timeFormatCorrect,
    parseInteger,
    performError,
    createLog,
    getDiseaseSymptoms
} = require("../util");

exports.articles = async function(req, res, conn) {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!req.query) {
        return performError(conn, res, "/articles", 400,
            "Missing query parameters", req.query, ip);
    }
    const nullValue = findNull(req.query, [
        "period_of_interest_start", "period_of_interest_end",
        "key_terms", "location",
    ]);
    if (nullValue) {
        return performError(conn, res, "/articles", 400,
            `Missing parameter ${nullValue}`, req.query, ip );
    }

    const notString = findNotString(req.query, [
        "period_of_interest_start", "period_of_interest_end",
        "key_terms", "location", "sources",
    ]);
    if (notString) {
        return performError(conn, res, "/articles", 400,
            `${notString} must be a string`, req.query, ip);
    }

    if (req.query.period_of_interest_start &&
        !timeFormatCorrect(req.query.period_of_interest_start))
    {
        return performError(conn, res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_start', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }
    if (req.query.period_of_interest_end &&
        !timeFormatCorrect(req.query.period_of_interest_end))
    {
        return performError(conn, res, "/reports", 400,
            "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
            req.query, ip
        );
    }

    let limit = req.query.limit;
    if (limit) {
        limit = parseInt(limit);
        if (isNaN(limit) || !Number.isSafeInteger(limit)) {
            return performError(conn,
                res, "/articles", 400,
                "limit must be an integer",
                req.query,
                ip
            );
        }
    }

    try {
        const results = await articles(
            conn,
            req.query.period_of_interest_start,
            req.query.period_of_interest_end,
            req.query.key_terms,
            req.query.location,
            req.query.sources,
            limit,
            req.query.hideBody
        );

        createLog(conn, ip, "/articles", req.query, 200, "success");
        res.send(results);
    } catch (error) {
        console.log(error);
        return performError(conn, res, "/articles", 500,
            "An internal server error occurred. " + error,
            req.query, ip
        );
    }
};

exports.articlesId = async (req, res, conn) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    try {
        const results = await articlesId(conn, req.params.id);
        createLog(conn, ip, "/articles/" + req.params.id, req.query, 200, "success");
        res.send(results);
    } catch (error) {
        console.log(error);
        return performError(conn, res, "/articles/" + req.params.id, 500,
            "An internal server error occurred. " + error,
            req.params.id, ip
        );
    }
};

async function articles(
    conn,
    period_of_interest_start,
    period_of_interest_end,
    key_terms,
    location,
    sources,
    limit,
    hideBody
) {
    const selectCols = [
        "Article.article_id",
        "Article.article_url",
        "Article.date_of_publication",
        "Article.headline",
        "Article.category",
        "Article.author",
        "Article.source",
    ];
    if (hideBody == null) {
        selectCols.push("Article.main_text");
    }

    const articles = await conn
        .select(selectCols)
        .from("Article")
        .where("date_of_publication", ">=", period_of_interest_start)
        .where("date_of_publication", "<=", period_of_interest_end)
        .modify((queryBuilder) => {
            if (sources && sources != "") {
                const sourcesList = sources.split(",");
                queryBuilder.whereIn("Article.source", sourcesList);
            }
        })
        .modify((queryBuilder) => {
            if (limit) {
                queryBuilder.limit(limit);
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
                    lat: parseFloat(reportRecord.lat),
                    long: parseFloat(reportRecord.long),
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
}

async function articlesId(conn, article_id) {
    const article = await conn
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
        .where("Article.article_id", "=", article_id);

    const reportRecords = await conn
        .select(
            "Report.report_id",
            "Report.disease_id",
            "Disease.name as disease",
            "Report.event_date as date",
            "Report.location",
            "Report.lat",
            "Report.long"
        )
        .from("Report")
        .where("Report.article_id", "=", article_id)
        .join("Disease", "Report.disease_id", "=", "Disease.disease_id");

    const symptoms = await getDiseaseSymptoms(conn);

    let reportResult = [];

    for (let i = 0; i < reportRecords.length; i++) {
        const reportRecord = reportRecords[i];
        reportResult.push({
            report_id: reportRecord.report_id,
            diseases: [reportRecord.disease],
            syndromes: symptoms[reportRecord.disease_id],
            event_date: reportRecord.date,
            location: {
                location: reportRecord.location,
                lat: parseFloat(reportRecord.lat),
                long: parseFloat(reportRecord.long),
            }
        });
    }


    if (article.length == 0) {
        console.log("Error: article_id not found.");
    }

    const result = article[0];
    result["reports"] = reportResult;

    return result;
}
