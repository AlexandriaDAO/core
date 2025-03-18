import React, { useEffect } from "react";

import { toast } from "sonner";

import { LoaderCircle, Trash2 } from "lucide-react";
import { SerializedWallet, setDeleting } from "../walletsSlice";
import { useAlexWallet } from "@/hooks/actors";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import deleteWallet from "../thunks/deleteWallet";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Tooltip } from "antd";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/lib/components/alert-dialog";

interface DeleteWalletProps {
	wallet: SerializedWallet;
}

const DeleteWallet = ({ wallet }: DeleteWalletProps) => {
	if(!wallet) return null;
	const dispatch = useAppDispatch();
	const {actor} = useAlexWallet();

	const {deleting} = useAppSelector((state) => state.wallets);

	const handleDeleteWallet = ()=>{
        dispatch(setDeleting(wallet.id))
    }
	useEffect(()=>{
        if(deleting !== wallet.id) return;

        if(!actor) {
			toast('Failed, Try later!!!')
            return;
        }

        dispatch(deleteWallet({actor, wallet}))
    },[wallet, deleting, actor, dispatch])

	if(deleting === wallet.id) 	return (
		<Button
			variant="destructive"
			scale="sm"
			className="flex-grow"
            disabled
		>
			<LoaderCircle size={14} className="animate animate-spin text-white" /> Deleting
		</Button>
	);


    return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="destructive"
					scale="sm"
					className="flex-grow"
				>
					<Trash2 size={14} />
					<span>Delete</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						<span>
							The wallet will be removed from the system.
							<br />
							Make sure you have a backup of your wallet
							<br />
							or you have withdrawn all your funds.
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDeleteWallet}>Confirm</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteWallet;
