import { MongoClient } from "mongodb";
import fetch from 'node-fetch';
import fs from 'fs/promises';
const OPENDOTA_ENDPOINT = 'https://api.opendota.com/api';
const HEROES = OPENDOTA_ENDPOINT + '/heroes';

async function getHeroes() {
    try {
        const response = await fetch(HEROES);
        if (response.ok) return response.json();
        return null;
    }
    catch (err) {
        console.log("Error: ", err);
        return null;
    }
}
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function main() {
    try {
        const heroes = await getHeroes();
        const wikiFile = await fs.readFile('./data/wiki.json');
        const wiki = JSON.parse(wikiFile);

        if (heroes) {
            const heroRecords = heroes.map(hero => {
                return {
                    heroId: hero.id,
                    dotaName: hero.name,
                    heroName: hero.localized_name,
                    primaryAttribute: hero.primary_attr,
                    attackType: hero.attack_type,
                    roles: hero.roles,
                }
            }).map(record => {
                const heroWiki = wiki[record.heroName];
                return {
                    ...record,
                    goodAgainst: reducer(heroWiki.good),
                    badAgainst: reducer(heroWiki.bad),
                    synergizeWith: reducer(heroWiki.synergy)
                }
            })


            const dbClient = await client.connect();
            const pudgeDb = await dbClient.db('pudge_db')
            const heroInfo = await pudgeDb.collection('hero_info');

            await heroInfo.insertMany(heroRecords);
            await dbClient.close();

            await fs.writeFile('./data/pdpp.json', JSON.stringify(heroRecords));
        }
        else {
            console.error("getHeroes did not return any data");
        }
    }
    catch (error) {
        console.error("There was an error: ", error);
    }
}

function reducer(records) {
    return records.reduce((computed, obj) => {
        const keys = Object.keys(obj);
        keys.forEach(k => {
            console.log(k);
            if (k === "Others") computed.push({ type: 'ITEMS', info: obj[k] })
            else if (k === "Items") computed.push({ type: 'OTHERS', info: obj[k] })
            else computed.push({ type: 'HERO', heroName: k, info: obj[k] })
        });
        return computed;
    }, [])
}

main().catch(console.dir);
