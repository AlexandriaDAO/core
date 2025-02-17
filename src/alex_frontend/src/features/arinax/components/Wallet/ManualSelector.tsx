import React, { useCallback, useEffect } from "react";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchWallets from "../../thunks/fetchWallets";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/lib/components/button";
import WalletItem from "./Item";
import WalletSkeleton from "./Skeleton";
import { winstonToAr } from "@/features/wallets/utils";

const WalletManualSelector = () => {
	const {actor} = useUser();
	const dispatch = useAppDispatch();
	const {cost, wallets, fetching} = useAppSelector(state => state.arinax);

	const refresh = useCallback(()=>{
        if(!actor) return;
        dispatch(fetchWallets(actor))
	},[actor, dispatch, fetchWallets])

	useEffect(refresh, [refresh]);

	if(fetching) {
		return (
			<div className="space-y-2">
				{[...Array(3)].map((_, index) => (
					<WalletSkeleton key={index} />
				))}
			</div>
		)
	}

	if(wallets.length === 0) return <div className="text-center py-8 text-gray-500">No wallets available </div>

	return (
		<div className="space-y-2">
			<div className="leading-none">
				<h2 className="text-lg font-semibold ">Select Wallet</h2>
				<span className="text-sm">These are pre funded arweave wallets owned by librarians, a wallet is required to upload files.</span>
			</div>
			<div className="flex justify-end items-center">
				{cost && (
					<>
						<p className="text-right text-sm text-muted-foreground">
							Estimated Cost: {winstonToAr(cost)}
						</p>
						<div className="border-l dark:border-l-gray-300 h-6 mx-2"></div>
					</>
				)}
				<Button
					variant="muted"
					onClick={refresh}
					disabled={fetching}
					className="p-0"
				>
					<span className="text-sm">Refresh Nodes</span>
					<RefreshCwIcon className="w-4 h-4" />
				</Button>
			</div>
			<div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
				{wallets.map(item => <WalletItem key={item.id} item={item} /> )}
			</div>
		</div>
		);
};

export default WalletManualSelector;
