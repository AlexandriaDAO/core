import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { getCallerAssetCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import { useAssetManager } from "@/hooks/useAssetManager";
import { useInternetIdentity } from "ic-use-internet-identity";
import fetch from "@/features/icp-assets/thunks/fetch";
import NftsSkeleton from "@/layouts/skeletons/emporium/components/NftsSkeleton";
import { Alert } from "@/components/Alert";
import { Button } from "@/lib/components/button";
import Nft from "@/features/nft";
import getListings from "@/features/imporium/listings/thunks/getListings";
import useEmporium from "@/hooks/actors/useEmporium";
import { Trash2, Pencil } from "lucide-react";

import PageSize from "@/features/imporium/listings/components/PageSize";
import Grid from "@/features/imporium/listings/components/Grid";
import SearchId from "@/features/imporium/listings/components/SearchId";
import PriceSort from "@/features/imporium/listings/components/PriceSort";
import TimeSort from "@/features/imporium/listings/components/TimeSort";
import { setPage } from "@/features/imporium/listings/listingsSlice";
import ReactPaginate from 'react-paginate';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useParams } from "react-router";
import Search from "@/features/imporium/listings/components/Search";

const RemoveButton = () => {
    return (
        <Button className="flex-grow" variant="primary" scale="sm">Remove <Trash2 size={16} /></Button>
    )
}

const EditButton = () => {
    return (
        <Button className="flex-grow" variant="primary" scale="sm">Edit <Pencil size={16} /></Button>
    )
}

const ActionButtons = () => {
	return (
		<div className="flex gap-2 items-stretch justify-between">
			<RemoveButton />
			<EditButton />
		</div>
	)
}

const MarketPlacePage = () => {
    const {actor} = useEmporium();
    const dispatch = useAppDispatch();

    const { userAssetCanister } = useAppSelector((state) => state.assetManager);
    const { user } = useAppSelector((state) => state.auth);
    const { nfts, found, loading, error, page, size, pages, sortByPrice, sortByTime } = useAppSelector((state) => state.imporium.listings);
    const { identity } = useInternetIdentity();

    const assetManager = useAssetManager({
		canisterId: userAssetCanister ?? undefined,
		identity,
	});

	useEffect(() => {
		dispatch(getCallerAssetCanister());
	}, []);

	useEffect(() => {
		if (!assetManager) return;
		dispatch(fetch({ assetManager }));
	}, [assetManager]);

    useEffect(() => {
        if(!actor) return;
        dispatch(getListings({actor}));
    }, [actor, page, size, sortByPrice, sortByTime]);

    const handlePageClick = (event: { selected: number }) => {
        dispatch(setPage(event.selected));
    };

    return (
        <div className="container px-2 flex flex-col gap-10">
            <div className="flex flex-col items-center gap-3 md:gap-6 mx-auto p-5 sm:p-10 w-full max-w-md md:max-w-2xl xl:max-w-[800px]">
                <h1 className="text-foreground text-center font-syne font-bold m-0 text-xl sm:text-2xl md:text-3xl lg:text-5xl">Emporium</h1>
                <div className="flex flex-col items-center gap-1 text-foreground text-center font-syne">
                    <h2 className="m-0 font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">Marketplace</h2>
                    <p className="m-0 font-normal text-sm sm:text-base md:text-lg lg:text-xl">Here you will find the list of all NFTs listed for sale</p>
                </div>
            </div>

            { Object.keys(nfts).length > 0 ? (
                <div className="flex gap-1 justify-between sm:gap-2 md:gap-4">
                    <PageSize />
                    <Search />
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
                        <Nft key={id} id={id} action={<ActionButtons />} price={found[id].price} owner={found[id].owner}/>
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
                            <Nft key={id} id={id} action={<ActionButtons />} price={nfts[id].price} owner={nfts[id].owner}/>
                        ))}
                    </div>
                    {/* <ResponsiveMasonry
                        columnsCountBreakPoints={{ 0: 1, 640: 2, 768: 3, 1024: 4 }}
                    >
                        <Masonry gutter="16px">
                            {Object.keys(nfts).map((id) => (
                                <Nft key={id} id={id} action={<ActionButtons />} price={nfts[id].price} owner={nfts[id].owner}/>
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
export default MarketPlacePage;