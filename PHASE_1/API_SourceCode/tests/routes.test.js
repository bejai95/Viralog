const app = require("../server");
const request = require('supertest');
const { describe } = require("yargs");

describe("Sanity checks", function () {
    test("404 on /", async () => {
        const res = await request(app).get("/");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(404);
    });

});

describe("Test reports route", function() {
    test("GET /reports", async () => {

        const res = await request(app).get("/reports");
        expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
        expect(res.statusCode).toBe(200);
    });
});

// describe("Test logs route", function () {
    
// });

// describe("Test predictions route", function () {
    

// });
