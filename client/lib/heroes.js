
import client from "./mongodb";

export const getHeroes = async () => {
    const dbClient = await client;
    const pudgeDb = dbClient.db('pudge_db')
    const heroInfo = await pudgeDb.collection('hero_info');
    const projection = { _id: 0, heroName: 1, heroId: 1, primaryAttribute: 1 }

    const heroRecords = (await heroInfo.find().project(projection).toArray());
    const heroList = heroRecords.sort((a, b) => a.heroName.localeCompare(b.heroName));
    return heroList;
}

export const getHeroById = async (heroId) => {
    const dbClient = await client;
    const pudgeDb = dbClient.db('pudge_db');
    const heroInfo = await pudgeDb.collection('hero_info');

    const heroRecord = await heroInfo.findOne({ heroId: +heroId });
    heroRecord._id = heroRecord._id.toString();
    return heroRecord;
}

export const updateInfoByHeroId = async (heroId, payload) => {
    const dbClient = await client;
    const pudgeDb = dbClient.db('pudge_db');
    const heroInfo = await pudgeDb.collection('hero_info');

    const field = payload.type;
    const heroName = payload.heroName;
    const result = await heroInfo.updateOne({ heroId: +heroId, [`${field}.heroName`]: heroName }, {
        $set: {
            [`${field}.$.info`]: payload.data,
        }
    })

    return JSON.parse(JSON.stringify(result));
}