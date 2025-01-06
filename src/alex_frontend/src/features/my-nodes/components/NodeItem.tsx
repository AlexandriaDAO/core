import React, { useEffect, useState } from "react";

import { WebIrys } from "@irys/sdk";
import { Tooltip } from "antd";
import { toast } from "sonner";
import { getNodeBalance, getServerIrys } from "@/services/irysService";
import { shorten } from "@/utils/general";

import { Copy, LoaderCircle, RefreshCcw, Trash2 } from "lucide-react";
import { SerializedNode } from "../myNodesSlice";
import { useAlexWallet, useUser } from "@/hooks/actors";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

interface NodeItemProps {
	node: SerializedNode;
}

const NodeItem = ({ node }: NodeItemProps) => {
	const dispatch = useAppDispatch();
	const {actor} = useAlexWallet();
	const {actor: userActor} = useUser();
	const [irys, setIrys] = useState<WebIrys | null>(null);

	const [loading, setLoading] = useState(false);

	const [balance, setBalance] = useState<number>(-1);
	const [balanceLoading, setBalanceLoading] = useState(false);

	const setServerIrys = async () => {
		setLoading(true);
		try{
			if (!actor) {
				throw new Error("No actor available");
			}
			const webIrys = await getServerIrys(node, actor);
			setIrys(webIrys);
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
		if (!node || !node) return;
		setServerIrys();
	}, [node, actor]);

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

	const deleteNode = async () => {
		try {
			if(!userActor) {
				throw new Error('No user actor available');
			}

			const result = await userActor.delete_node(BigInt(node.id));

			if('Ok' in result){
				window.location.reload();
				toast.success('Node deleted successfully');
			}else{
				throw new Error(result.Err);
			}
		} catch (error) {
			console.error('Error deleting node:', error);
			toast.error('Failed to delete node');
		}
	};

	return (
		<div className={`relative ${loading ? 'cursor-not-allowed pointer-events-none' : ''}`}>
			<div className={`flex flex-col gap-4 justify-between items-start p-2 shadow border border-solid rounded font-roboto-condensed font-normal text-base ${loading ? 'opacity-40' : ''}`}>
				<table className="w-full">
					<tbody>
						<tr>
							<td className="pr-4">Status</td>
							<td>{node.active ? 'Active' : 'InActive'}</td>
						</tr>
						<tr>
							<td className="pr-4">Token</td>
							<td>{irys?.token ? irys.token : 'NA'}</td>
						</tr>
						<tr>
							<td className="pr-4">Address</td>
							<td className="flex items-center gap-2">
								<span>{irys && irys.address ? shorten(irys.address) : "..."}</span>

								<Tooltip title="Copy Address">
									<span className={`${!(irys && irys.address) ? 'cursor-not-allowed' : ''}`}>
										<Copy
											size={14}
											onClick={() => {
												if (irys && irys.address) {
													navigator.clipboard.writeText(irys.address);
													toast.success('Copied to clipboard');
												} else {
													toast.error('No address to copy');
												}
											}}
											className={!(irys && irys.address) ? 'text-gray-400' : 'cursor-pointer'}
										/>
									</span>
								</Tooltip>
							</td>
						</tr>
						<tr>
							<td className="pr-4">Balance</td>
							<td>
								<div className="flex items-center gap-2">
									<span className={`font-bold ${balanceLoading ? 'text-gray-400' : ''}`}>{balance === -1 ? 'N/A' : balance}</span>

									<Tooltip title="Refresh Balance" className="cursor-pointer">
										<span>
											<RefreshCcw className={`${balanceLoading ? 'animate-spin' : ''}`} size={18} onClick={setNodeBalance} />
										</span>
									</Tooltip>
								</div>
							</td>
						</tr>
						<tr>
							<td colSpan={2} className="p-2 shadow border border-solid rounded font-roboto-condensed font-normal text-base bg-yellow-100 border-l-4 border-yellow-500">
								<ul className="list-disc pl-5 font-roboto-condensed text-sm">
									<li>Showing the confirmed balance.</li>
									<li>Deposits can take a few minutes to reflect.</li>
									<li>Use the refresh button to fetch latest balance.</li>
								</ul>
							</td>
						</tr>
						<tr>
							<td colSpan={2} className="text-center py-2">
								<Button
									variant="destructive"
									scale="sm"
									onClick={deleteNode}
								>
									<Trash2 size={14} />
									<span>Delete This Node</span>
								</Button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			{loading &&
				<div className="w-full h-full absolute inset-0 backdrop-blur flex justify-center items-center border border-solid  border-gray-400 rounded">
					<span className="bg-black/100 shadow rounded p-2">
						<LoaderCircle size={14} className="animate animate-spin text-white" />
					</span>
				</div>
			}
		</div>
	);
};

export default NodeItem;