import {
    fetchHeroesInfo,
    fetchMatchIds,
    fetchMatchesInfo,
} from "../lib/utils.mjs";
import fs from "fs/promises";

async function main() {
    const [heroesInfoResult, publicMatchesResult] = await Promise.all([
        fetchHeroesInfo(),
        fetchMatchIds(),
    ]);

    if (!heroesInfoResult.success) {
        console.log(
            "ERROR - Failed to fetch heroes list: ",
            heroesInfoResult.message
        );
        return;
    }
    if (!publicMatchesResult.success) {
        console.log(
            "ERROR - Failed to fetch top public matches list: ",
            publicMatchesResult.message
        );
        return;
    }

    console.log(
        "LOG - Successfully fetched heroes list and top public matches list"
    );

    const matchIds = publicMatchesResult.data.map((match) => match.match_id);
    const parsedMatchesResult = await fetchMatchesInfo(matchIds.slice(0, 3));
    console.log(parsedMatchesResult.data);

    await fs.writeFile(
        "./data/strats.json",
        JSON.stringify(parsedMatchesResult.data, null, 2)
    );
}

try {
    await main();
} catch (err) {
    console.log("ERROR - Job run failed: ", err);
}
