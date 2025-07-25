import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Nft from "@/features/nft";
import PurchaseNft from "@/features/imporium/listings/components/PurchaseNft";
import UnListNft from "@/features/imporium/listings/components/UnListNft";
import EditListedNft from "@/features/imporium/listings/components/EditListedNft";
import PageSize from "@/features/imporium/listings/components/PageSize";
import PriceSort from "@/features/imporium/listings/components/PriceSort";
import TimeSort from "@/features/imporium/listings/components/TimeSort";
import Search from "@/features/imporium/listings/components/Search";
import { Alert } from "@/components/Alert";
import { Skeleton } from "@/lib/components/skeleton";
import SafeSearchToggle from "@/components/SafeSearchToggle";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSafe } from "@/features/imporium/imporiumSlice";

const Found = () => {
    const dispatch = useAppDispatch();
    const { user, canisters } = useAppSelector((state) => state.auth);
    const { listings: {loading, error, query, found}, safe } = useAppSelector((state) => state.imporium);

    const foundTransactions = Object.keys(found);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-1 justify-between sm:gap-2 md:gap-4">
                <PageSize />
                <Search />
                <PriceSort />
                <TimeSort />
            </div>

            { loading ? (
                <Skeleton className="w-full flex-grow rounded" />
            ) : error ? (
                <div className="flex-grow flex justify-center items-start">
                    <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
                </div>
            ): foundTransactions.length <= 0 ? (
                <div className="flex-grow flex justify-center items-start">
                    <Alert variant="danger" title="Error" className="w-full">No matches found for `{query}`</Alert>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">{foundTransactions.length} results found for your query.</p>

                        <SafeSearchToggle enabled={safe} setEnabled={()=>dispatch(setSafe(!safe))} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        { foundTransactions.map((id) => (
                            <Nft
                                key={`${id}-${query}-search`}
                                id={id}
                                checkNsfw={safe}
                                action={
                                    found[id].owner !== user?.principal ? (
                                        <PurchaseNft id={id} price={found[id].price} />
                                    ) : (
                                        <div className="flex gap-2 items-stretch justify-between">
                                            <UnListNft id={id} />
                                            <EditListedNft id={id} originalPrice={found[id].price} />
                                        </div>
                                    )
                                }
                                price={found[id].price}
                                owner={found[id].owner}
                                canister={canisters[found[id].owner]}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
};

export default Found;