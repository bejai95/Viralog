const db = require("./database");
const { processArticle, findReports } = require("./article-processor");

function isEmpty(obj) { 
    for (var x in obj) { return false; }
    return true;
 }

/****************************************/
/*              Unit tests              */
/****************************************/
const testDiseases = {
    anthrax: { anthrax: 'anthrax' },
    'avian flu': {
      'avian flu': 'avian flu',
      avianflu: 'avian flu',
      H5N1: 'avian flu',
      'avian influenza': 'avian flu'
    },
    'hiv/aids': {
      HIV: 'hiv/aids',
      AIDS: 'hiv/aids',
      'human immunodeficiency virus': 'hiv/aids',
      'acquired immunodeficiency syndrome': 'hiv/aids'
    },
    hpv: { hpv: 'hpv', 'human papillomavirus infection': 'hpv' },
    legionnaire: {
      legionnaire: 'legionnaire',
      'legionella pneumonia': 'legionnaire',
      "Legionnaires' disease": 'legionnaire'
    },
  }

test("test_simple_report", async () => {
    let article = {
        headline: "Something around the world",
        date_of_publication: "Mar 15, 2022",
        author: "Alex",
        main_text: "We found a case of legionnaire in Thailand.",
        article_url: "www.a_standard_disease_site.com",
        category: "news"
    }
    let targetReport = {
        article_url: "www.a_standard_disease_site.com",
        disease_id: "legionnaire",
        event_date: "Mar 15, 2022",
        location: "Thailand"
    }

    let processed = await findReports(article, testDiseases);
    expect(processed.length).toBe(1)
    expect(JSON.stringify(targetReport)).toBe(JSON.stringify(processed[0]))
})

test("test_headline_report", async () => {
    let article = {
        headline: "legionnaire in Thailand",
        date_of_publication: "Mar 15, 2022",
        author: "Dan",
        main_text: "Actually, nothing to report here",
        article_url: "www.somethingworthworryingabout.com",
        category: "news",
    }
    let targetReport = {
        article_url: "www.somethingworthworryingabout.com",
        disease_id: "legionnaire",
        event_date: "Mar 15, 2022",
        location: "Thailand"
    }

    let processed = await findReports(article, testDiseases);
    expect(processed.length).toBe(1)
    expect(JSON.stringify(targetReport)).toBe(JSON.stringify(processed[0]))
})

test("test_no_reports", async () => {
    let article = {
        headline: "Not much in the world",
        date_of_publication: "Mar 15, 2022",
        author: "Dan",
        main_text: "Yep, nothing to report here",
        article_url: "www.somethingworthworryingabout.com",
        category: "news",
    }

    let processed = await findReports(article, testDiseases);
    expect(processed.length).toBe(0)
})

test("test_using_aliases", async () => {
    let article = {
        headline: "Something around the world",
        date_of_publication: "Mar 15, 2022",
        author: "Alex",
        main_text: "We found a case of legionella pneumonia in Thailand.",
        article_url: "www.a_standard_disease_site.com",
        category: "news"
    }
    let targetReport = {
        article_url: "www.a_standard_disease_site.com",
        disease_id: "legionnaire",
        event_date: "Mar 15, 2022",
        location: "Thailand"
    }

    let processed = await findReports(article, testDiseases);
    expect(processed.length).toBe(1)
    expect(JSON.stringify(targetReport)).toBe(JSON.stringify(processed[0]))
})

test("test_multiple_reports", async () => {
    let article = {
        headline: "Something around the world",
        date_of_publication: "Mar 15, 2022",
        author: "Alex",
        main_text: "We found a case of legionnaire in Thailand. Also someone may have hiv/aids in Australia",
        article_url: "www.a_standard_disease_site.com",
        category: "news"
    }

    let targets = {
        Thailand: {
            article_url: "www.a_standard_disease_site.com",
            disease_id: "legionnaire",
            event_date: "Mar 15, 2022",
            location: "Thailand"
        },
        Australia: {
            article_url: "www.a_standard_disease_site.com",
            disease_id: "hiv/aids",
            event_date: "Mar 15, 2022",
            location: "Australia"
        }
    }
    let processed = await findReports(article, testDiseases);
    expect(processed.length).toBe(2);
    for (let i = 0; i < processed.length; i++) {
        expect(JSON.stringify(targets[processed[i].location])).toBe(JSON.stringify(processed[i]))
        delete targets[processed[i].location]
    }
    expect(isEmpty(targets)).toBe(true)
})

