import React from "react";
import { Button } from "@/lib/components/button";
import { LockKeyhole } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { createAssetCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";

function NonCanisterView() {
    const dispatch = useAppDispatch();
    const {user} = useAppSelector(state=> state.auth)

    const handleCreate = ()=>{
        if(!user) return;

        dispatch(createAssetCanister({ userPrincipal: user.principal }))
    }

	return (
        <div className="flex flex-col items-center justify-between gap-3">
            <div className="p-2 bg-muted border rounded-full">
                <LockKeyhole size={22} className="text-primary"/>
            </div>
            <span className="font-roboto-condensed font-medium text-base">
                Your do not have a canister yet. Create a canister to start uploading assets.
            </span>
            <Button variant="link" scale="sm" onClick={handleCreate}>
                Create Canister
            </Button>
        </div>
	);
}

NonCanisterView.displayName = 'NonCanisterView';

export default NonCanisterView;