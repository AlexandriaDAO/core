import React from "react";
import Card from "./Card";
import { useAppSelector } from "src/ucg_frontend/src/store/hooks/useAppSelector";

const Grid = () => {
    const {data} =useAppSelector(state=>state.portal)
	return (
        <div className="transition duration-300">
            <div className="grid md:grid-cols-4 grid-cols-2 gap-6">
                {data?.items.map((book: any, index: number) => (
                    <Card item={book} key={index} />
                ))}
            </div>
        </div>
	);
};

export default Grid;
