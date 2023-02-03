import puppeteer from 'puppeteer';
import fs from "fs/promises";

//script to scrape data from dota fandom wiki and store it in a file

(async () => {
    const DOTA_WIKI = "https://dota2.fandom.com";
    const DOTA_HEROES_WIKI = DOTA_WIKI + "/wiki/Heroes";
    const WIKI_HEROES_SELECTOR = 'td div > a[href^="/wiki/"]';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    //Navigate to the dota 2 heroes wiki page
    await page.goto(DOTA_HEROES_WIKI, { waitUntil: ['networkidle2'] });

    //Get all the heroes on the page, to scrape counters information
    const pageLinks = await page.$$eval(WIKI_HEROES_SELECTOR, heroElements => {
        return heroElements.map(element => {
            return {
                link: element.getAttribute("href"),
                name: element.getAttribute("title")
            }
        });
    });

    //Go to counters page and scrape all the counter information
    const counterPageDataSelector =
        // selects each of the heading sections
        'h2:has(>span[id^="Good"]), h2:has(>span[id^="Works"]),' +

        // selects the anchors that link to each of the heros (has the name)
        'div:has(>b>a) ,' +

        // selects the information for the hero under each section
        'div:has(>b>a)+ul ,' +

        // selects the other section under each bad/good/works well section 
        'h3:has(>span[id^="Other"]) ,' +

        // selects the counter information for the hero
        'h3:has(>span[id^="Other"]) + ul ,' +

        // selects the items information heading  
        'h3:has(>span[id^="Items"]) ,' +

        // selects the item information
        'h3:has(>span[id^="Items"]) + ul '
        ;

    const wikiData = {};
    for (let index = 0; index < pageLinks.length; index += 1) {
        await page.goto(DOTA_WIKI + pageLinks[index].link + '/Counters', { waitUntil: ['networkidle2'] });

        const pageInfo = await page.$$(counterPageDataSelector);

        let currentKey = 'bad';
        let heroInfo = { good: [], bad: [], synergy: [] };
        for (let item of pageInfo) {
            if (await item.$('span[id^="Good"]')) {
                currentKey = 'good';
                continue;
            }
            if (await item.$('span[id^="Works"]')) {
                currentKey = 'synergy';
                continue;
            }

            heroInfo[currentKey].push(item)
        }

        const [good, bad, synergy] = await Promise.all([
            getSectionData(heroInfo.good),
            getSectionData(heroInfo.bad),
            getSectionData(heroInfo.synergy)
        ]);
        wikiData[pageLinks[index].name] = { good, bad, synergy };
    }
    await fs.writeFile('./data/wiki.json', JSON.stringify(wikiData, null, 2));
    await page.close();
    await browser.close();
})();

async function getSectionData(sectionContents) {
    const data = [];

    // increment by 2 as the heading and the list data are paired together
    for (let i = 0; i < sectionContents.length; i += 2) {
        const headingElement = sectionContents[i];
        const listElement = sectionContents[i + 1];

        let selector = 'a';
        if (await headingElement.$('span')) {
            selector = 'span';
        }

        const name = await headingElement.$eval(selector, e => e.textContent);
        let value = ''
        if (listElement) {
            value = await listElement.$$eval('li', els => els.map(el => el.textContent));
        }
        data.push({ [name]: value });
    }
    return data;
}
