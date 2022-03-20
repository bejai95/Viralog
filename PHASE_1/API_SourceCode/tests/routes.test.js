const request = require('supertest');
const { handleReports, handleArticles, handlePredictions, handleLogs } = require("../server.js");
const express = require('express');

const app = new express();
app.get("/reports", handleReports);
app.get("/articles", handleArticles);
app.get("/predictions", handlePredictions);
app.get("/logs", handleLogs);

describe("aaa", () => {
test("/routes test", async () => {
    
    const res = await request(app).get('/reports').set("Content-Type", "application/json")
    .query({
        "period_of_interest_start": "2019-12-01T17:21:21",
        "period_of_interest_end": "2022-12-01T17:21:21",
        "key_terms": "COVID-19",
        "location": "China"
    });
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual("[{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2022-03-13T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2022-03-14T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-10-12T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2022-03-10T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2022-03-06T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2022-01-30T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2022-01-19T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-09-28T14:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-03-28T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-05-31T14:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-02-11T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-02-08T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-09-12T14:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-01-21T13:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-05-06T14:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-08-02T14:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-07-08T14:00:00\",\"location\":\"China\"},{\"diseases\":[\"COVID-19\"],\"syndromes\":[\"Acute respiratory syndrome\",\"fever\",\"cough\",\"fatigue\",\"shortness of breath\",\"vomiting\",\"loss of taste\",\"loss of smell\"],\"event_date\":\"2021-07-14T14:00:00\",\"location\":\"China\"}]");
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
