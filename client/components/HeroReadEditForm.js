import { heroNames } from "../lib/constants";
import Image from "next/image";
import { useState } from "react";
export default function HeroReadEditForm({ record, handleSubmit }) {
    const [editForm, setEditForm] = useState(false);
    const [formData, setFormData] = useState([]);

    const openEditForm = () => {
        setEditForm(true);
        setFormData(() => [...record.info]);
    };

    const closeEditForm = () => {
        setEditForm(false);
        setFormData([]);
    };

    const handleChange = (event) => {
        const updatedFormData = [];
        for (let i = 0; i < formData.length; i += 1)
            updatedFormData.push(formData[i]);
        const index = +event.target.dataset.item;

        updatedFormData[index] = event.target.value;
        setFormData(updatedFormData);
    };

    const saveChanges = async () => {
        await handleSubmit({ heroName: record.heroName, data: formData });
        closeEditForm();
    }

    const addNewRow = () => {
        setFormData([...formData, '']);
    }

    const deleteRow = (indexToDelete) => {
        setFormData(formData.filter((_, index) => index !== indexToDelete));
    }
    return (
        <li className="border border-black p-2 grid grid-cols-[1fr_auto]">
            <div className="heroContent pr-3">
                {record.type === "HERO" && (
                    <div>
                        <Image
                            className="border-gray-400 border-2"
                            src={`/images/${heroNames[record.heroName]}.png`}
                            width={100}
                            height={90}
                            alt={record.heroName}
                        />
                        <span className="font-semibold">{record.heroName}</span>
                    </div>
                )}
                {record.type !== "HERO" && (
                    <>
                        <div className="font-semibold">{record.type === "OTHERS" ? "Others" : "Items"}</div>
                    </>
                )}
                {!editForm ? (
                    <div>
                        {record.info?.map((data, index) => (
                            <div key={index}>{"-" + data}</div>
                        ))}
                    </div>
                ) : (
                    <div>
                        {formData.map((formItem, index) => (
                            <div key={index} className="flex gap-4 mr-8">
                                <input
                                    type="text"
                                    key={index}
                                    className="w-full m-2 border border-gray-700"
                                    value={formItem}
                                    data-item={index}
                                    onChange={(event) => handleChange(event)}
                                />
                                <input className="bg-red-400 p-3 rounded-full m-2 cursor-pointer" type="button" value="Delete row" onClick={() => deleteRow(index)} />
                            </div>
                        ))}
                        <input className="m-2 rounded-lg p-2 bg-blue-500 border border-black cursor-pointer" type="button" value="Add new row" onClick={addNewRow} />
                    </div>
                )}
            </div>
            <div className="flex flex-col border-l-2 border-gray-400">
                {!editForm ? (
                    <input
                        type="button"
                        value="Edit hero details"
                        onClick={() => openEditForm()}
                        className="h-max m-3 border border-black cursor-pointer px-4 py-2 active:translate-y-1 transition-all rounded-md"
                    />
                ) : (
                    <>
                        <input
                            type="button"
                            value="Save hero details"
                            onClick={() => saveChanges()}
                            className="h-max m-3 bg-green-400 border border-blue-700 cursor-pointer px-4 py-2 active:translate-y-1 transition-all rounded-md"
                        />
                        <input
                            type="button"
                            value="Discard changes"
                            onClick={() => closeEditForm()}
                            className="h-max m-3 bg-red-400 border border-blue-700 cursor-pointer px-4 py-2 active:translate-y-1 transition-all rounded-md"
                        />
                    </>
                )}
            </div>
        </li>
    );
}
