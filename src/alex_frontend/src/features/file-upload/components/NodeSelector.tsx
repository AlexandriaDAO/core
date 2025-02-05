import React, { useCallback, useEffect } from "react";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchNodes from "../thunks/fetchNodes";
import NodeSkeleton from "./NodeSkeleton";
import NodeItem from "./NodeItem";
import { formatAmount } from "../utils";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/lib/components/button";


const NodeSelector = () => {
	const {actor} = useUser();
	const dispatch = useAppDispatch();
	const {cost, nodes, fetching} = useAppSelector(state => state.fileUpload);

	const refresh = useCallback(()=>{
        if(!actor) return;
        dispatch(fetchNodes(actor))
	},[actor, dispatch, fetchNodes])

	useEffect(refresh, [refresh]);

	if(fetching) {
		return (
			<div className="space-y-2">
				{[...Array(5)].map((_, index) => (
					<NodeSkeleton key={index} />
				))}
			</div>
		)
	}

	if(nodes.length === 0) return <div className="text-center py-8 text-gray-500">No nodes available </div>

	return (
		<div className="space-y-2">
			<div className="leading-none">
				<h2 className="text-lg font-semibold ">Select Source Node</h2>
				<span className="text-sm">A node is a pre funded irys instance which is required to upload files.</span>
			</div>
			<div className="flex justify-end items-center">
				{cost && (
					<>
						<p className="text-right text-sm text-muted-foreground">
							Estimated Cost: {formatAmount(cost)}
						</p>
						<div className="border-l h-6 mx-2"></div>
					</>
				)}
				<Button
					variant="muted"
					onClick={refresh}
					disabled={fetching}
					className="p-0"
				>
					<span className="text-sm">Refresh Nodes</span>
					<RefreshCwIcon className="w-4 h-4" />
				</Button>
			</div>
			<div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
				{nodes.filter(item => item.active).map(item => <NodeItem key={item.id} item={item} /> )}
			</div>
		</div>
		);
};

export default NodeSelector;
