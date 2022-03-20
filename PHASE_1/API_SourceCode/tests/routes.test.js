import request from "supertest";

const { app } = require("../server");

describe("Test articles route", function () {
    test("responds to /", async () => {
        const res = await request(app).get("/");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello world!");
    });

    test("responds to /hello/:name", async () => {
        const res = await request(app).get("/hello/jaxnode");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello jaxnode!");
    });

    test("responds to /hello/Annie", async () => {
        const res = await request(app).get("/hello/Annie");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello Annie!");
    });
});

describe("Test reports route", function () {
    test("responds to /", async () => {
        const res = await request(app).get("/");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello world!");
    });

    test("responds to /hello/:name", async () => {
        const res = await request(app).get("/hello/jaxnode");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello jaxnode!");
    });

    test("responds to /hello/Annie", async () => {
        const res = await request(app).get("/hello/Annie");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello Annie!");
    });
});

describe("Test logs route", function () {
    test("responds to /", async () => {
        const res = await request(app).get("/");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello world!");
    });

    test("responds to /hello/:name", async () => {
        const res = await request(app).get("/hello/jaxnode");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello jaxnode!");
    });

    test("responds to /hello/Annie", async () => {
        const res = await request(app).get("/hello/Annie");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello Annie!");
    });
});

describe("Test predictions route", function () {
    test("Get base predictions", async () => {
        const res = await request(app).get("/");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello world!");
    });

    test("responds to /hello/:name", async () => {
        const res = await request(app).get("/hello/jaxnode");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello jaxnode!");
    });

    test("responds to /hello/Annie", async () => {
        const res = await request(app).get("/hello/Annie");
        expect(res.header["content-type"]).toBe("text/html; charset=utf-8");
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual("hello Annie!");
    });
});
