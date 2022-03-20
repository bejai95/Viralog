const request = require("supertest");

const {
    app,
    handleReports,
    handleArticles,
    handlePredictions,
    handleLogs,
} = require("../server.js");


describe("Reports Endpoint", () => {
    test("Succesful request with 1 item", (done) => {
        request(app)
        .get("/reports")
        .set("Content-Type", "application/json")
        .query({
            period_of_interest_start: "2022-03-13T12:21:21",
            period_of_interest_end: "2022-03-13T17:21:21",
            key_terms: "COVID-19",
            location: "China",
        })
        .send()
        .expect(200)
        .end((err, res) => {
            expect(res.body);
            expect(res.body).toEqual(routes_test_expected);
            done();
        });
        
    });

    test("No results", (done) => {
        request(app)
        .get("/reports")
        .set("Content-Type", "application/json")
        .query({
            period_of_interest_start: "2020-03-13T12:21:21",
            period_of_interest_end: "2022-03-13T17:21:21",
            key_terms: "COVID-18",
            location: "China",
        })
        .expect(200)
        .end((err, res) => {
            expect(res.body).toEqual([]);
            done();
        });
    });

    test("Date in wrong format", (done) => {
        request(app)
        .get("/reports")
        .set("Content-Type", "application/json")
        .query({
            period_of_interest_start: "2023-03-13T12:21:21",
            period_of_interest_end: "2022-03-13T17:21:21",
            key_terms: "COVID-19",
            location: "China",
        })
        .expect(400)
        .send()
        .end((err, res) => {
            expect(res.body["message"]).toEqual("Invalid timestamp for 'period_of_interest_end', must be after 'period_of_interest_start'");
            expect(res.body["status"]).toEqual(400);
            done();
        });
    });
});

describe("Articles Endpoint", () => {
    test("Succesful request with 1 item", (done) => {
        request(app)
        .get("/articles")
        .set("Content-Type", "application/json")
        .query({
            period_of_interest_start: "2022-03-13T12:21:21",
            period_of_interest_end: "2022-03-13T17:21:21",
            key_terms: "COVID-19",
            location: "China",
        })
        .expect(200)
        .end((err, res) => {
            expect(res.body).toEqual(articles_test_expected);
            done();
        });
    });
});

describe("Logs Endpoint", () => {
    test("Successful log call", (done) => {
        request(app)
        .get("/logs")
        .set("Content-Type", "application/json")
        .query({
            period_of_interest_start: "2022-03-20T13:09:05",
            period_of_interest_end: "2022-03-20T13:09:05",
            key_terms: "COVID-19",
            location: "China",
        })
        .expect(200)
        .end((err, res) => {
            expect(res.body).toEqual(logs_test_expected);
            done();
        });
    });
});

describe("Predictions Endpoint", () => {
    test("Succesful request with 1 item", (done) => {
        request(app)
        .get("/predictions")
        .set("Content-Type", "application/json")
        .query({
            min_reported_cases: 8,
            day_count: 4,
        })
        .expect(200)
        .end((err, res) => {
            expect(res.body).toEqual(predictions_test_expected);
            done();
        });
    });
} )

const routes_test_expected = [
    {
       "diseases":[
          "COVID-19"
       ],
       "event_date":"2022-03-13T13:00:00",
       "location":"China",
       "syndromes":[
          "Acute respiratory syndrome",
          "fever",
          "cough",
          "fatigue",
          "shortness of breath",
          "vomiting",
          "loss of taste",
          "loss of smell"
       ]
    }
]

