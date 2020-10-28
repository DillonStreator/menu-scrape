#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const puppet = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
const { parseDomain, fromUrl } = require("parse-domain");

const parsers = {
    grubhub: require("./grubhub"),
};

puppet.use(Stealth());
(async () => {
    const url = process.argv[2];
    if (!url) {
        console.error("You must provide the url as a cli argument");
        process.exit(1);
    }

    const { domain } = parseDomain(fromUrl(url));
    const pathname = new URL(url).pathname;
    const parser = parsers[domain];
    if (!parser) {
        console.error("No parser for that domain");
        process.exit(1);
    }

    let browser = null;
    try {
        browser = await puppet.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto(url);

        const products = await parser({ page });

        const result = {
            products,
            createdAt: new Date(),
            url,
        }
        fs.writeFileSync(path.join(__dirname, "data", `${domain}_${pathname.split("/").join("_")}.json`), JSON.stringify(result));

        console.log(products);
    } catch (error) {
        console.error(error);
    } finally {
        if (browser) await browser.close();
    }

})();
