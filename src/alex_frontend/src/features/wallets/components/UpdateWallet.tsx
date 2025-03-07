import React, { useEffect } from "react";

import { toast } from "sonner";

import { SerializedWallet, setUpdating } from "../walletsSlice";
import { useAlexWallet } from "@/hooks/actors";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import updateWalletStatus from "../thunks/updateWalletStatus";
import { LoaderCircle } from "lucide-react";

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
		<Button
			variant="info"
			scale="sm"
			onClick={handleToggleWalletActivation}
			className="flex-grow"
		>
			{wallet.active ? 'Deactivate' : 'Activate'}
		</Button>
	);
};

export default UpdateWallet;
