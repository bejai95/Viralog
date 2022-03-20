"use strict";

// Require process, so we can mock environment variables.
const process = require("process");
const { app } = require("./app");

const PORT = parseInt(process.env.PORT) || 8080;
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Press Ctrl+C to quit.");
});

module.exports = server;
