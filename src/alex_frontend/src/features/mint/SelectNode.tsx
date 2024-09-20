import useSession from "@/hooks/useSession";
import React, { useEffect, useState } from "react";
import { Node } from "../../../../../src/declarations/alex_librarian/alex_librarian.did";
import { getTypedIrys } from "../irys/utils/getIrys";
import { ImSpinner8 } from "react-icons/im";
import { message } from "antd";


const NodeRow: React.FC<{
	node: Node;
	selectedNode: Node | null;
	setSelectedNode: (node: Node) => void;
}> = ({ node, selectedNode, setSelectedNode }) => {

	const { actorAlexWallet } = useSession();

	const [balance, setBalance] = useState<number | null | undefined>(null);

	// similar code for fetching balanace available in features/my-nodes/components/Nodeitem.tsx
	useEffect(() => {
		const fetchBalance = async () => {
			const irys = await getTypedIrys(actorAlexWallet, node.id);

			setBalance(null);

			try{
				const atomicBalance = await irys.getLoadedBalance();

				const convertedBalance = parseFloat(
					irys.utils.fromAtomic(atomicBalance).toString()
				);

				setBalance(convertedBalance);
			}catch(error){
				if (error instanceof Error) {
					message.error(error.message);
				}else{
					console.log('error loading balalnce', error);
					message.error('unable to load balance')
				}
				setBalance(undefined);
			}
		};
		fetchBalance();
	}, [node]);

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
			<td className="p-2">
				<span className="font-bold flex justify-center items-center">
					{ balance === null ?
						<ImSpinner8 size={14} className="animate animate-spin" />:
						balance === undefined ? "NA" : (balance + "ETH")
					}
				</span>
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
	const { actorAlexLibrarian } = useSession();
	const [nodes, setNodes] = useState<Node[]>([]); // State to hold nodes

	useEffect(() => {
		const fetchNodes = async () => {
			if (!actorAlexLibrarian) return;

			const nodes = await actorAlexLibrarian.get_nodes();

			console.log("nodes", nodes);

			setNodes(nodes);
		};

		fetchNodes();
	}, [actorAlexLibrarian]);

	return (
		<section className="flex-grow h-full overflow-auto p-4 w-full flex flex-col">
			<main className="grid min-h-full place-items-center bg-white py-24">
				<div className="flex flex-col gap-1 w-full">
					<span className="mb-3 text-md leading-7 font-semibold text-gray-600">
						Showing Active Nodes.
					</span>

					<span className="text-sm text-right leading-7 text-gray-600">
						Estimated cost to mint you book: 0.0001 ETH.
					</span>
					<div className="text-center overflow-auto max-h-[500px] w-full bg-gray-100 border shadow rounded">
						<table className="min-w-full border-collapse w-full">
							<thead>
								<tr>
									<th className="p-2 text-left">Select</th>
									<th className="p-2">ID</th>
									<th className="p-2">Owner</th>
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