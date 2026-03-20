import { scrapeSchadeautos } from './src/scraper';

scrapeSchadeautos().then(() => {
    console.log("Execution Script Finished");
    process.exit(0);
}).catch(err => {
    console.error("Execution Script Error", err);
    process.exit(1);
});
