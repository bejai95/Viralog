const db = require("./database");
const { processArticle } = require("./article-processor");


test("test_article_invalid_article_empty", async () => {
    let conn;
    try {
        conn = await db.createConnectionPool();
    } catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
        return;
    }

    // Creating dummy article with missing params
    let article = {
        headline: "Something in Thailand",
        date_of_publication: "Mar 14, 2022",
    };
    try {
        let processed = await processArticle(conn, article);
        expect(true).toBe(false);
    } catch (e) {
        expect(e).toBe("Missing field(s) from parameter 'article'");
    }

});

test("test_article_processing_one_report", async () => {
    let conn;
    try {
        conn = await db.createConnectionPool();
    } catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
        return;
    }
    let article = {
        headline: "Something in Thailand",
        date_of_publication: "Mar 14, 2022",
        author: "Lynn",
        main_text: "There are reports of the black death in Thailand",
        article_url: "www.something.com",
        category: "News",
    };
    let processed = await processArticle(conn, article);
    expect(processed.length).toBe(1);

    let expected = {
        article_url: "www.something.com",
        disease_id: "covid",
        event_date: "Mar 14, 2022",
        location: "Australia",
    };
    expect(JSON.stringify(processed[0]) == JSON.stringify(expected));

    await conn.destroy();
});

test("test_article_processing_multiple_reports", async () => {
    let conn;
    try {
        conn = await db.createConnectionPool();
    } catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
        return;
    }

    // Set up dummy article
    let article = {
        headline: "Something all over!",
        date_of_publication: "Mar 14, 2022",
        author: "Lynn",
        main_text:
            "There are reports of the black death in Thailand. And COVID in Australia. Watch out for London as they have polio",
        article_url: "www.something.com",
        category: "News",
    };

    // Get result of processing
    let processed = await processArticle(conn, article);

    // Set up our expected reports
    let thai_expected = {
        article_url: "www.something.com",
        disease_id: "bubonic_plague",
        event_date: "Mar 14, 2022",
        location: "Thailand",
    };
    let aus_expected = {
        article_url: "www.something.com",
        disease_id: "covid",
        event_date: "Mar 14, 2022",
        location: "Australia",
    };
    let lon_expected = {
        article_url: "www.something.com",
        disease_id: "polio",
        event_date: "Mar 14, 2022",
        location: "London",
    };

    // Ensure we have collected the right number of articles
    expect(processed.length).toBe(3);

    // Ensure all locations and diseases are different
    expect(
        processed[0].disease_id == processed[1].disease_id ||
            processed[0].location == processed[1].location
    ).toBe(false);
    expect(
        processed[0].disease_id == processed[2].disease_id ||
            processed[0].location == processed[2].location
    ).toBe(false);
    expect(
        processed[1].disease_id == processed[2].disease_id ||
            processed[1].location == processed[2].location
    ).toBe(false);

    // Ensure we have correctly converted from article to report
    for (let item in processed) {
        if (item.location === "London")
            expect(JSON.stringify(lon_expected) == JSON.stringify(item)).toBe(
                true
            );
        if (item.location === "Australia")
            expect(JSON.stringify(aus_expected) == JSON.stringify(item)).toBe(
                true
            );
        if (item.location === "Thailand")
            expect(JSON.stringify(thai_expected) == JSON.stringify(item)).toBe(
                true
            );
    }
    await conn.destroy();
});
