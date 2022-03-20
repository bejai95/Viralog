const request = require("supertest");
const {
    app,
    handleReports,
    handleArticles,
    handlePredictions,
    handleLogs,
} = require("../server.js");


// const express = require("express");

// const app = new express();
// app.get("/reports", handleReports);
// app.get("/articles", handleArticles);
// app.get("/predictions", handlePredictions);
// app.get("/logs", handleLogs);

describe("Reports Endpoint", () => {
    it("Succesful request with 1 item", (done) => {
        request(app)
        .get("/reports")
        .set("Content-Type", "application/json")
        .query({
            period_of_interest_start: "2022-03-13T12:21:21",
            period_of_interest_end: "2022-03-13T17:21:21",
            key_terms: "COVID-19",
            location: "China",
        })
        .expect(200)
        .end((err, res) => {
            expect(res.body).toEqual(routes_test_expected);
            done();
        });
        
    });

    it("Unsuccessful with mismatched dates", (done) => {
        request(app)
        .get("/reports")
        .set("Content-Type", "application/json")
        .query({
            period_of_interest_start: "2022-03-13T12:21:21",
            period_of_interest_end: "2022-03-13T17:21:21",
            key_terms: "COVID-19",
            location: "China",
        })
        .expect(400)
        .end((err, res) => { done() });
    });
});

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