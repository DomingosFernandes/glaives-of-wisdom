import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const OPENDOTA_ENDPOINT = process.env.OPENDOTA_ENDPOINT;
const STRATZ_ENDPOINT = process.env.STRATZ_ENDPOINT;
const STRATZ_TOKEN = process.env.STRATZ_TOKEN;

export async function fetchRequest(url, options = {}) {
    try {
        const apiResponse = await fetch(url, options);
        if (apiResponse.ok) {
            const result = await apiResponse.json();
            return { success: true, data: result, message: "" };
        } else {
            return {
                success: false,
                data: null,
                message: `ERROR - Fetch operation ended with status ${
                    apiResponse.status + ", " + apiResponse.statusText
                } `,
            };
        }
    } catch (error) {
        return {
            success: false,
            data: null,
            message: `ERROR - Fetch failed: ${error.message}`,
        };
    }
}

export async function fetchHeroesInfo() {
    const heroesResponse = await fetchRequest(`${OPENDOTA_ENDPOINT}/heroes`);

    if (heroesResponse.success && Array.isArray(heroesResponse.data)) {
        const heroesList = heroesResponse.data;
        const heroIdMap = new Array(150).fill("");

        heroesList.forEach((hero) => {
            const id = hero.id;
            if (id) heroIdMap[id] = hero.localized_name;
        });
        return { ...heroesResponse, data: heroIdMap };
    } else {
        return {
            message: `${heroesResponse.message}, from fetchHeroesInfo`,
            data: [],
            success: false,
        };
    }
}

export async function fetchMatchIds() {
    const matchesResponse = await fetchRequest(
        `${OPENDOTA_ENDPOINT}/publicMatches?mmr_descending=1`
    );

    if (matchesResponse.success && Array.isArray(matchesResponse.data)) {
        const matchesOverviewResult = matchesResponse.data;

        const matchIdsList = matchesOverviewResult.map((result) => {
            return {
                match_id: result.match_id,
                avg_mmr: result.avg_mmr,
                avg_rank_tier: result.avg_rank_tier,
                num_rank_tier: result.num_rank_tier,
            };
        });

        return { ...matchesResponse, data: matchIdsList };
    } else {
        return {
            message: `${matchesResponse.message}, from fetchMatchIds`,
            data: [],
            success: false,
        };
    }
}

export async function fetchMatchesInfo(matchIds) {
    const graphqlQuery = `#graphql
        query GetMatchesSummary($matchIds: [Long]!) {
        matches(ids: $matchIds) {
            id
            didRadiantWin
            bracket
            players {
                isRadiant
                hero {
                    id
                    name
                    displayName
                }
                lane
                position
                role
            }
            stats {
                pickBans {
                    isPick
                    heroId
                    order
                    bannedHeroId
                    wasBannedSuccessfully
                    isRadiant
                    playerIndex
                }
            }
        }
    }`;
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRATZ_TOKEN}`,
        },
    };
    const queryPayload = {
        body: JSON.stringify({
            query: graphqlQuery,
            variables: { matchIds },
        }),
    };
    const fetchOptions = { ...requestOptions, ...queryPayload };
    const { data: stratzResponse } = await fetchRequest(
        `${STRATZ_ENDPOINT}`,
        fetchOptions
    );
    3;
    const { data: matchesList, error } = stratzResponse;
    if (error) {
        return { success: false, data: null, message: error };
    }

    return { success: true, data: matchesList, message: "" };
}

/**
 * {
  matches(ids: [6743212516,6743272017]) {
    id
    didRadiantWin
    bracket
    players {
      isRadiant
      hero {
        id
        name
        displayName
      }
      lane
      position
      role
		}
	}
    stats {
      pickBans {
        isPick
        heroId
        order
        bannedHeroId
        wasBannedSuccessfully
        isRadiant
        playerIndex
      }
    }
}
 */
