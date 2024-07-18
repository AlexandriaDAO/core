import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect, useState } from "react";

import { Node } from "../../../../../declarations/alex_backend/alex_backend.did";

import { initializeClient } from "@/services/meiliService";
import MeiliSearch from "meilisearch";
import FundWithdraw from "@/features/irys/arweave-funder/FundWithdraw";
import { Wallet, ethers } from "ethers";
import { WebIrys } from "@irys/sdk";
import { getSimpleWebIrys } from "../utils/irys";
import { shorten } from "../utils/node";
import { ImSpinner8 } from "react-icons/im";
import { Tooltip, message } from "antd";
import { CiCircleInfo } from "react-icons/ci";
// import { setActiveEngine } from "@/features/engine-overview/engineOverviewSlice";

interface NodeItemProps {
	node: Node;
}

const NodeItem = ({ node }: NodeItemProps) => {
	const [client, setClient] = useState<MeiliSearch | null | undefined>(
		undefined
	);
	const dispatch = useAppDispatch();

	// const { activeEngine } = useAppSelector((state) => state.engineOverview);

	// const handleEngineClick = () => {
	// 	if (activeEngine?.id == engine.id) {
	// 		dispatch(setActiveEngine(null));
	// 	} else {
	// 		dispatch(setActiveEngine(engine));
	// 	}
	// };
	// useEffect(() => {
	// 	const engineStatus = async () => {
	// 		const client = await initializeClient(engine.host, engine.key);
	// 		setClient(client);
	// 	};
	// 	engineStatus();
	// }, []);

	const [wallet, setWallet] = useState<Wallet | null>(null);
	const [webIrys, setWebIrys] = useState<WebIrys | null>(null);
	const [balance, setBalance] = useState<number | null | undefined>(null);
	const [amount, setAmount] = useState("0.0001");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!node || !node.pvt_key) return;

		const wallet = new ethers.Wallet(node.pvt_key);

		setWallet(wallet);
	}, []);

	useEffect(() => {
		if (!wallet) return;

		const setIrys = async () => {
			try{
				const irys = await getSimpleWebIrys(wallet);
				setWebIrys(irys);
			}catch(error){
				if (error instanceof Error) {
					message.error(error.message);
				}else{
					console.log('error loading irys', error);
					message.error('unable to load wallet')
				}
				setBalance(undefined);
			}
		};

		setIrys();
	}, [wallet]);

	const fetchBalance = async () => {
		if (!webIrys) return;
		setBalance(null);

		try{
			const atomicBalance = await webIrys.getLoadedBalance();

			const convertedBalance = parseFloat(
				webIrys.utils.fromAtomic(atomicBalance).toString()
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
	useEffect(() => {
		fetchBalance();
	}, [webIrys]);

	const fundNode = async () => {
		try {
			setLoading(true);
			if (!webIrys) {
				message.error("Node is not available");
				return;
			}
			const confirmation = window.confirm(
				`Funding the node will deduct ${amount} ETH from your wallet. Do you want to proceed?`
			);
			if (confirmation) {
				const fundTx = await webIrys.fund(
					webIrys.utils.toAtomic(amount)
				);

				message.success(
					`Successfully funded ${webIrys.utils.fromAtomic(
						fundTx.quantity
					)} ${webIrys.token}`
				);
				fetchBalance();
			}
		} catch (e) {
			message.error(
				"Funding Failed, Try Again."
			);
			console.log("Error funding node ", e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col justify-between items-start p-2 shadow border border-solid rounded font-roboto-condensed font-normal text-base">
			<div className="flex gap-2 justify-start items-center">
				<span>Private Key: </span>
				<span>
					{wallet && wallet.privateKey
						? shorten(wallet.privateKey)
						: "..."}
				</span>
			</div>
			<div className="flex gap-2 justify-start items-center">
				<span>Address: </span>
				<span>
					{wallet && wallet.address ? shorten(wallet.address) : "..."}
				</span>
			</div>
			<div className="flex gap-2 justify-start items-center">
				<div className="flex gap-1 items-center">
					<span>Balance</span>
					<Tooltip title="Showing the confirmed balance" className="flex items-center">
						<CiCircleInfo size={14} />
						<span>:</span>
					</Tooltip>
				</div>

				<span className="font-bold">
					{ balance === null ?
						<ImSpinner8 size={14} className="animate animate-spin" />:
						balance === undefined ? "NA" : (balance + "ETH")
					}
				</span>
			</div>

			<div className="flex flex-col gap-2 justify-start items-start">
				<span>Fund Node</span>
				<div className="flex gap-2">
					<div className="relative flex justify-between items-center">
						<input
							disabled={loading || balance === null || balance === undefined}
							type="number"
							step="0.0001"
							className={`py-1 pl-3 pr-10 text-text rounded-md border border-solid border-gray-300 shadow-sm ${loading || balance === null || balance === undefined ? 'bg-gray-200 cursor-not-allowed':'bg-white'}`}
							placeholder="0,0000"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
						<span className="absolute right-3 font-bold">ETH</span>
					</div>

					<button
						disabled={loading|| balance === null || balance === undefined}
						onClick={fundNode}
						className={` text-white font-medium px-4 py-1 rounded ${
							loading|| balance === null || balance === undefined ? "cursor-not-allowed bg-gray-500" : "cursor-pointer bg-black"
						}`}
					>
						{loading ? (
							<span className="flex gap-1 items-center">
								Processing{" "}
								<ImSpinner8
									size={14}
									className="animate animate-spin"
								/>
							</span>
						) : balance === null || balance === undefined ? "Disabled" : (
							"Fund Node"
						)}
					</button>
				</div>
			</div>
			{/* <FundWithdraw /> */}
		</div>
	);
};

export default NodeItem;