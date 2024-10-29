import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import NodeItem from "./components/NodeItem";

function MyNodes() {
	const { nodes } = useAppSelector((state) => state.myNodes);


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