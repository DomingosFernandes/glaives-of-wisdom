import puppeteer from "puppeteer";
import fs from "fs/promises";
import fetch from "node-fetch";
import Bottleneck from "bottleneck";

// Ensure images folder is created :)
function downloadFile(url, path) {
    return fetch(url)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => Buffer.from(arrayBuffer))
        .then((imageBuffer) => fs.writeFile(path, imageBuffer));
}

(async () => {
    let browser = null;
    try {
        const limiter = new Bottleneck({ minTime: 200 });
        const downloader = limiter.wrap(downloadFile);

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        //Change the URL to scrape the static images from
        await page.goto("https://www.dota2.com/heroes");

        const urls = await page.$$eval(
            'a[class^="herogridpage"]',
            (anchorTags) => {
                return anchorTags.map(
                    (anchorTag) =>
                        anchorTag
                            .getAttribute("style")
                            .match(/https.*[.]png/)?.[0] || ""
                );
            }
        );

        await Promise.all(
            urls.map((url) => {
                const path = `./images/${url.slice(url.lastIndexOf("/") + 1)}`;
                return downloader(url, path);
            })
        );

        await page.close();
        await browser.close();
    } catch (err) {
        console.log("Error downloading images: ", err);
    } finally {
        if (browser) await browser.close();
    }
})();
