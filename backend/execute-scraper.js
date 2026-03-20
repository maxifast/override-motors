"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scraper_1 = require("./src/scraper");
(0, scraper_1.scrapeSchadeautos)().then(function () {
    console.log("Execution Script Finished");
    process.exit(0);
}).catch(function (err) {
    console.error("Execution Script Error", err);
    process.exit(1);
});
