const db = require("./database");
const { processArticle } = require("./article-processor");

const somefunc = async () => {

    let conn;
    try {
        conn = await db.createConnectionPool();
    } catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
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
    
    await conn.destroy();
}

somefunc().then(() => console.log("Something"))