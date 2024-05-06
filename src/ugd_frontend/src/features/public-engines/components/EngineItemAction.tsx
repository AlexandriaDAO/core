import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

import { Engine } from "../../../../../declarations/ugd_backend/ugd_backend.did";
import { setActiveEngine } from "@/features/engine-overview/engineOverviewSlice";
import { Button, Space } from "antd";

interface EngineItemProps {
	engine: Engine
};

const EngineItemAction: React.FC<EngineItemProps> = ({engine}) => {
	const dispatch = useAppDispatch();

	const { activeEngine } = useAppSelector((state) => state.engineOverview);

	const handleEngineClick = () => {
		if (activeEngine?.id == engine.id) {
			dispatch(setActiveEngine(null));
		} else {
			dispatch(setActiveEngine(engine));
		}
	};


	return (
		<div className="flex justify-center">
			<button
				onClick={handleEngineClick}
				className="w-40 py-2 flex justify-center items-center border border-black rounded-full font-roboto-condensed text-base leading-[18px] font-medium transition-all duration-100 ease-in text-black cursor-pointer hover:bg-black hover:text-white"
			>
				View
			</button>
		</div>
	);
};

export default EngineItemAction;
