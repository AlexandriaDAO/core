import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchWallets from "../../thunks/fetchWallets";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/lib/components/button";
import WalletItem from "./Item";
import WalletSkeleton from "./Skeleton";
import { winstonToAr } from "@/features/wallets/utils";
import Arweave from "arweave";
import { setWallet } from "../../arinaxSlice";
import uploadFile from "../../thunks/uploadFile";

const arweave = Arweave.init({});

interface WalletAutoSelectorProps {
    file: File | null;
}

const WalletAutoSelector = ({file}: WalletAutoSelectorProps) => {
	if(!file) return null;
	const {actor} = useUser();
	const dispatch = useAppDispatch();
	const {cost, wallet, wallets, fetching, estimating, uploading, transaction} = useAppSelector(state => state.arinax);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(()=>{
		if(!actor) return;

		dispatch(fetchWallets(actor))
	}, [actor, dispatch]);

	useEffect(()=>{
		if(!cost || wallets.length <= 0) return;

		try{
			setLoading(true);

			const wallet = wallets.find(wallet => {
				return arweave.ar.isGreaterThan(wallet.balance, cost);
			});
			if(!wallet) {
				setError("No wallet found");
				return;
			}

			dispatch(setWallet(wallet));
		}catch(error){
			console.error(error);
		}finally{
			setLoading(false);
		}
	}, [cost, wallets]);

	useEffect(()=>{
		if(!wallet || !file || !actor || uploading || transaction) return;

		dispatch(uploadFile({file, wallet, actor}));
	}, [uploading,wallet, file, actor]);


	if(loading) return <div className="p-2">Loading...</div>

	if(error) return <div className="p-2">{error}</div>

	if(estimating) {
		return (
			<div className="p-2">
				Estimating cost...
			</div>
		)
	}

	if(fetching) {
		return (
			<div className="p-2">
				Fetching wallets...
			</div>
		)
	}

	if(wallets.length === 0) return <div className="text-center py-8 text-gray-500">No wallets available </div>

	return <>Unknown</>;
};

export default WalletAutoSelector;
