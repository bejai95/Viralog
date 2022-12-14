"use strict";

const db = require("./database");

async function resetSchema() {
    let conn;
    try {
        conn = await db.createConnectionPool();
    }
    catch (error) {
        console.log("Failed to connect to database.");
        console.log(error);
        return;
    }

	await conn.schema.dropTableIfExists("Symptom");
    await conn.schema.dropTableIfExists("DiseaseAlias");
    await conn.schema.dropTableIfExists("Log");
    await conn.schema.dropTableIfExists("Report");
    await conn.schema.dropTableIfExists("Disease");
    await conn.schema.dropTableIfExists("Article");

    await conn.schema.createTable("Article", (table) => {
        table.increments("article_id");
        table.text("article_url").notNullable();
        table.text("headline").notNullable();
        table.text("main_text").notNullable();
        table.text("category");
        table.text("source");
        table.text("author").notNullable();
        table.string("date_of_publication").notNullable();
    });

    await conn.schema.createTable("Disease", (table) => {
        table.text("disease_id").primary();
        table.text("name").notNullable();
    });

    await conn.schema.createTable("Symptom", (table) => {
        table.text("symptom").notNullable();
        table
            .text("disease_id")
            .references("disease_id")
            .inTable("Disease")
            .notNullable();
        table.primary(["symptom", "disease_id"]);
    });

    await conn.schema.createTable("DiseaseAlias", (table) => {
        table
            .text("disease_id")
            .references("disease_id")
            .inTable("Disease")
            .notNullable();
        table.text("alias").notNullable();
        table.primary(["disease_id", "alias"]);
    });

    await conn.schema.createTable("Report", (table) => {
        table.increments("report_id");
        table.string("event_date").notNullable();
        table
            .text("disease_id")
            .references("disease_id")
            .inTable("Disease")
            .notNullable();
        table
            .integer("article_id").unsigned()
            .references("article_id")
            .inTable("Article")
            .notNullable();
        table.text("location").notNullable();
        table.decimal("lat").notNullable();
        table.decimal("long").notNullable();
    });

    await conn.schema.createTable("Log", (table) => {
        table.increments("id");
        table.integer("status").notNullable();
        table.string("route").notNullable();
        table.text("req_params").notNullable();
        table.string("timestamp").notNullable();
        table.text("message");
        table.text("ip");
        table.text("team");
    });

    conn.destroy();
    console.log("Success.");
}

resetSchema();