test("test_multiple_reports_different_aliases", async () => {
    let article = {
        headline: "Something around the world",
        date_of_publication: "Mar 15, 2022",
        author: "Alex",
        main_text: "We found a case of legionella pneumonia in Thailand. Don't forget that someone in the United States has AIDS. Sudden resurgence of human papillomavirus infection in England.",
        article_url: "www.a_standard_disease_site.com",
        category: "news"
    }

    let targets = {
        Thailand: {
            article_url: "www.a_standard_disease_site.com",
            disease_id: "legionnaire",
            event_date: "Mar 15, 2022",
            location: "Thailand"
        },
        'United States': {
            article_url: "www.a_standard_disease_site.com",
            disease_id: "hiv/aids",
            event_date: "Mar 15, 2022",
            location: "United States"
        },
        England: {
            article_url: "www.a_standard_disease_site.com",
            disease_id: "hpv",
            event_date: "Mar 15, 2022",
            location: "England"
        }
    }
    let processed = await findReports(article, testDiseases);
    expect(processed.length).toBe(3);
    for (let i = 0; i < processed.length; i++) {
        expect(JSON.stringify(targets[processed[i].location])).toBe(JSON.stringify(processed[i]))
        delete targets[processed[i].location]
    }
    expect(isEmpty(targets)).toBe(true)
})

/****************************************/
/*           Integration tests          */
/****************************************/
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
    let article = {};

    try {
        let processed = await processArticle(conn, article);
        expect(true).toBe(false);
    } catch (e) {
        expect(e).toBe("Missing field(s) from parameter 'article'");
    }

});

test("test_article_invalid_article_some_missing_params", async () => {
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
        headline: "Some article",
        article_url: "www.raise_exception.com",
        author: "Marty",
        main_text: "Oh no there's no reports this week.",
        date_of_publication: "Mar 12 20202020"
        // missing category
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
        disease_id: "plague",
        event_date: "Mar 14, 2022",
        location: "Thailand",
    };
    expect(JSON.stringify(processed[0])).toBe(JSON.stringify(expected));

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
    let targets = {
        Thailand: {
            article_url: "www.something.com",
            disease_id: "plague",
            event_date: "Mar 14, 2022",
            location: "Thailand",
        },
        Australia: {
            article_url: "www.something.com",
            disease_id: "COVID-19",
            event_date: "Mar 14, 2022",
            location: "Australia",
        }, 
        London: {
            article_url: "www.something.com",
            disease_id: "polio",
            event_date: "Mar 14, 2022",
            location: "London",
        }
    }

    // Ensure we have collected the right number of articles
    expect(processed.length).toBe(3);
    for (let i = 0; i < processed.length; i++) {
        expect(JSON.stringify(processed[i])).toBe(JSON.stringify(targets[processed[i].location]))
        delete targets[processed[i].location]
    }
    expect(isEmpty(targets)).toBe(true)
    await conn.destroy();
});

test("test_multiple_reports_different_aliases_db", async () => {
    let conn;
    try {
        conn = await db.createConnectionPool();
    } catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
        return;
    }    

    let article = {
        headline: "Something around the world",
        date_of_publication: "Mar 15, 2022",
        author: "Alex",
        main_text: "We found a case of legionella pneumonia in Thailand. Don't forget that someone in the United States has AIDS. Sudden resurgence of human papillomavirus infection in England.",
        article_url: "www.a_standard_disease_site.com",
        category: "news"
    }

    let targets = {
        Thailand: {
            article_url: "www.a_standard_disease_site.com",
            disease_id: "legionnaire",
            event_date: "Mar 15, 2022",
            location: "Thailand"
        },
        'United States': {
            article_url: "www.a_standard_disease_site.com",
            disease_id: "hiv/aids",
            event_date: "Mar 15, 2022",
            location: "United States"
        },
        England: {
            article_url: "www.a_standard_disease_site.com",
            disease_id: "hpv",
            event_date: "Mar 15, 2022",
            location: "England"
        }
    }
    let processed = await processArticle(conn, article);
    expect(processed.length).toBe(3);
    for (let i = 0; i < processed.length; i++) {
        expect(JSON.stringify(targets[processed[i].location])).toBe(JSON.stringify(processed[i]))
        delete targets[processed[i].location]
    }

    expect(isEmpty(targets)).toBe(true)
    await conn.destroy()

})