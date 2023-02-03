import { getHeroById, updateInfoByHeroId } from "../../../lib/heroes";

export default async function handler (req, res) {
    if (req.method === 'PATCH') {
        const { id } = req.query;
        const { payload } = req.body;
        await updateInfoByHeroId(+id, payload);
        return res.status(204).send();
    }
    if (req.method === 'GET') {
       const { id } = req.query;
       const heroRecord = await getHeroById(+id);
       return res.status(200).json(heroRecord); 
    }
}