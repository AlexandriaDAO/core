import React from "react";

import { SerializedEngine } from "@/features/my-engines/myEnginesSlice";
import { NavLink } from "react-router-dom";
import { Button } from "@/lib/components/button";

interface EngineItemProps {
	engine: SerializedEngine
};

const EngineItemAction: React.FC<EngineItemProps> = ({engine}) => {
	return (
		<div className="flex justify-center">
			<NavLink to={'/dashboard/engines/'+engine.id}>
				<Button variant="inverted" scale="sm">View Engine</Button>
			</NavLink>
		</div>
	);
};

export default EngineItemAction;
