import React, { useEffect } from "react";

import { toast } from "sonner";

import { SerializedWallet, setUpdating } from "../walletsSlice";
import { useAlexWallet } from "@/hooks/actors";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import updateWalletStatus from "../thunks/updateWalletStatus";
import { LoaderCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/lib/components/alert-dialog";
import { NavLink } from "react-router";
import { APP_ROUTES } from "@/routes/routeConfig";

interface UpdateWalletProps {
	wallet: SerializedWallet;
}

const UpdateWallet = ({ wallet }: UpdateWalletProps) => {
	if(!wallet) return null;
	const dispatch = useAppDispatch();
	const {actor} = useAlexWallet();

	const {updating} = useAppSelector((state) => state.wallets);

	const handleToggleWalletActivation = ()=>{
        dispatch(setUpdating(wallet.id))
    }

    useEffect(()=>{
        if(updating !== wallet.id) return;

        if(!actor) {
            toast('Failed, Try later!!!')
            return;
        }

        dispatch(updateWalletStatus({actor, id: updating, active: !wallet.active}))
    },[wallet, updating, actor, dispatch])

	if(updating === wallet.id) 	return (
		<Button
			variant="info"
			scale="sm"
			className="flex-grow"
			disabled
		>
			<LoaderCircle size={14} className="animate animate-spin text-white" /> {wallet.active ? 'Deactivating' : 'Activating'}
		</Button>
	);


	return (
		// <Tooltip title={wallet.active ? 'Deactivate this wallet' : 'Activate wallet to be used for uploading files in Pinax App'}>
		// 	<Button
		// 		variant="info"
		// 		scale="sm"
		// 		onClick={handleToggleWalletActivation}
		// 		className="flex-grow"
		// 	>
		// 		{wallet.active ? 'Deactivate' : 'Activate'}
		// 	</Button>
		// </Tooltip>
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="info"
					scale="sm"
					className="flex-grow"
				>
					{wallet.active ? 'Deactivate' : 'Activate'}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						{wallet.active ? (
							<span>
								The wallet will be deactivated.
								<br />
								Users will not be able to use this wallet to upload files in the <NavLink to={APP_ROUTES.PINAX}><Button variant="link" scale="sm" className="h-6 px-1">Pinax App</Button></NavLink>.
							</span>
						) : (
							<span>
								The wallet will be activated.
								<br />
								Users will be able to use this wallet to upload files in the <NavLink to={APP_ROUTES.PINAX}><Button variant="link" scale="sm" className="h-6 px-1">Pinax App</Button></NavLink>
								<br />
								Wallet selection process is automatic.
							</span>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleToggleWalletActivation}>Confirm</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default UpdateWallet;
