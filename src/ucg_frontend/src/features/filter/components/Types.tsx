import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import DDC from "@/data/categories";
import { toggleType } from "../filterSlice";

function Types() {
	const dispatch = useAppDispatch();
	const { types } = useAppSelector((state) => state.filter);

	const handleTypeClick= (typeId:number)=>{
		dispatch(toggleType(typeId))
	}

	return (
        <div className=" grid grid-cols-10 h-32 text-white font-syne font-normal text-xl">
            {Object.entries(DDC).map(([typeId, { type, image }]) => (
                <div
                    key={typeId}
                    onClick={() => handleTypeClick(parseInt(typeId))}
                    className={`p-2 text-center cursor-pointer bg-cover bg-center flex flex-col justify-between items-stretch relative`}
                    style={{
                        backgroundImage: `url(images/categories/${image})`,
                    }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
                    <span className="text-left z-20 text-[0.8em]">{type}</span>
                    <input
                        type="radio"
                        checked={types.includes(parseInt(typeId))}
                        onChange={(e) => {}}
                        className="z-20 cursor-pointer self-end h-7 w-7 p-1 border border-white text-white focus:ring-white "
                    />
                </div>
            ))}
        </div>
	);
}

export default Types;
