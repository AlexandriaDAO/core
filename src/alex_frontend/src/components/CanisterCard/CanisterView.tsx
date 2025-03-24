import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { getCanisterCycles } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import { Button } from "@/lib/components/button";
import Copy from "../Copy";
import ROUTES from "@/routes/routeConfig";

function CanisterView() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { userAssetCanister, cycles } = useAppSelector(state => state.assetManager);
    useEffect(() => {
        if(!userAssetCanister) return;

        dispatch(getCanisterCycles(userAssetCanister))
    }, [userAssetCanister]);

    if(!userAssetCanister) return null;

	return (
        <div className="flex flex-col items-center justify-between gap-3">
            <div className="p-2 bg-muted border rounded-full">
                <Check size={22} className="text-constructive"/>
            </div>
            <span className="font-roboto-condensed font-medium text-base">
                Your canister has been created.
            </span>
            {cycles && (
                <span className="font-roboto-condensed font-medium text-base">
                    It has {cycles} cycles remaining.
                </span>
            )}

            <div className="flex items-center space-x-2">
                <code className="px-2 py-1 border bg-white dark:bg-transparent rounded text-sm font-mono">{userAssetCanister}</code>
                <Copy text={userAssetCanister} />
            </div>
            <Button
                variant={"link"}
                scale={"sm"}
                onClick={()=>navigate(ROUTES.DASHBOARD_ROUTES.ASSET_SYNC)}>
                View Assets
            </Button>
        </div>
    )
}

export default CanisterView;