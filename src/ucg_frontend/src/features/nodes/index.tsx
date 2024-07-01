import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";

import { ImSpinner8 } from "react-icons/im";
import NodeItem from "./components/NodeItem";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import useSession from "@/hooks/useSession";
import { ucg_backend } from "../../../../../src/declarations/ucg_backend";
import fetchNodes from "./thunks/fetchNodes";
import { FiRefreshCcw } from "react-icons/fi";

function Nodes() {
	const { actor } = useSession();

	const dispatch = useAppDispatch();
	const { nodes, loading } = useAppSelector((state) => state.nodes);

	useEffect(() => {
		console.log("fetching my nodes");
		dispatch(fetchNodes(actor));
	}, []);

	return (
		<div className="flex-grow flex flex-col font-roboto-condensed font-normal text-base">
			<h1 className="py-3 text-gray-900">Nodes</h1>
			<div className="flex-grow bg-[#F4F4F4] gap-1 grid grid-rows-[auto_1fr_auto]">
				<div className="flex justify-between items-center p-1">
					<span>Available Nodes</span>
					<div className="px-2 flex items-center gap-1 cursor-pointer hover:text-gray-800 transition-all duration-100 ">
						<FiRefreshCcw
							onClick={()=>{dispatch(fetchNodes(actor))}}
							size={18}
							className={`${loading ? "animate-spin" : ""}`}
						/>
					</div>
				</div>

				{loading ? (
					<div className="flex px-2 items-center justify-center border-t border-b overflow-auto max-h-28">
						<ImSpinner8
							size={18}
							className="animate animate-spin text-black"
						/>
					</div>
				) : (
					<div className="flex flex-col gap-2 px-2 items-center justify-start border-t border-b overflow-auto max-h-28">
						{nodes.map((node) => (
							<NodeItem key={node.id} node={node} />
						))}
					</div>
				)}

				<div className="flex justify-end items-center p-1">
					<button className="bg-transparent border-b border-gray-500 text-gray-700 cursor-pointer py-0 hover:border-gray-800 hover:text-black">
						Become A Librarian
					</button>
				</div>
			</div>
		</div>
	);
}

export default Nodes;
