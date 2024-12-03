import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import NodeItem from "./components/NodeItem";
import NoNode from "./components/NoNode";
import { LoaderCircle } from "lucide-react";

function MyNodes() {
	const { nodes, loading } = useAppSelector((state) => state.myNodes);

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Nodes</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(nodes.length<=0) return <NoNode />

	return (
		<div className="w-full flex gap-2 flex-col">
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