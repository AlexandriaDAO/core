import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import Nft from "@/features/nft";

import PageSize from "@/features/imporium/listings/components/PageSize";
import PriceSort from "@/features/imporium/listings/components/PriceSort";
import TimeSort from "@/features/imporium/listings/components/TimeSort";
import { setPage } from "@/features/imporium/listings/listingsSlice";
import ReactPaginate from 'react-paginate';
import Search from "@/features/imporium/listings/components/Search";
import PurchaseNft from "@/features/imporium/listings/components/PurchaseNft";
import UnListNft from "@/features/imporium/listings/components/UnListNft";
import EditListedNft from "@/features/imporium/listings/components/EditListedNft";
import getListings from "@/features/imporium/listings/thunks/getListings";
import { Button } from "@/lib/components/button";
import { RefreshCcw } from "lucide-react";

const Listings = () => {
    const dispatch = useAppDispatch();

    const { user, canisters } = useAppSelector((state) => state.auth);
    const { nfts, page, pages, loading } = useAppSelector((state) => state.imporium.listings);

    const refresh = () => {
        dispatch(getListings());
    }

    const handlePageClick = (event: { selected: number }) => {
        dispatch(setPage(event.selected));
    };

    return (
        <div className="flex flex-col gap-4">
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

            <div className="flex gap-1 justify-between sm:gap-2 md:gap-4">
                <PageSize />
                <Search />
                <PriceSort />
                <TimeSort />
                {/* <Grid /> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.keys(nfts).map((id) => (
                    <Nft
                        key={id}
                        id={id}
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
            {pages && pages > 0 ? (
                <div className="flex justify-center my-8">
                    <ReactPaginate
                        previousLabel="←"
                        nextLabel="→"
                        breakLabel="..."
                        pageCount={pages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={3}
                        onPageChange={handlePageClick}
                        forcePage={page}
                        containerClassName="flex items-center gap-1"
                        pageLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                        previousLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                        nextLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                        breakLinkClassName="flex items-center justify-center w-10 h-10 text-muted-foreground"
                        activeLinkClassName="!bg-primary text-white hover:!bg-primary/90"
                        disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent"
                    />
                </div>
            ): null}
        </div>
    );
};

export default Listings;