const articles_test_expected = [
    {
      "url": "https://www.cidrap.umn.edu/news-perspective/2022/03/chinas-omicron-covid-19-surge-gains-steam",
      "date_of_publication": "2022-03-13T13:00:00",
      "headline": "China's Omicron COVID-19 surge gains steam",
      "main_text": "A steadily growing COVID-19 outbreak in China amid the country's strict \"zero COVID\" policy has triggered lockdowns in multiple locations along with key factory closures that are starting to dampen the country's economy.In US developments, all COVID-19 measures continue to decline as scientists closely assess if an extra booster is needed to tackle future waves.China's lockdown steps hit financial sectorIn quickly evolving developments in China, the country reported 2,125 locally acquired cases today, which includes 1,337 symptomatic and 788 asymptomatic infections, according to the National Health Commission.The country's cases started creeping upward at the end of February and are now at their highest level in 2 years.About half of the daily cases are from Jilin province in the northeast, one of the country's main hot spots. Provincial officials have ordered travel restrictions for the cities of Changchun, which has multiple automobile factories, and Jilin City and are conducting mass testing and building more field hospitals, according to Xinhua, China's state news agency.Another hot spot is Shenzhen, a key technology and industrial center in Guangdong province in the south. The city's population of about 17.5 million is on a weeklong lockdown, and officials have announced rounds of mass testing, according to Bloomberg News, which said the measures have slowed or stopped operations at companies such as Foxconn, which makes components for Apple iPhones.In Shanghai, another key financial area, an ongoing outbreak has shuttered schools, triggered rounds of mass testing, and advised against people leaving the city, according to CNBC.Meanwhile, Hong Kong's surge continues, with 26,908 new cases today, and city officials said they don't expect to impose new restrictions, because there aren't many more ways to tighten them, according to Reuters. Over the past few days, daily deaths have approached 300, a very high rate compared with other developed countries that experts suspect may be partly related to low vaccination levels in older people.Elsewhere, South Korea's daily cases have exceeded 300,000 for the past 3 days, according to Yonhap News, which said the main hot spots include Seoul, surrounding Gyeonggi province, and the western port city Incheon. Health officials are deemphasizing contact tracing in order to focus on preventing severe disease and deaths, and they announced that children ages 5 to 11 will be eligible for vaccination starting on Mar 31.US markers continue steady declineIn the United States, meanwhile, the 7-day average for new cases is 35,418, with daily deaths averaging 1,323, according to a Washington Post analysis. Over the past week, cases fell by 19%, hospitalizations declined by 22%, and deaths dropped by 14%.In other US developments:Former President Barack Obama yesterday announced that he tested positive for COVID-19, though being fully vaccinated and boosted, and has mild symptoms, including a scratchy throat.Pfizer's CEO Albert Bourla on Face the Nation yesterday said he thinks a fourth vaccine dose will be necessary and that the company will be submitting data on the extra dose to the Food and Drug Administration (FDA). Regarding vaccine trials results for children younger than 5, he said he hopes the company will be able to submit data to the FDA in April, possibly making vaccine available in May.The Biden Administration has signaled that it wants a federal COVID-19 tracking system that began early in the pandemic to track how other respiratory viruses and infectious diseases are affecting patients and hospital resources, according to Reuters.",
      "reports": [
        {
          "diseases": [
            "COVID-19"
          ],
          "syndromes": [
            "Acute respiratory syndrome",
            "fever",
            "cough",
            "fatigue",
            "shortness of breath",
            "vomiting",
            "loss of taste",
            "loss of smell"
          ],
          "event_date": "2022-03-13T13:00:00",
          "location": "China"
        }
      ]
    }
  ]

const logs_test_expected = [
    {
      "id": 389,
      "status": 200,
      "route": "/reports",
      "req_params": "{\"period_of_interest_start\":\"2020-03-13T12:21:21\",\"period_of_interest_end\":\"2022-03-13T17:21:21\",\"key_terms\":\"COVID-18\",\"location\":\"China\"}",
      "timestamp": "2022-03-20T13:09:05",
      "message": "success",
      "ip": "::ffff:127.0.0.1",
      "team": "Team QQ"
    },
    {
      "id": 390,
      "status": 400,
      "route": "/reports",
      "req_params": "{\"period_of_interest_start\":\"2023-03-13T12:21:21\",\"period_of_interest_end\":\"2022-03-13T17:21:21\",\"key_terms\":\"COVID-19\",\"location\":\"China\"}",
      "timestamp": "2022-03-20T13:09:05",
      "message": "Invalid timestamp for 'period_of_interest_end', must be after 'period_of_interest_start'",
      "ip": "::ffff:127.0.0.1",
      "team": "Team QQ"
    },
    {
      "id": 391,
      "status": 200,
      "route": "/articles",
      "req_params": "{\"period_of_interest_start\":\"2022-03-13T12:21:21\",\"period_of_interest_end\":\"2022-03-13T17:21:21\",\"key_terms\":\"COVID-19\",\"location\":\"China\"}",
      "timestamp": "2022-03-20T13:09:05",
      "message": "success",
      "ip": "::ffff:127.0.0.1",
      "team": "Team QQ"
    },
    {
      "id": 392,
      "status": 200,
      "route": "/logs",
      "req_params": "{\"period_of_interest_start\":\"2022-03-13T12:21:21\",\"period_of_interest_end\":\"2022-03-13T17:21:21\",\"key_terms\":\"COVID-19\",\"location\":\"China\"}",
      "timestamp": "2022-03-20T13:09:05",
      "message": "success",
      "ip": "::ffff:127.0.0.1",
      "team": "Team QQ"
    }
  ]

