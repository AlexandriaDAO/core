import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useState } from "react";

import { Node } from "../../../../../declarations/ucg_backend/ucg_backend.did";

import { initializeClient } from "@/services/meiliService";
import MeiliSearch from "meilisearch";
import FundWithdraw from "@/features/irys/arweave-funder/FundWithdraw";
import { Wallet, ethers } from "ethers";
import { WebIrys } from "@irys/sdk";
import { ImSpinner8 } from "react-icons/im";
import { Tooltip, message } from "antd";
import { CiCircleInfo } from "react-icons/ci";
import { setActiveNode } from "../nodesSlice";
// import { setActiveEngine } from "@/features/engine-overview/engineOverviewSlice";

interface NodeItemProps {
	node: Node;
}

const NodeItem = ({ node }: NodeItemProps) => {
	const dispatch = useAppDispatch();

	const { activeNode } = useAppSelector((state) => state.nodes);

	const handleNodeClick = () => {
		if (activeNode?.id == node.id) {
			dispatch(setActiveNode(null));
		} else {
			dispatch(setActiveNode(node));
		}
	};


	return (
		// <div className="flex gap-2 w-full px-1 justify-start items-center">
		// 	<span>Id: </span>
		// 	<span>{node.id}</span>
		// </div>
		<button
			onClick={handleNodeClick}
			className={`w-full px-1 flex justify-start gap-1 items-center shadow border border-solid border-gray-500 rounded font-roboto-condensed text-base leading-[18px] font-medium transition-all duration-100 ease-in cursor-pointer ${
				activeNode?.id == node.id
					? "bg-black text-white"
					: "text-black hover:bg-black hover:text-white"
			}
	`}
		>
			Node Id: {node.id}
		</button>
	);
};

export default NodeItem;
