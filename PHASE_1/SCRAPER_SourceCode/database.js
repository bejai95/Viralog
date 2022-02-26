"use strict";

const process = require("process");
const Knex = require("knex");

async function createTcpPoolSslCerts(config) {
    if (process.env.DB_HOST == null
	 || process.env.DB_USER == null
	 || process.env.DB_PASS == null
	 || process.env.DB_NAME == null) {
        throw "Please specify environment variables DB_HOST, DB_USER, DB_PASS and DB_NAME.";
    }

    // Extract host and port from socket address
    const dbSocketAddr = process.env.DB_HOST.split(":"); // e.g. "127.0.0.1:5432"

    try {
        // Establish a connection to the database
        return Knex({
            client: "pg",
            connection: {
                user: process.env.DB_USER,        // e.g. "my-user"
                password: process.env.DB_PASS,    // e.g. "my-user-password"
                database: process.env.DB_NAME,    // e.g. "my-database"
                host: dbSocketAddr[0],            // e.g. "127.0.0.1"
                port: dbSocketAddr[1],            // e.g. "5432"
                ssl: { rejectUnauthorized: false },
            },
            ...config,
        });
    }
    catch (error) {
        console.log(error);
    }
}

// Initialize Knex, a Node.js SQL query builder library with built-in connection pooling.
module.exports.createConnectionPool = async () => {
    // Configure which instance and what database user to connect with.
    const config = { pool: {} };

    // "max" limits the total number of concurrent connections this pool will keep. Ideal
    // values for this setting are highly variable on app design, infrastructure, and database.
    config.pool.max = 5;
    // "min" is the minimum number of idle connections Knex maintains in the pool.
    // Additional connections will be established to meet this value unless the pool is full.
    config.pool.min = 5;

    // "acquireTimeoutMillis" is the number of milliseconds before a timeout occurs when acquiring a
    // connection from the pool. This is slightly different from connectionTimeout, because acquiring
    // a pool connection does not always involve making a new connection, and may include multiple retries.
    // when making a connection
    config.pool.acquireTimeoutMillis = 60000; // 60 seconds
    // "createTimeoutMillis` is the maximum number of milliseconds to wait trying to establish an
    // initial connection before retrying.
    // After acquireTimeoutMillis has passed, a timeout exception will be thrown.
    config.pool.createTimeoutMillis = 30000; // 30 seconds
    // "idleTimeoutMillis" is the number of milliseconds a connection must sit idle in the pool
    // and not be checked out before it is automatically closed.
    config.pool.idleTimeoutMillis = 600000; // 10 minutes

    // "knex" uses a built-in retry strategy which does not implement backoff.
    // "createRetryIntervalMillis" is how long to idle after failed connection creation before trying again
    config.pool.createRetryIntervalMillis = 200; // 0.2 seconds

    return createTcpPoolSslCerts(config);
};
