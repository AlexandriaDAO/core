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

const Found = () => {
    const { user, canisters } = useAppSelector((state) => state.auth);
    const { found } = useAppSelector((state) => state.imporium.listings);

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">We found {Object.keys(found).length} NFTs matching your search</p>

            <div className="flex gap-1 justify-between sm:gap-2 md:gap-4">
                <PageSize />
                <Search />
                <PriceSort />
                <TimeSort />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.keys(found).map((id) => (
                    <Nft
                        key={id}
                        id={id}
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
        </div>
    )
};

export default Found;