import React, { useEffect } from "react";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchMyWallets from "@/features/wallets/thunks/fetchMyWallets";
import Wallets from "@/features/wallets";
import { AddArweaveWallet } from "@/features/add-wallet";
import { Button } from "@/lib/components/button";
import { RefreshCcw } from "lucide-react";

function WalletsPage() {
	const {actor} = useUser();

	const dispatch = useAppDispatch();

	const { loading } = useAppSelector((state) => state.wallets);

	const refreshWallets = () => {
		if(!actor) return;
		dispatch(fetchMyWallets(actor));
	}

	useEffect(()=>{
		refreshWallets();
	},[actor])

	return (
		<>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Arweave Wallets</h1>
				<div className="flex items-center gap-2">
					<Button
						disabled={loading}
						variant="outline"
						scale="default"
						className="flex items-center gap-2 border border-ring"
						onClick={refreshWallets}
					>
						<RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
						Refresh wallets
					</Button>
					<AddArweaveWallet />
				</div>
			</div>
			<div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-6">
				<Wallets />
			</div>
		</>
	)
}

export default WalletsPage;