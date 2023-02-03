import { heroNames } from "../../lib/constants";
import Image from "next/image";
import { getHeroById } from "../../lib/heroes";
import Link from "next/link";
import HeroReadEditForm from "../../components/HeroReadEditForm";
import { dehydrate, QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from 'next/router';

const fetchHeroById = async (id) => {
    const response = await fetch(`/api/hero/${id}`)
    return response.json();
}

const updateHeroById = async (id, payload, type) => {
    let field = '';
    switch (type) {
        case 'good': field = 'goodAgainst'; break;
        case 'bad': field = 'badAgainst'; break;
        case 'synergy': field = 'synergizeWith'; break;
    }
    await fetch(`/api/hero/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            payload: {
                type: field,
                ...payload
            }
        })
    })
}

export default function HeroPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = router.query;

    const { data: heroInfo } = useQuery({
        queryKey: ['heroById', id],
        queryFn: () => fetchHeroById(id)
    })

    const mutation = useMutation({
        mutationFn: (update) => updateHeroById(id, update.payload, update.type),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['heroById', id]});
        }
    })

    const getAttribute = (attribute) => {
        if (attribute === "str") return "Strength";
        if (attribute === "agi") return "Agility";
        return "Intelligence";
    };

    return (
        <div className="flex flex-col p-4">
            <span className="my-3 font-semibold text-3xl">
                {heroInfo.heroName}
            </span>
            <div className="flex gap-4">
                <Image
                    className="border-gray-400 border-2"
                    src={`/images/${heroNames[heroInfo.heroName]}.png`}
                    width={175}
                    height={100}
                    alt={heroInfo.heroName || ''}
                    priority
                />
                <div className="text-xl w-full flex flex-col justify-around">
                    <span>
                        Primary Attribute:{" "}
                        {getAttribute(heroInfo.primaryAttribute)}
                    </span>
                    <span>Attack Type: {heroInfo.attackType}</span>
                </div>
            </div>
            <div className="my-2">
                <span className="bg-green-500 text-white text-2xl px-2 w-full block font-semibold">
                    Good against...
                </span>
                <ul className="w-full list-none flex flex-col gap-2 mt-3">
                    {heroInfo.goodAgainst.map((item) => (
                        <HeroReadEditForm
                            record={item}
                            key={item.heroName || item.type}
                            handleSubmit={(payload) =>
                                mutation.mutate({payload, type: "good"})
                            }
                        />
                    ))}
                </ul>
            </div>
            <div className="my-2">
                <span className="bg-red-500 text-white text-2xl px-2 w-full block font-semibold">
                    Bad against...
                </span>
                <ul className="w-full list-none flex flex-col gap-2 mt-3">
                    {heroInfo.badAgainst.map((item) => (
                        <HeroReadEditForm
                            record={item}
                            key={item.heroName || item.type}
                            handleSubmit={(payload) =>
                                mutation.mutate({payload, type: "bad"})
                            }
                        />
                    ))}
                </ul>
            </div>
            <div className="my-2">
                <span className="bg-blue-500 text-white text-2xl px-2 w-full block font-semibold">
                    Synergizes with...
                </span>
                <ul className="w-full list-none flex flex-col gap-2 mt-3">
                    {heroInfo.synergizeWith.map((item) => (
                        <HeroReadEditForm
                            record={item}
                            key={item.heroName || item.type}
                            handleSubmit={(payload) =>
                                mutation.mutate({payload, type: "synergy"})
                            }
                        />
                    ))}
                </ul>
            </div>
            <Link href="/wiki" className="font-semibold w-[50ch]">
                Go back to all heroes page
            </Link>
        </div>
    );
}

export async function getServerSideProps(context) {
    const id = context.params.id;

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(['heroById', id], () => getHeroById(id))
    //const heroRecord = await getHeroById(+id);
    return {
        props: {
            //heroInfo: heroRecord,
            dehydratedState: dehydrate(queryClient),
        },
    };
}
