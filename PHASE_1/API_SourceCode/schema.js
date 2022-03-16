"use strict";

async function resetSchema(conn) {
	await conn.schema.dropTableIfExists("Symptom");
        await conn.schema.dropTableIfExists("DiseaseAlias");
        await conn.schema.dropTableIfExists("Log");
        await conn.schema.dropTableIfExists("Report");
        await conn.schema.dropTableIfExists("Disease");
        await conn.schema.dropTableIfExists("Article");

        await conn.schema.createTable("Article", (table) => {
            table.string("article_url").primary();
            table.string("headline").notNullable();
            table.string("main_text").notNullable();
            table.string("category");
            table.string("source");
            table.string("author").notNullable();
            table.string("date_of_publication").notNullable();
        });

        await conn.schema.createTable("Disease", (table) => {
            table.string("disease_id").primary();
            table.string("name").notNullable();
        });

        await conn.schema.createTable("Symptom", (table) => {
            table.string("symptom").notNullable();
            table
                .string("disease_id")
                .references("disease_id")
                .inTable("Disease")
                .notNullable();
            table.primary(["symptom", "disease_id"]);
        });

        await conn.schema.createTable("DiseaseAlias", (table) => {
            table
                .string("disease_id")
                .references("disease_id")
                .inTable("Disease")
                .notNullable();
            table.string("alias").notNullable();
            table.primary(["disease_id", "alias"]);
        });

        await conn.schema.createTable("Report", (table) => {
            table.string("id").primary();
            table.date("event_date").notNullable();
            table
                .string("disease_id")
                .references("disease_id")
                .inTable("Disease")
                .notNullable();
            table
                .string("article_url")
                .references("article_url")
                .inTable("Article")
                .notNullable();
            table.string("country").notNullable();
            table.string("city");
        });

        await conn.schema.createTable("Log", (table) => {
            table.string("id").primary();
            table.integer("status").notNullable();
            table.string("req_params").notNullable();
            table.date("timestamp").notNullable();
            table.string("err_msg");
        });
}

exports.resetSchema = resetSchema;
