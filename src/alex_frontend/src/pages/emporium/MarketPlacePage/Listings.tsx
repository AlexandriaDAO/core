import React, { useCallback } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import Nft from "@/features/nft";

import PageSize from "@/features/imporium/listings/components/PageSize";
import PriceSort from "@/features/imporium/listings/components/PriceSort";
import TimeSort from "@/features/imporium/listings/components/TimeSort";
import Search from "@/features/imporium/listings/components/Search";
import PurchaseNft from "@/features/imporium/listings/components/PurchaseNft";
import UnListNft from "@/features/imporium/listings/components/UnListNft";
import EditListedNft from "@/features/imporium/listings/components/EditListedNft";
import getListings from "@/features/imporium/listings/thunks/getListings";
import { Button } from "@/lib/components/button";
import { RefreshCcw } from "lucide-react";
import Pagination from "@/features/imporium/listings/components/Pagination";
import { Skeleton } from "@/lib/components/skeleton";
import { Alert } from "@/components/Alert";
import SafeSearchToggle from "@/components/SafeSearchToggle";
import { setSafe } from "@/features/imporium/imporiumSlice";

const Listings = () => {
    const dispatch = useAppDispatch();

    const { user, canisters } = useAppSelector((state) => state.auth);
    const { listings: {nfts, loading, error, page, size, sortByPrice, sortByTime}, safe } = useAppSelector((state) => state.imporium);

    const refresh = useCallback(() => {
        dispatch(getListings({page, size, sortByPrice, sortByTime}));
    }, [page, size, sortByPrice, sortByTime]);

    return (
        <div className="flex flex-col gap-4">

            <div className="flex gap-1 justify-between sm:gap-2 md:gap-4">
                <PageSize />
                <Search />
                <PriceSort />
                <TimeSort />
                {/* <Grid /> */}
            </div>

            {loading ? (
                <Skeleton className="w-full flex-grow rounded" />
            ) : error ? (
                <div className="flex-grow flex justify-center items-start">
                    <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1 items-center">
                            <p className="text-sm text-muted-foreground">Here you will find the list of all NFTs listed for sale</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.keys(nfts).map((id) => (
                            <Nft
                                key={`${id}-${page}-${size}-${sortByPrice}-${sortByTime}`}
                                id={id}
                                checkNsfw={safe}
                                action={
                                    nfts[id].owner !== user?.principal ? (
                                        <PurchaseNft id={id} price={nfts[id].price} />
                                    ): <div className="flex gap-2 items-stretch justify-between">
                                        <UnListNft id={id} />
                                        <EditListedNft id={id} originalPrice={nfts[id].price} />
                                    </div>
                                }
                                price={nfts[id].price}
                                owner={nfts[id].owner}
                                canister={canisters[nfts[id].owner]}
                            />
                        ))}
                    </div>
                </>
            )}

            <Pagination />
        </div>
    );
};

export default Listings;