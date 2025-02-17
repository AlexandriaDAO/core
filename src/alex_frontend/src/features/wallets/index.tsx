import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import WalletItem from "./components/WalletItem";
import NoWallet from "./components/NoWallet";
import { LoaderCircle } from "lucide-react";

function Wallets() {
	const { wallets, loading } = useAppSelector((state) => state.wallets);

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Wallets</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(wallets.length<=0) return <NoWallet />

	return (
		<div className="w-full flex gap-2 flex-col">
			<div className="flex justify-between items-center">
				<div className="font-syne font-medium text-xl">
					Created Wallets
				</div>
			</div>
			<div className="flex gap-4 justify-start items-center">
				{wallets.map((wallet) => (
					<WalletItem key={wallet.id} wallet={wallet} />
				))}
			</div>
		</div>
	);
}

export default Wallets;