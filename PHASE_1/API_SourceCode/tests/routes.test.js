const request = require("supertest");

const { app, closeConnections } = require("../app.js");

afterAll(async () => {
  await closeConnections();
});

describe("Reports Endpoint", () => {
  test("Succesful request with 1 item", (done) => {
    request(app)
      .get("/reports")
      .set("Content-Type", "application/json")
      .query({
        period_of_interest_start: "2022-03-13T13:00:00",
        period_of_interest_end: "2022-03-13T13:00:01",
        key_terms: "COVID-19",
        location: "China",
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body).toEqual(reports_test_expected);
        done();
      });

  });

  test("No results", (done) => {
    request(app)
      .get("/reports")
      .set("Content-Type", "application/json")
      .query({
        period_of_interest_start: "2017-03-13T12:21:21",
        period_of_interest_end: "2017-03-13T12:21:22",
        key_terms: "COVID-18",
        location: "China",
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body).toEqual([]);
        done();
      });
  });

  test("Date in wrong order", (done) => {
    request(app)
      .get("/reports")
      .set("Content-Type", "application/json")
      .query({
        period_of_interest_start: "2022-03-13T12:21:21",
        period_of_interest_end: "2020-02-13T12:21:21",
        key_terms: "COVID-19",
        location: "China",
      })
      .expect(400)
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
        period_of_interest_start: "2020-03-13T12:21:21",
        period_of_interest_end: "2022-03-13X17:21:21",
        key_terms: "COVID-19",
        location: "China",
      })
      .expect(400)
      .end((err, res) => {
        expect(res.body["message"]).toEqual("Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'");
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
        period_of_interest_end: "2022-03-13T13:09:06",
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
        period_of_interest_start: "2022-03-31T02:26:57",
        period_of_interest_end: "2022-03-31T02:26:57",
        key_terms: "COVID-19",
        location: "China,Australia",
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
        min_report_count: 1,
        day_count: 5,
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body).toEqual(predictions_test_expected);
        done();
      });
  });
});

const reports_test_expected = [
  {
    "report_id": 33,
    "disease_id": "COVID-19",
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
    "location": {
      "location": "China",
      "lat": "35.86",
      "long": "104.20"
    },
    "article_id": 44,
    "article_url": "https://www.cidrap.umn.edu/news-perspective/2022/03/chinas-omicron-covid-19-surge-gains-steam",
    "headline": "China's Omicron COVID-19 surge gains steam"
  }
];

const articles_test_expected = [
  {
    "article_id": 44,
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
        "location": {
          "location": "China",
          "lat": "35.86",
          "long": "104.20"
        }
      }
    ],
    "category": "COVID-19",
    "author": "Lisa Schnirring | News Editor | CIDRAP News",
    "source": "CIDRAP"
  }
];

const logs_test_expected = [
  {
    "id": 105,
    "status": 200,
    "route": "/reports",
    "req_params": "{\"period_of_interest_start\":\"2017-03-13T12:21:21\",\"period_of_interest_end\":\"2017-03-13T12:21:22\",\"key_terms\":\"COVID-18\",\"location\":\"China\"}",
    "timestamp": "2022-03-31T02:26:57",
    "message": "success",
    "ip": "::ffff:127.0.0.1",
    "team": "Team QQ"
  },
  {
    "id": 106,
    "status": 200,
    "route": "/reports",
    "req_params": "{\"period_of_interest_start\":\"2022-03-13T12:21:21\",\"period_of_interest_end\":\"2020-02-13T12:21:21\",\"key_terms\":\"COVID-19\",\"location\":\"China\"}",
    "timestamp": "2022-03-31T02:26:57",
    "message": "success",
    "ip": "::ffff:127.0.0.1",
    "team": "Team QQ"
  },
  {
    "id": 107,
    "status": 400,
    "route": "/reports",
    "req_params": "{\"period_of_interest_start\":\"2020-03-13T12:21:21\",\"period_of_interest_end\":\"2022-03-13X17:21:21\",\"key_terms\":\"COVID-19\",\"location\":\"China\"}",
    "timestamp": "2022-03-31T02:26:57",
    "message": "Invalid timestamp for 'period_of_interest_end', must be in format 'yyyy-MM-ddTHH:mm:ss'",
    "ip": "::ffff:127.0.0.1",
    "team": "Team QQ"
  },
  {
    "id": 108,
    "status": 200,
    "route": "/articles",
    "req_params": "{\"period_of_interest_start\":\"2022-03-13T12:21:21\",\"period_of_interest_end\":\"2022-03-13T13:09:06\",\"key_terms\":\"COVID-19\",\"location\":\"China\"}",
    "timestamp": "2022-03-31T02:26:57",
    "message": "success",
    "ip": "::ffff:127.0.0.1",
    "team": "Team QQ"
  }
];

const predictions_test_expected = [
  {
    "disease": "COVID-19",
    "reports": [
      {
        "report_id": 1,
        "event_date": "2022-03-29T13:00:00",
        "disease_id": "COVID-19",
        "article_id": 9,
        "location": "Africa",
        "lat": "-8.78",
        "long": "34.51"
      },
      {
        "report_id": 3,
        "event_date": "2022-03-29T13:00:00",
        "disease_id": "COVID-19",
        "article_id": 3,
        "location": "America",
        "lat": "37.09",
        "long": "-95.71"
      },
      {
        "report_id": 2,
        "event_date": "2022-03-27T13:00:00",
        "disease_id": "COVID-19",
        "article_id": 7,
        "location": "Edinburgh",
        "lat": "55.95",
        "long": "-3.19"
      },
      {
        "report_id": 5,
        "event_date": "2022-03-27T13:00:00",
        "disease_id": "COVID-19",
        "article_id": 2,
        "location": "Shanghai",
        "lat": "31.23",
        "long": "121.47"
      },
      {
        "report_id": 4,
        "event_date": "2022-03-28T13:00:00",
        "disease_id": "COVID-19",
        "article_id": 5,
        "location": "Texas",
        "lat": "31.97",
        "long": "-99.90"
      },
      {
        "report_id": 6,
        "event_date": "2022-03-28T13:00:00",
        "disease_id": "COVID-19",
        "article_id": 6,
        "location": "United Kingdom—",
        "lat": "55.38",
        "long": "-3.44"
      }
    ],
    "report_count": 6
  }
];
