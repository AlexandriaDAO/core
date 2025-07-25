import React, { useCallback, useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getMyTokens from "@/features/imporium/nfts/thunks/getMyTokens";
import { Alert } from "@/components/Alert";
import Nft from "@/features/nft";
import { ListNft } from "@/features/imporium/nfts/components/ListNft";
import { useLoaderData } from "@tanstack/react-router";
import { Button } from "@/lib/components/button";
import { RefreshCcw } from "lucide-react";
import { Skeleton } from "@/lib/components/skeleton";
import { setSafe } from "@/features/imporium/imporiumSlice";
import SafeSearchToggle from "@/components/SafeSearchToggle";

const NftsPage = () => {
    const fetched = useLoaderData({from: '/_auth/app/imporium/nfts'});
    const dispatch = useAppDispatch();

    const { user, canister } = useAppSelector((state) => state.auth);
    const { nfts: {ids, loading, error}, safe } = useAppSelector((state) => state.imporium);

    const refresh = useCallback(() => {
        dispatch(getMyTokens());
    }, [])

    useEffect(() => {
        if(!user || fetched) return;

        refresh();
    }, [user, fetched]);


    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-1 items-center">
                    <p className="text-sm text-muted-foreground">Here you will find the list of all your minted NFTs</p>
                    <Button
                        variant="muted"
                        className="font-roboto-condensed text-sm text-primary/70 hover:text-primary cursor-pointer flex items-center justify-start gap-1"
                        onClick={refresh}
                        disabled={loading}
                    >
                        <span>Refresh List</span>
                        <RefreshCcw strokeWidth={2} size={16} className={`${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <SafeSearchToggle enabled={safe} setEnabled={()=>dispatch(setSafe(!safe))} />
            </div>
            { loading ? (
                <Skeleton className="w-full flex-grow rounded" />
            ): error ? (
                <div className="max-w-2xl flex-grow container flex justify-center items-start mt-20">
                    <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
                </div>
            ): ids.length <= 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">You don't have any NFTs yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ids.map(id => <Nft key={id} id={id} checkNsfw={safe} action={<ListNft id={id} />} canister={canister}/>)}
                </div>
            )}
        </div>
    );
};
export default NftsPage;