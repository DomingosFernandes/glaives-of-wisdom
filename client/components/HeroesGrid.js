import Link from 'next/link'
import Image from 'next/image';
import { heroNames } from "../lib/constants"

export default function AttributeGrid({ attributeType, heroesList = [], heroSearchText = '', attributeColor }) {
    const heroImageOpacity = (heroName = '') => heroSearchText && !heroName.toLowerCase().includes(heroSearchText) ? 'opacity-30' : ''
    return (
        <div data-id={attributeType} className="w-full">
            <div className={`font-semibold text-2xl ${attributeColor}`}>{attributeType}</div>
            <ul className="my-2 grid grid-cols-6 md:grid-cols-12 gap-4">
                { heroesList.map(item => {
                    return (
                        <li key={item.heroName}>
                            <div className={`cursor-pointer hover:scale-110 ${heroImageOpacity(item.heroName)}`}>
                                <Link href={{ pathname: '/wiki/[id]', query: { id: item.heroId }}}>
                                    <Image
                                        src={`/images/${heroNames[item.heroName]}.png`}
                                        width={150}
                                        height={90}
                                        alt={item.heroName}
                                    />
                                </Link>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
} 