const request = require('supertest');
const { handleReports } = require("../server.js");
const express = require('express');

const app = new express();

test('responds to /', async () => {
    
    const res = await request(app).get('/reports').set({
        "Content-Type": "application/octet-stream"
    })
    .query({
        "period_of_interest_start": "2019-12-01T17:21:21",
        "period_of_interest_end": "2022-12-01T17:21:21",
        "key_terms": "COVID-19",
        "location": "China"
    });
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual('hello world!');
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
