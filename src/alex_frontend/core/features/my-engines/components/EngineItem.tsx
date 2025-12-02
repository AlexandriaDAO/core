import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";

import { initializeClient } from "@/services/meiliService";
import MeiliSearch from "meilisearch";
import { setActiveEngine } from "@/features/engine-overview/engineOverviewSlice";
import { SerializedEngine } from "../myEnginesSlice";

import { TableCell, TableRow } from "@/lib/components/table";

interface EngineItemProps {
	engine: SerializedEngine
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
	// 	<button
	// 		onClick={handleEngineClick}
	// 		className={`w-full p-4 flex justify-start gap-1 items-center shadow-lg border border-gray-300 rounded-md font-roboto-condensed text-base leading-[18px] font-medium transition-all duration-100 ease-in cursor-pointer ${
	// 			activeEngine?.id == engine.id
	// 				? "bg-black text-white"
	// 				: "text-black hover:bg-black hover:text-white"
	// 		}
    // `}
	// 	>
	// 		{client === undefined && <span className="rounded-full bg-gray-500 p-1.5"></span> }
	// 		{client === null && <span className="rounded-full bg-red-500 p-1.5"></span> }
	// 		{client && <span className="rounded-full bg-green-500 p-1.5"></span> }

	// 		{engine.title}
	// 	</button>

		<TableRow>
			<TableCell className="font-medium">{engine.title}</TableCell>
			<TableCell>{engine.owner.slice(0, 6) + "..." + engine.owner.slice(-4)}</TableCell>
			<TableCell>{engine.created_at}</TableCell>
			<TableCell className="text-right">View</TableCell>
		</TableRow>
	);
};

export default EngineItem;
