import { useAppDispatch } from "src/ucg_frontend/src/store/hooks/useAppDispatch";
import { useAppSelector } from "src/ucg_frontend/src/store/hooks/useAppSelector";
import React, { useEffect, useState } from "react";

import { Engine } from "../../../../../declarations/ucg_backend/ucg_backend.did";

import { initializeClient } from "src/ucg_frontend/src/services/meiliService";
import MeiliSearch from "meilisearch";
import { setActiveEngine } from "src/ucg_frontend/src/features/engine-overview/engineOverviewSlice";

interface EngineItemProps {
	engine: Engine
};

const EngineItem = ({ engine }: EngineItemProps) => {
	const [client, setClient] = useState<MeiliSearch | null | undefined>(undefined);
	const dispatch = useAppDispatch();

	const { activeEngine } = useAppSelector((state) => state.engineOverview);

	const handleEngineClick = () => {
		if (activeEngine?.id == engine.id) {
			dispatch(setActiveEngine(null));
		} else {
			dispatch(setActiveEngine(engine));
		}
	};
	useEffect(() => {
		const engineStatus = async () => {
			const client = await initializeClient(engine.host, engine.key);
			setClient(client);
		};
		engineStatus();
	}, []);

	return (
		<button
			onClick={handleEngineClick}
			className={`w-full p-4 flex justify-start gap-1 items-center shadow-lg border border-gray-300 rounded-md font-roboto-condensed text-base leading-[18px] font-medium transition-all duration-100 ease-in cursor-pointer ${
				activeEngine?.id == engine.id
					? "bg-black text-white"
					: "text-black hover:bg-black hover:text-white"
			}
    `}
		>
			{client === undefined && <span className="rounded-full bg-gray-500 p-1.5"></span> }
			{client === null && <span className="rounded-full bg-red-500 p-1.5"></span> }
			{client && <span className="rounded-full bg-green-500 p-1.5"></span> }

			{engine.title}
		</button>
	);
};

export default EngineItem;
