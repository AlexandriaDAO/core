import React from "react";
import { Button } from "@/lib/components/button";
import { LockKeyhole } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { createCanister } from "@/features/auth/thunks/createCanister";
import { useAssetManager, useLbry } from "@/hooks/actors";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/lib/components/alert-dialog";
// import { createAssetCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";

function NonCanisterView() {
    const {actor: assetManagerActor} = useAssetManager();
    const {actor: lbryActor} = useLbry();

    const dispatch = useAppDispatch();
    const {user, canisterError} = useAppSelector(state=> state.auth)

    const handleCreate = ()=>{
        try{
            if(!user) throw new Error('Unauthenticated User');
            if(!assetManagerActor) throw new Error('Asset Manager Actor not available');
            if(!lbryActor) throw new Error('LBRY Actor not available');

            // dispatch(createAssetCanister({ userPrincipal: user.principal }))
            dispatch(createCanister({assetManagerActor, lbryActor}))
        }catch(error){
            console.log('create error,' , error);
            toast.error('Failed. ' + (error instanceof Error ? error.message : String(error)))
        }
        if(!user) return;
    }

	return (
        <div className="flex flex-col items-center justify-between gap-3">
            <div className="p-2 bg-muted border rounded-full">
                <LockKeyhole size={22} className="text-primary"/>
            </div>
            <div className="flex flex-col gap-2 items-center justify-center font-roboto-condensed font-medium text-base">
                <span className="text-center">
                    You do not have a canister yet.
                </span>
                <span className="text-center">
                    Create a canister to start uploading assets.
                </span>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="link" scale="sm">
                        {canisterError ? 'Try Again!!':'Create Canister'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Create Your Own Asset Canister?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cost 500 LBRY (approximately $5).
                            <br /><br />
                            Benefits of having your own asset canister include:
                            <ul>
                                <li>- It will be yours forever.</li>
                                <li>- Assets will load much faster.</li>
                                <li>- Enhanced in-app visibility and other perks.</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCreate}>
                            Confirm & Create
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {canisterError &&
                <div className="flex flex-col gap-2 items-center justify-center font-roboto-condensed font-medium text-base text-destructive">
                    <span className="text-center">
                        An Error Occured while creating canister.
                    </span>
                    <span className="text-center">{canisterError}</span>
                </div>
            }
        </div>
	);
}

NonCanisterView.displayName = 'NonCanisterView';

export default NonCanisterView;