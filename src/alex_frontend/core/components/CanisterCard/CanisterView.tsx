import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import Copy from "../Copy";
import { useAssetManager } from "@/hooks/actors";
import { Principal } from "@dfinity/principal";

function CanisterView() {
    const { actor } = useAssetManager();
    const navigate = useNavigate();

    const [cycles, setCycles] = useState<string>('N/A');
    const { canister } = useAppSelector(state => state.auth);

    // fetch cycles

    const fetchCycles = useCallback(async () => {
        if(!canister || !actor) return;

        try {
            const result = await actor.get_canister_cycles(Principal.fromText(canister));
            if ("Ok" in result) {
                setCycles(result.Ok.toString());
            }
            if ("Err" in result) {
                throw new Error("Failed to fetch cycles");
            }
        } catch (error) {
            console.error("Error fetching cycles:", error);
            setCycles("N/A");
        }
    }, [canister, actor]);

    useEffect(() => {
        fetchCycles();
    }, [canister, fetchCycles]);

    if(!canister) return null;

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
                <code className="px-2 py-1 border bg-white dark:bg-transparent rounded text-sm font-mono">{canister}</code>
                <Copy text={canister} />
            </div>
            <Button
                variant={"link"}
                scale={"sm"}
                onClick={()=>navigate({to: '/dashboard/icp-assets'})}>
                View Assets
            </Button>
        </div>
    )
}

export default CanisterView;