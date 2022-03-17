const db = require("./database");
const { processArticle } = require("./article-processor");

// test("Test we upload disease data correctly", async () => {
//     let conn;
//     try {
//         conn = await db.createConnectionPool();
//     } catch (error) {
//         console.log("Failed to connect to database.");
//         console.log(error);
//         return;
//     }

//     const standardList = Object.keys(diseases);

//     // Test the symptoms
//     const dbList = await conn.select("*").from("Disease");
//     console.log(standardList);
//     for (let i = 0; i < dbList.length; i++) {
//         console.log(dbList[i].disease_id);
//         expect(standardList.includes(dbList[i].disease_id)).toBe(true);
//     }

//     await conn.destroy();
// });

test("processArticle", async () => {
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
        date: "Mar 14, 2022",
        author: "Lynn",
        main_text: "There are reports of the black death in Thailand",
        article_url: "www.something.com",
        category: "News",
    };
    let processed = await processArticle(conn, article);
    console.log(processed);
    await conn.destroy();
});
