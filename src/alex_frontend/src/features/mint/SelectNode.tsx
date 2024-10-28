import React, { useEffect, useState } from "react";
import { Node } from "../../../../../src/declarations/alex_librarian/alex_librarian.did";
import { ImSpinner8 } from "react-icons/im";
import { toast } from "sonner";
import { WebIrys } from "@irys/sdk";
import { getNodeBalance, getServerIrys } from "@/services/irysService";
import { getActorAlexLibrarian } from "../auth/utils/authUtils";

const NodeRow: React.FC<{
	node: Node;
	selectedNode: Node | null;
	setSelectedNode: (node: Node) => void;
}> = ({ node, selectedNode, setSelectedNode }) => {

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
			const serverIrys = await getServerIrys(node.id);
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
		if (!node) return;
		setServerIrys();
	}, [node]);

	if (loading) {
		return (
			<tr >
				<td colSpan={5} className="text-center p-4">
					<div className="flex items-center justify-center gap-1">
						<span className="text-md">Loading Node</span>
						<ImSpinner8 size={12} className="animate-spin inline-block mr-2" />
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
			onClick={() => setSelectedNode(node)} // Make the entire row clickable
		>
			<td className="p-2 text-left ">
				<input
					type="radio"
					checked={selectedNode?.id === node.id}
					onChange={() => setSelectedNode(node)}
				/>
			</td>
			<td className="p-2">{node.id}</td>
			<td className="p-2">{node.owner.slice(0, 5) + "..." + node.owner.slice(-3)}</td>
			<td className="p-2">{irys?.token ? irys.token : 'NA'}</td>
			<td className="p-2 flex items-center justify-center gap-1">
				{balanceLoading ? (
					<ImSpinner8 size={14} className="animate-spin" />
				) : balance === -1 ? (
					"NA"
				) : (
					<span className="font-bold">{balance}</span>
				)}
			</td>
		</tr>
	)
};

interface SelectNodeProps {
	setSelectedNode: (node: Node) => void; // Function to set the selected node
	selectedNode: Node | null; // Currently selected node
}

const SelectNode: React.FC<SelectNodeProps> = ({
	setSelectedNode,
	selectedNode,
}) => {
	const [nodes, setNodes] = useState<Node[]>([]); // State to hold nodes

	useEffect(() => {
		const fetchNodes = async () => {
			const actorAlexLibrarian = await getActorAlexLibrarian();

			const nodes = await actorAlexLibrarian.get_nodes();

			setNodes(nodes);
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
									if('Active' in node.status){
										return <NodeRow
											key={node.id}
											node={node}
											selectedNode={selectedNode}
											setSelectedNode={setSelectedNode}
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