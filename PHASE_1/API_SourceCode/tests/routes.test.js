const request = require("supertest");
const {
    handleReports,
    handleArticles,
    handlePredictions,
    handleLogs,
} = require("../server.js");
const express = require("express");

const app = new express();
app.get("/reports", handleReports);
app.get("/articles", handleArticles);
app.get("/predictions", handlePredictions);
app.get("/logs", handleLogs);

describe("Reports Endpoint", () => {
    test("Succesful request with 1 item", async () => {
        return request(app)
            .get("/reports")
            .set("Content-Type", "application/json")
            .query({
                period_of_interest_start: "2022-03-13T12:21:21",
                period_of_interest_end: "2022-03-13T17:21:21",
                key_terms: "COVID-19",
                location: "China",
            })
            .expect(200)
            .expect(JSON.parse(res.text)).toEqual(routes_test_expected);;
        
    });
});
// describe("Test reports route", function() {
//     test("GET /reports", async () => {
//         const req = {
//             hostname: 'localhost',
//             port: '8080',
//             path: '/reports?period_of_interest_start=2019-12-01T17%3A21%3A21&period_of_interest_end=2022-12-01T17%3A21%3A21&key_terms=COVID-19&location=China',
//             method: 'GET',
//             headers: {"Content-Type":"application/octet-stream"}
//         };

//         const res = { text: '',
//             send: function(input) { this.text = input }
//         };

//         await handleReports(req, res);

//         console.log(res);

//         expect(res.text).toEqual('hello world!');
//         expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
//         expect(res.statusCode).toBe(200);
//     });
// });

// describe("Test logs route", function () {

// });

// describe("Test predictions route", function () {

// });

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