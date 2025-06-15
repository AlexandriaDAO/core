import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import NftsSkeleton from "@/layouts/skeletons/emporium/components/NftsSkeleton";
import { Alert } from "@/components/Alert";
import Nft from "@/features/nft";
import getListings from "@/features/imporium/listings/thunks/getListings";
import useEmporium from "@/hooks/actors/useEmporium";

import PageSize from "@/features/imporium/listings/components/PageSize";
import SearchId from "@/features/imporium/listings/components/SearchId";
import PriceSort from "@/features/imporium/listings/components/PriceSort";
import TimeSort from "@/features/imporium/listings/components/TimeSort";
import { setPage } from "@/features/imporium/listings/listingsSlice";
import ReactPaginate from 'react-paginate';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import EditListedNft from "@/features/imporium/listings/components/EditListedNft";
import UnListNft from "@/features/imporium/listings/components/UnListNft";
import { EmporiumActor, Icrc7Actor } from "@/actors";


const MyListingsPage = () => {
    const {actor} = useEmporium();
    const dispatch = useAppDispatch();

    const { user } = useAppSelector((state) => state.auth);
    const { nfts, found, loading, error, page, size, pages, sortByPrice, sortByTime } = useAppSelector((state) => state.imporium.listings);

    useEffect(() => {
        if(!actor || !user) return;
        // dispatch(getListings({actor, owner: user.principal}));
    }, [actor, user, page, size, sortByPrice, sortByTime]);

    const handlePageClick = (event: { selected: number }) => {
        dispatch(setPage(event.selected));
    };

    return (
        <div className="container px-2 flex flex-col gap-10">
            <div className="flex flex-col items-center gap-3 md:gap-6 mx-auto p-5 sm:p-10 w-full max-w-md md:max-w-2xl xl:max-w-[800px]">
                <h1 className="text-foreground text-center font-syne font-bold m-0 text-xl sm:text-2xl md:text-3xl lg:text-5xl">Emporium</h1>
                <div className="flex flex-col items-center gap-1 text-foreground text-center font-syne">
                    <h2 className="m-0 font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">My Listings</h2>
                    <p className="m-0 font-normal text-sm sm:text-base md:text-lg lg:text-xl">Here you will find the list of all your NFTs listed for sale</p>
                </div>
            </div>

            { Object.keys(nfts).length > 0 ? (
                <div className="flex gap-1 justify-between sm:gap-2 md:gap-4">
                    <PageSize />
                    <SearchId />
                    <PriceSort />
                    <TimeSort />
                    {/* <Grid /> */}
                </div>
            ) : null}

            {loading ? (
                <NftsSkeleton count={size} />
            ) : error ? (
                <div className="max-w-2xl flex-grow container flex justify-center items-start">
                    <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
                </div>
            ) : Object.keys(found).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.keys(found).map((id) => (
                        <Nft key={id} id={id} action={
                            <EmporiumActor>
                                <Icrc7Actor>
                                    <div className="flex gap-2 items-stretch justify-between">
                                            <UnListNft id={id} />
                                            <EditListedNft id={id} originalPrice={found[id].price} />
                                        </div>
                                </Icrc7Actor>
                            </EmporiumActor>
                        } price={found[id].price}/>
                    ))}
                </div>
            ) : Object.keys(nfts).length <= 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">You don't have any NFTs listed for sale.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.keys(nfts).map((id) => (
                            <Nft key={id} id={id} action={
                                <EmporiumActor>
                                    <Icrc7Actor>
                                        <div className="flex gap-2 items-stretch justify-between">
                                            <UnListNft id={id} />
                                            <EditListedNft id={id} originalPrice={nfts[id].price} />
                                        </div>
                                    </Icrc7Actor>
                                </EmporiumActor>
                            } price={nfts[id].price}/>
                        ))}
                    </div>
                    {/* <ResponsiveMasonry
                        columnsCountBreakPoints={{ 0: 1, 640: 2, 768: 3, 1024: 4 }}
                    >
                        <Masonry gutter="16px">
                            {Object.keys(nfts).map((id) => (
                                <Nft key={id} id={id} action={
                                    <EmporiumActor>
                                        <Icrc7Actor>
                                            <div className="flex gap-2 items-stretch justify-between">
                                                <UnListNft id={id} />
                                                <EditListedNft id={id} originalPrice={nft} />
                                            </div>
                                        </Icrc7Actor>
                                    </EmporiumActor>
                                } price={nfts[id].price} owner={nfts[id].owner}/>
                            ))}
                        </Masonry>
                    </ResponsiveMasonry> */}

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
                </>
            )}
        </div>
    );
};
export default MyListingsPage;