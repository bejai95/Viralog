"use strict";

const db = require("./database");
const scraper = require("./scraper");
const processor = require("./article-processor");

async function scrape() {
    let conn;

    try {
        conn = conn || await db.createConnectionPool();
    }
    catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
        return;
    }

    console.log("Scraping...");

    // const articles = [];
    // try {
    //     await scraper.scrape(parseInt(process.argv[2]) || 1,
    //         article => articles.push(article)
    //     );

    //     console.log("Successfully scraped CIDRAP pages...");
    // }
    // catch (error) {
    //     console.log("Failed to scrape CIDRAP.");
    //     console.log(error);
    // }

    for (let i = 0; i < 1 /*articles.length*/; i++) {
        let reports = await processor.processArticle(conn, {
            title: "China's Omicron COVID-19 surge gains steam",
            date: "Mar 14, 2022",
            author: "Lisa Schnirring | News Editor | CIDRAP News",
            body: "A steadily growing COVID-19 outbreak in China amid the country's strict \"zero COVID\" policy has triggered lockdowns in multiple locations along with key factory closures that are starting to dampen the country's economy. In US developments, all COVID-19 measures continue to decline as scientists closely assess if an extra booster is needed to tackle future waves. China's lockdown steps hit financial sector In quickly evolving developments in China, the country reported 2,125 locally acquired cases today, which includes 1,337 symptomatic and 788 asymptomatic infections, according to the National Health Commission. The country's cases started creeping upward at the end of February and are now at their highest level in 2 years. About half of the daily cases are from Jilin province in the northeast, one of the country's main hot spots. Provincial officials have ordered travel restrictions for the cities of Changchun, which has multiple automobile factories, and Jilin City and are conducting mass testing and building more field hospitals, according to Xinhua, China's state news agency. Another hot spot is Shenzhen, a key technology and industrial center in Guangdong province in the south. The city's population of about 17.5 million is on a weeklong lockdown, and officials have announced rounds of mass testing, according to Bloomberg News, which said the measures have slowed or stopped operations at companies such as Foxconn, which makes components for Apple iPhones. In Shanghai, another key financial area, an ongoing outbreak has shuttered schools, triggered rounds of mass testing, and advised against people leaving the city, according to CNBC. Meanwhile, Hong Kong's surge continues, with 26,908 new cases today, and city officials said they don't expect to impose new restrictions, because there aren't many more ways to tighten them, according to Reuters. Over the past few days, daily deaths have approached 300, a very high rate compared with other developed countries that experts suspect may be partly related to low vaccination levels in older people. Elsewhere, South Korea's daily cases have exceeded 300,000 for the past 3 days, according to Yonhap News, which said the main hot spots include Seoul, surrounding Gyeonggi province, and the western port city Incheon. Health officials are deemphasizing contact tracing in order to focus on preventing severe disease and deaths, and they announced that children ages 5 to 11 will be eligible for vaccination starting on Mar 31. US markers continue steady decline. In the United States, meanwhile, the 7-day average for new cases is 35,418, with daily deaths averaging 1,323, according to a Washington Post analysis. Over the past week, cases fell by 19%, hospitalizations declined by 22%, and deaths dropped by 14%."
        });
        // let reports = await processor.processArticle(conn, articles[i]);
    }

    conn.destroy();
    console.log("Done!");
}

scrape();
