import { useState } from 'react';
import HeroesGrid from '../../components/HeroesGrid';
import { getHeroes } from '../../lib/heroes';
/***/
export default function Wiki({ heroList = [] }) {

    const { strHeroes, agiHeroes, intHeroes } = heroList.reduce((acc, value) => {
        if (value.primaryAttribute === 'str') acc.strHeroes.push(value);
        else if (value.primaryAttribute === 'agi') acc.agiHeroes.push(value);
        else acc.intHeroes.push(value);
        return acc;
    }, { strHeroes: [], agiHeroes: [], intHeroes: [] });

    const [searchText, setSearchText] = useState('');
    const handleInput = (e) => {
        setSearchText(e.target.value);
    }
    return (
        <div className="w-screen h-screen flex flex-col items-start box-border px-2 py-2">
            <div className="mt-12 mb-4 text-3xl ">Please don't pick Pudge - Wiki Dashboard</div>
            <input
                type="text"
                placeholder="Search for hero"
                className="outline-none rounded-md px-4 py-1 shadow-md border-gray-500 border-2 font-semibold placeholder-gray-500 w-64 "
                onChange={handleInput}
            />
            <HeroesGrid attributeType="Strength" attributeColor="text-red-500" heroesList={strHeroes} heroSearchText={searchText}/> 
            <HeroesGrid attributeType="Agility" attributeColor="text-green-500" heroesList={agiHeroes} heroSearchText={searchText}/> 
            <HeroesGrid attributeType="Intelligence" attributeColor="text-blue-500" heroesList={intHeroes} heroSearchText={searchText}/> 
        </div>
    );
}

export async function getServerSideProps() {
   const heroList = await getHeroes();
    return {
        props: {
            heroList
        }
    }
}