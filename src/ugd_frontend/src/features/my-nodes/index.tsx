import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";

import { ImSpinner8 } from "react-icons/im";
import NodeItem from "./components/NodeItem";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import useSession from "@/hooks/useSession";
import { ugd_backend } from "../../../../../src/declarations/ugd_backend";

function MyNodes() {
	const { nodes, loading } = useAppSelector((state) => state.myNodes);


	return (
		<div className="w-full p-3 flex gap-2 flex-col">
			<div className="flex justify-between items-center">
				<div className="font-syne font-medium text-xl text-black">
					Created Nodes
				</div>
			</div>
			<div className="flex gap-4 justify-start items-center">
				{nodes.map((node) => (
					<NodeItem key={node.id} node={node} />
				))}
			</div>
		</div>
	);
}

export default MyNodes;