const predictions_test_expected = [
    {
      "disease": "COVID-19",
      "reports": [
        {
          "report_id": 24,
          "event_date": "2022-03-06T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/experts-map-out-new-normal-us-enters-third-pandemic-year",
          "location": "America"
        },
        {
          "report_id": 32,
          "event_date": "2022-03-01T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/test-treat-variant-vaccines-part-new-federal-covid-19-plan",
          "location": "America"
        },
        {
          "report_id": 20,
          "event_date": "2022-03-07T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/who-lays-out-plan-covid-vaccines-tackle-new-variants",
          "location": "Asia—"
        },
        {
          "report_id": 5,
          "event_date": "2022-03-15T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/twice-many-black-covid-patients-deemed-lowest-priority-icu-triage-system",
          "location": "Boston"
        },
        {
          "report_id": 10,
          "event_date": "2022-03-14T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/study-highlights-risk-low-covid-vaccine-uptake-prison-staff",
          "location": "California"
        },
        {
          "report_id": 12,
          "event_date": "2022-03-10T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/chinese-provincial-capital-locks-down-countrys-covid-cases-rise",
          "location": "China"
        },
        {
          "report_id": 9,
          "event_date": "2022-03-13T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/chinas-omicron-covid-19-surge-gains-steam",
          "location": "China"
        },
        {
          "report_id": 11,
          "event_date": "2022-03-14T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/chinas-covid-19-cases-double-other-nations-eye-resurgences",
          "location": "China"
        },
        {
          "report_id": 27,
          "event_date": "2022-03-06T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/health-groups-press-more-wildlife-sars-cov-2-tracking",
          "location": "China"
        },
        {
          "report_id": 41,
          "event_date": "2022-02-22T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/global-covid-19-cases-fall-except-asian-hot-spots",
          "location": "Egypt Kenya Nigeria Senegal South Africa"
        },
        {
          "report_id": 22,
          "event_date": "2022-03-02T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/third-vaccine-dose-boosts-omicron-protection-some-waning",
          "location": "England"
        },
        {
          "report_id": 38,
          "event_date": "2022-02-24T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/cdc-eases-covid-19-mask-guidance-adds-metrics-future-use",
          "location": "Hawaii"
        },
        {
          "report_id": 43,
          "event_date": "2022-02-21T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/hong-kong-harness-mass-testing-omicron-battle",
          "location": "Hong Kong"
        },
        {
          "report_id": 4,
          "event_date": "2022-03-15T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/severe-covid-19-tied-long-term-depression-anxiety",
          "location": "Iceland"
        },
        {
          "report_id": 31,
          "event_date": "2022-03-01T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/survival-after-hospital-cardiac-arrest-35-lower-covid-19-patients",
          "location": "Iowa"
        },
        {
          "report_id": 37,
          "event_date": "2022-02-24T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/studies-no-very-slight-risk-hearing-loss-after-covid-vaccine",
          "location": "Israel"
        },
        {
          "report_id": 29,
          "event_date": "2022-03-03T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/la-drops-mask-mandate-nfl-drops-covid-19-protocols",
          "location": "Los Angeles County"
        },
        {
          "report_id": 15,
          "event_date": "2022-03-09T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/study-third-covid-mrna-vaccine-dose-needed-against-omicron",
          "location": "Michigan"
        },
        {
          "report_id": 25,
          "event_date": "2022-03-03T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/covid-only-minnesota-hospitals-had-lower-death-rates",
          "location": "Minnesota"
        },
        {
          "report_id": 33,
          "event_date": "2022-02-28T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/polls-show-americans-less-worried-about-covid-19",
          "location": "New York"
        },
        {
          "report_id": 36,
          "event_date": "2022-02-27T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/more-mask-mandates-fall-poor-covid-vaccine-protection-noted-young-kids",
          "location": "New York"
        },
        {
          "report_id": 26,
          "event_date": "2022-03-02T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/asias-omicron-surges-soar-us-adds-technology-who-led-push",
          "location": "New Zealand"
        },
        {
          "report_id": 34,
          "event_date": "2022-03-01T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/global-covid-cases-deaths-drop-except-key-hot-spots",
          "location": "New Zealand"
        },
        {
          "report_id": 8,
          "event_date": "2022-03-10T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/kids-asthma-not-higher-risk-covid-19-study-finds",
          "location": "North Carolina"
        },
        {
          "report_id": 35,
          "event_date": "2022-02-28T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/dementia-patients-died-higher-rates-during-pandemic",
          "location": "Philadelphia"
        },
        {
          "report_id": 42,
          "event_date": "2022-02-23T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/us-officials-plan-next-pandemic-phase-vaccine-uptake-drops-globally",
          "location": "Russia"
        },
        {
          "report_id": 45,
          "event_date": "2022-02-21T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/3-covid-vaccine-doses-99-effective-against-omicron-delta-hospitalization",
          "location": "Southern California"
        },
        {
          "report_id": 6,
          "event_date": "2022-03-16T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/covid-19-cases-soar-asian-hot-spots-us-gets-new-covid-czar",
          "location": "South Korea"
        },
        {
          "report_id": 7,
          "event_date": "2022-03-15T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/global-covid-cases-rising-again",
          "location": "South Korea Vietnam Germany"
        },
        {
          "report_id": 17,
          "event_date": "2022-03-10T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/global-covid-19-deaths-may-be-3-times-higher-recorded",
          "location": "Sweden"
        },
        {
          "report_id": 30,
          "event_date": "2022-02-27T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/medical-oxygen-supplies-running-out-besieged-ukraine",
          "location": "Ukraine"
        },
        {
          "report_id": 40,
          "event_date": "2022-02-23T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/covid-19-pregnancy-tied-poor-birth-outcomes",
          "location": "United Kingdom"
        },
        {
          "report_id": 18,
          "event_date": "2022-03-09T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/covid-19-remains-high-uk-ba2-gains-ground",
          "location": "United Kingdom"
        },
        {
          "report_id": 1,
          "event_date": "2022-03-16T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/70-covid-survivors-uk-study-had-impaired-memory-focus",
          "location": "United Kingdom Ireland"
        },
        {
          "report_id": 19,
          "event_date": "2022-03-08T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/global-drop-covid-19-continues-cases-still-high",
          "location": "United States"
        },
        {
          "report_id": 3,
          "event_date": "2022-03-17T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/studies-show-vaccines-protect-against-serious-omicron-illness",
          "location": "United States"
        },
        {
          "report_id": 39,
          "event_date": "2022-02-22T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/mis-c-rare-covid-vaccinated-teens-study-finds",
          "location": "United States"
        },
        {
          "report_id": 44,
          "event_date": "2022-02-20T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/02/uk-unveils-game-plan-living-covid",
          "location": "United States"
        },
        {
          "report_id": 28,
          "event_date": "2022-03-02T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/rural-urban-disparities-seen-us-covid-19-vaccine-uptake",
          "location": "United States"
        },
        {
          "report_id": 21,
          "event_date": "2022-03-07T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/most-mrna-covid-vaccine-adverse-events-mild-transient",
          "location": "United States"
        },
        {
          "report_id": 23,
          "event_date": "2022-03-06T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/covid-deaths-vary-race-community-social-factors",
          "location": "Washington"
        },
        {
          "report_id": 16,
          "event_date": "2022-03-08T13:00:00",
          "disease_id": "COVID-19",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/mental-decline-seen-older-covid-patients-1-year-later",
          "location": "Wuhan China"
        }
      ],
      "threshold": 0.5833333333333334
    },
    {
      "disease": "polio",
      "reports": [
        {
          "report_id": 2,
          "event_date": "2022-03-17T13:00:00",
          "disease_id": "polio",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/new-polio-cases-africa-malawi-launches-vaccine-campaign",
          "location": "Nigeria"
        }
      ],
      "threshold": 0.03225806451612903
    },
    {
      "disease": "tuberculosis",
      "reports": [
        {
          "report_id": 13,
          "event_date": "2022-03-14T13:00:00",
          "disease_id": "tuberculosis",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/rsv-vaccine-could-cut-antimicrobial-use-infants",
          "location": "California"
        },
        {
          "report_id": 14,
          "event_date": "2022-03-10T13:00:00",
          "disease_id": "tuberculosis",
          "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/trial-supports-shorter-drug-regimen-kids-non-severe-tb",
          "location": "New"
        }
      ],
      "threshold": 0.0625
    }
  ]