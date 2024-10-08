import React, { useEffect, useState } from "react";

import { Node } from "../../../../../declarations/alex_librarian/alex_librarian.did";

import { WebIrys } from "@irys/sdk";
import { ImSpinner8 } from "react-icons/im";
import { Tooltip, message } from "antd";
import { IoCopyOutline, IoRefreshOutline } from "react-icons/io5";
import { SlInfo } from "react-icons/sl";
import { getClientIrys, getNodeBalance, getServerIrys } from "@/services/irysService";
import { shorten } from "@/utils/general";
import useSession from "@/hooks/useSession";
import { MdOutlineRefresh } from "react-icons/md";
// import { setActiveEngine } from "@/features/engine-overview/engineOverviewSlice";

interface NodeItemProps {
	node: Node;
}

const NodeItem = ({ node }: NodeItemProps) => {
	const [irys, setIrys] = useState<WebIrys | null>(null);
	const [amount, setAmount] = useState("0.0001");

	const [loading, setLoading] = useState(false);

	const [balance, setBalance] = useState<number>(-1);
	const [balanceLoading, setBalanceLoading] = useState(false);

	const setServerIrys = async () => {
		setLoading(true);
		try{
			const webIrys = await getServerIrys(node.id);
			setIrys(webIrys);
		}catch(error){
			if (error instanceof Error) {
				message.error(error.message);
			}else{
				console.log('error loading web irys', error);
				message.error('unable to load wallet')
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
			message.error('Failed to fetch balance');
			setBalance(-1);
		} finally {
		  	setBalanceLoading(false);
		}
	};

	useEffect(() => {
		setNodeBalance();
	}, [irys]);

	return (
		<div className={`relative ${loading ? 'cursor-not-allowed pointer-events-none' : ''}`}>
			<div className={`flex flex-col gap-4 justify-between items-start p-2 shadow border border-solid rounded font-roboto-condensed font-normal text-base ${loading ? 'opacity-40' : ''}`}>
				<table className="w-full">
					<tbody>
						<tr>
							<td className="pr-4">Status</td>
							<td>{'Active' in node.status ? 'Active' : 'InActive'}</td>
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
										<IoCopyOutline
											size={14}
											onClick={() => {
												if (irys && irys.address) {
													navigator.clipboard.writeText(irys.address);
													message.success('Copied to clipboard');
												} else {
													message.error('No address to copy');
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
											<MdOutlineRefresh className={`${balanceLoading ? 'animate-spin' : ''}`} size={18} onClick={setNodeBalance} />
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
					</tbody>
				</table>
			</div>
			{loading &&
				<div className="w-full h-full absolute inset-0 backdrop-blur flex justify-center items-center border border-solid  border-gray-400 rounded">
					<span className="bg-black/100 shadow rounded p-2">
						<ImSpinner8 size={14} className="animate animate-spin text-white" />
					</span>
				</div>
			}
		</div>
	);
};

export default NodeItem;