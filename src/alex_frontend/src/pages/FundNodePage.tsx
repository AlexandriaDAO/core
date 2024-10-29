// import { useAppDispatch } from "@/store/hooks/useAppDispatch";
// import React, { useEffect, useState } from "react";

// import MeiliSearch from "meilisearch";
// import { Wallet, ethers } from "ethers";
// import { WebIrys } from "@irys/sdk";
// import { Tooltip } from "antd";
// import { toast } from "sonner";
// import MainLayout from "@/layouts/MainLayout";
// import { getSimpleWebIrys } from "@/features/node/utils/irys";
// import { Info, LoaderCircle } from "lucide-react";


// const FundNodePage = () => {
// 	const [webIrys, setWebIrys] = useState<WebIrys | null>(null);
// 	const [balance, setBalance] = useState<number | null | undefined>(null);
// 	const [amount, setAmount] = useState("0.0001");
// 	const [loading, setLoading] = useState(false);


// 	useEffect(() => {
// 		const setIrys = async () => {
// 			try{
// 				const irys = await getSimpleWebIrys();
// 				setWebIrys(irys);
// 			}catch(error){
// 				if (error instanceof Error) {
// 					toast.error(error.message);
// 				}else{
// 					console.log('error loading irys', error);
// 					toast.error('unable to load wallet')
// 				}
// 				setBalance(undefined);
// 			}
// 		};

// 		setIrys();
// 	}, []);

// 	const fetchBalance = async () => {
// 		if (!webIrys) return;
// 		setBalance(null);

// 		try{
// 			const atomicBalance = await webIrys.getLoadedBalance();

// 			const convertedBalance = parseFloat(
// 				webIrys.utils.fromAtomic(atomicBalance).toString()
// 			);

// 			setBalance(convertedBalance);
// 		}catch(error){
// 			if (error instanceof Error) {
// 				toast.error(error.message);
// 			}else{
// 				console.log('error loading balalnce', error);
// 				toast.error('unable to load balance')
// 			}
// 			setBalance(undefined);
// 		}
// 	};
// 	useEffect(() => {
// 		fetchBalance();
// 	}, [webIrys]);

// 	const fundNode = async () => {
// 		try {
// 			setLoading(true);
// 			if (!webIrys) {
// 				toast.error("Node is not available");
// 				return;
// 			}
// 			const confirmation = window.confirm(
// 				`Funding the node will deduct ${amount} ETH from your wallet. Do you want to proceed?`
// 			);
// 			if (confirmation) {
// 				const fundTx = await webIrys.fund(
// 					webIrys.utils.toAtomic(amount)
// 				);

// 				toast.success(
// 					`Successfully funded ${webIrys.utils.fromAtomic(
// 						fundTx.quantity
// 					)} ${webIrys.token}`
// 				);
// 				fetchBalance();
// 			}
// 		} catch (e) {
// 			toast.error(
// 				"Funding Failed, Try Again."
// 			);
// 			console.log("Error funding node ", e);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<MainLayout>
// 			<div className="w-full flex-grow p-3 flex gap-2 flex-col items-center justify-center">
// 				<div className="flex justify-between items-center">
// 					<div className="font-syne font-medium text-xl text-black">
// 						Fund Your Node
// 					</div>
// 				</div>

// 				<div className="flex flex-col justify-between items-start p-2 shadow border border-solid rounded font-roboto-condensed font-normal text-base">
// 					{/* <div className="flex gap-2 justify-start items-center">
// 						<span>Private Key: </span>
// 						<span>
// 							{wallet && wallet.privateKey
// 								? shorten(wallet.privateKey)
// 								: "..."}
// 						</span>
// 					</div>
// 					<div className="flex gap-2 justify-start items-center">
// 						<span>Address: </span>
// 						<span>
// 							{wallet && wallet.address ? shorten(wallet.address) : "..."}
// 						</span>
// 					</div> */}

// 					<div className="flex gap-2 justify-start items-center">
// 						<div className="flex gap-1 items-center">
// 							<span>Balance</span>
// 							<Tooltip title="Showing the confirmed balance" className="flex items-center">
// 								<CiCircleInfo size={14} />
// 								<span>:</span>
// 							</Tooltip>
// 						</div>

// 						<span className="font-bold">
// 							{ balance === null ?
// 								<LoaderCircle size={14} className="animate animate-spin" />:
// 								balance === undefined ? "NA" : (balance + "ETH")
// 							}
// 						</span>
// 					</div>

// 					<div className="flex flex-col gap-2 justify-start items-start">
// 						<span>Fund Node</span>
// 						<div className="flex gap-2">
// 							<div className="relative flex justify-between items-center">
// 								<input
// 									disabled={loading || balance === null || balance === undefined}
// 									type="number"
// 									step="0.0001"
// 									className={`py-1 pl-3 pr-10 text-text rounded-md border border-solid border-gray-300 shadow-sm ${loading || balance === null || balance === undefined ? 'bg-gray-200 cursor-not-allowed':'bg-white'}`}
// 									placeholder="0,0000"
// 									value={amount}
// 									onChange={(e) => setAmount(e.target.value)}
// 								/>
// 								<span className="absolute right-3 font-bold">ETH</span>
// 							</div>

// 							<button
// 								disabled={loading|| balance === null || balance === undefined}
// 								onClick={fundNode}
// 								className={` text-white font-medium px-4 py-1 rounded ${
// 									loading|| balance === null || balance === undefined ? "cursor-not-allowed bg-gray-500" : "cursor-pointer bg-black"
// 								}`}
// 							>
// 								{loading ? (
// 									<span className="flex gap-1 items-center">
// 										Processing{" "}
// 										<Info
// 											size={14}
// 											className="animate animate-spin"
// 										/>
// 									</span>
// 								) : balance === null || balance === undefined ? "Disabled" : (
// 									"Fund Node"
// 								)}
// 							</button>
// 						</div>
// 					</div>
// 					{/* <FundWithdraw /> */}
// 				</div>
// 			</div>
// 		</MainLayout>
// 	);
// };

// export default FundNodePage;
