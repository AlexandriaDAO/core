import React, { lazy, Suspense, useEffect } from "react";
import { useAlexWallet } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchMyWallets from "@/features/wallets/thunks/fetchMyWallets";
import { AddArweaveWallet } from "@/features/add-wallet";
import { Button } from "@/lib/components/button";
import { RefreshCcw } from "lucide-react";

const AlexWalletActor = lazy(() => import("@/actors").then(module => ({ default: module.AlexWalletActor })));
const Wallets = lazy(() => import("@/features/wallets"));

function WalletsPageCore() {
	const {actor} = useAlexWallet();

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

function WalletsPage() {
	return (
		<Suspense fallback={<div>Loading components...</div>}>
			<AlexWalletActor>
				<WalletsPageCore />
			</AlexWalletActor>
		</Suspense>
	)
}

export default WalletsPage;