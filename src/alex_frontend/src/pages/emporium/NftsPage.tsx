import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getMyTokens from "@/features/imporium/nfts/thunks/getMyTokens";
import NftsSkeleton from "@/layouts/skeletons/emporium/components/NftsSkeleton";
import { Alert } from "@/components/Alert";
import Nft from "@/features/nft";
import { ListNft } from "@/features/imporium/nfts/components/ListNft";
import { EmporiumActor, Icrc7Actor } from "@/actors";
import { useLoaderData } from "@tanstack/react-router";
import { Button } from "@/lib/components/button";
import { RefreshCcw } from "lucide-react";

const NftsPage = () => {
    const fetched = useLoaderData({from: '/_auth/app/imporium/nfts'});
    const dispatch = useAppDispatch();

    const { canister } = useAppSelector((state) => state.auth);
    const { ids, loading, error } = useAppSelector((state) => state.imporium.nfts);

    const refresh = () => {
        dispatch(getMyTokens());
    }

    useEffect(() => {
        if(!fetched) refresh();
    }, []);

    return (
        <>
            <div className="flex flex-col items-center gap-3 md:gap-6 mx-auto p-5 sm:p-10 w-full max-w-md md:max-w-2xl xl:max-w-[800px]">
                <h1 className="text-foreground text-center font-syne font-bold m-0 text-xl sm:text-2xl md:text-3xl lg:text-5xl">Emporium</h1>
                <div className="flex flex-col items-center gap-1 text-foreground text-center font-syne">
                    <h2 className="m-0 font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">My Nfts</h2>
                    <p className="m-0 font-normal text-sm sm:text-base md:text-lg lg:text-xl">Here you will find the list of all your minted NFTs</p>
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
            </div>

            {loading ? (
                <NftsSkeleton />
            ) : error ? (
                <div className="max-w-2xl flex-grow container flex justify-center items-start mt-20">
                    <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
                </div>
            ) : (
                <div className="p-2">
                    <div className="lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
                        {ids.length <= 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-lg">You don't have any NFTs yet.</p>
                            </div>
                        ) : (
                            <EmporiumActor>
                                <Icrc7Actor>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-20">
                                        {ids.map(id => <Nft key={id} id={id} action={<ListNft id={id} />} canister={canister}/>)}
                                    </div>
                                </Icrc7Actor>
                            </EmporiumActor>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
export default NftsPage;