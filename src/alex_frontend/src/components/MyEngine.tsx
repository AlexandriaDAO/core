import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useState } from "react";

import MeiliSearch from "meilisearch";
import { setActiveEngine } from "@/features/engine-overview/engineOverviewSlice";
import { IoIosArrowRoundForward } from "react-icons/io";


const MyEngine = () => {
	const dispatch = useAppDispatch();

	const { user } = useAppSelector((state) => state.auth);
	const { activeEngine } = useAppSelector((state) => state.engineOverview);

	const handleEngineClick = () => {
		if (activeEngine == user) {
			dispatch(setActiveEngine(''));
		} else {
			dispatch(setActiveEngine(user));
		}
	};

	return (
		<button
			onClick={handleEngineClick}
			className={`w-full p-4 flex justify-between gap-1 items-center shadow-lg border border-gray-300 rounded-md font-roboto-condensed text-base leading-[18px] font-medium transition-all duration-100 ease-in cursor-pointer ${
				activeEngine == user
					? "bg-black text-white"
					: "text-black hover:bg-black hover:text-white"
			}
    `}
		>
            <span>
                View My Engine
            </span>
            <IoIosArrowRoundForward size={24} />
		</button>
	);
};

export default MyEngine;
