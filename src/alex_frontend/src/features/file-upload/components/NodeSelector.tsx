import React, { useCallback, useEffect } from "react";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchNodes from "../thunks/fetchNodes";
import NodeSkeleton from "./NodeSkeleton";
import NodeItem from "./NodeItem";
import { formatAmount } from "../utils";


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
		<div className="space-y-4">
			<div className="mb-5 leading-none">
				<div className="flex items-center justify-between ">
					<h2 className="text-lg font-semibold text-gray-700">Select Source Node</h2>
					<button
						onClick={refresh}
						disabled={fetching}
						className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 disabled:text-blue-400"
					>
						<svg
							className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						<span className="text-sm">Refresh Nodes</span>
					</button>
				</div>
				<span className="text-sm text-gray-500">A node is a pre funded irys instance which is required to upload files.</span>
			</div>
			<div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
				{cost && (
					<p className="text-right text-sm text-gray-500">
						Estimated Cost: {formatAmount(cost)}
					</p>
				)}
				<div className="space-y-2">
					{nodes.filter(item => item.active).map(item => <NodeItem key={item.id} item={item} /> )}
				</div>
			</div>
		</div>
		);
};

export default NodeSelector;
