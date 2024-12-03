import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { WebIrys } from "@irys/sdk";
import { getNodeBalance, getServerIrys } from "@/services/irysService";
import { LoaderCircle } from "lucide-react";
import { useAlexWallet, useUser } from "@/hooks/actors";
import { SerializedNode } from "../my-nodes/myNodesSlice";
import { serializeNode } from "../my-nodes/utils";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSelectedNode } from "./uploadBookSlice";

const NodeRow: React.FC<{
	node: SerializedNode;
}> = ({ node }) => {
	const dispatch = useAppDispatch();
	const {actor} = useAlexWallet();
	const {selectedNode} = useAppSelector(state=>state.uploadBook);

	const [irys, setIrys] = useState<WebIrys | null>(null);
	const [loading, setLoading] = useState(false);

	const [balance, setBalance] = useState<number>(-1);
	const [balanceLoading, setBalanceLoading] = useState(false);

	const setNodeBalance = async () => {
		if(!irys) {
			setBalance(-1);
			return;
		}

		setBalanceLoading(true);
		try {
			const balance = await getNodeBalance(irys);
			setBalance(balance);
		} catch (error) {
			console.error('Error fetching balance:', error);
			toast.error('Failed to fetch balance');
			setBalance(-1);
		} finally {
		  	setBalanceLoading(false);
		}
	};

	useEffect(() => {
		setNodeBalance();
	}, [irys]);

	const setServerIrys = async () => {
		setLoading(true);
		try{
			if (!actor) {
				throw new Error("No actor available");
			}
			const serverIrys = await getServerIrys(node, actor);
			setIrys(serverIrys);
		}catch(error){
			if (error instanceof Error) {
				toast.error(error.message);
			}else{
				console.log('error loading web irys', error);
				toast.error('unable to load wallet')
			}
			setIrys(null);
		}finally{
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!node||!actor) return;
		setServerIrys();
	}, [node, actor]);

	if (loading) {
		return (
			<tr >
				<td colSpan={5} className="text-center p-4">
					<div className="flex items-center justify-center gap-1">
						<span className="text-md">Loading Node</span>
						<LoaderCircle size={12} className="animate-spin inline-block mr-2" />
					</div>
				</td>
			</tr>
		);
	}

	return (
		<tr
			key={node.id}
			className={`cursor-pointer ${
				selectedNode?.id === node.id ? "bg-gray-200" : ""
			}`}
			onClick={() => dispatch(setSelectedNode(node))} // Make the entire row clickable
		>
			<td className="p-2 text-left ">
				<input
					type="radio"
					checked={selectedNode?.id === node.id}
					onChange={() => setSelectedNode(node)}
				/>
			</td>
			<td className="p-2">{node.id}</td>
			<td className="p-2">{node.owner.toString().slice(0, 5) + "..." + node.owner.toString().slice(-3)}</td>
			<td className="p-2">{irys?.token ? irys.token : 'NA'}</td>
			<td className="p-2 flex items-center justify-center gap-1">
				{balanceLoading ? (
					<LoaderCircle size={14} className="animate-spin" />
				) : balance === -1 ? (
					"NA"
				) : (
					<span className="font-bold">{balance}</span>
				)}
			</td>
		</tr>
	)
};


const SelectNode = () => {
	const {actor} = useUser();
	const [nodes, setNodes] = useState<SerializedNode[]>([]); // State to hold nodes

	useEffect(() => {
		if(!actor) return;
		const fetchNodes = async () => {
			const nodes = await actor.get_active_nodes([]);

			setNodes(nodes.map(node => serializeNode(node)));
		};
		fetchNodes();
	}, []);

	return (
		<section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col">
			<main className="grid min-h-full place-items-center bg-white py-4">
				<div className="flex flex-col gap-1 w-full">
					<div className="flex justify-between items-center">
						<span className="mb-3 text-md leading-7 font-semibold text-gray-600">
							Active Nodes.
						</span>
						{/* <span className="text-sm text-right leading-7 text-gray-600">
							Estimated cost: 0.0001 ETH.
						</span> */}
					</div>
					<div className="text-center overflow-auto max-h-[300px] w-full bg-gray-100 border shadow rounded">
						<table className="min-w-full border-collapse w-full">
							<thead>
								<tr>
									<th className="p-2 text-left">Select</th>
									<th className="p-2">ID</th>
									<th className="p-2">Owner</th>
									<th className="p-2">Token</th>
									<th className="p-2">Balance</th>
								</tr>
							</thead>
							<tbody>
								{nodes.map((node) => {
									if(node.active){
										return <NodeRow
											key={node.id}
											node={node}
										/>
									}
								})}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</section>
	);
};

export default SelectNode;