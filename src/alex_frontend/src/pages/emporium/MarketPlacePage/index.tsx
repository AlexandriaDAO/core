import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Alert } from "@/components/Alert";

import Listings from "./Listings";
import Found from "./Found";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import searchThunk from '@/features/imporium/listings/thunks/search';
import EmporiumPageSkeleton from "@/layouts/skeletons/emporium/EmporiumPageSkeleton";

const MarketPlacePage = () => {
    const dispatch = useAppDispatch();
    const { nfts, query, loading } = useAppSelector((state) => state.imporium.listings);

    useEffect(() => {
        if(!query || query.trim() === '') return;

        dispatch(searchThunk(query))
    }, [query]);

    if(loading) return <EmporiumPageSkeleton />

    if(query.length > 0) return <Found />;

    if(Object.keys(nfts).length <= 0) return (
        <div className="max-w-2xl flex-grow container flex justify-center items-start">
            <Alert variant="danger" title="Error" className="w-full">No NFTs listed for sale</Alert>
        </div>
    )

    return <Listings />;
};
export default MarketPlacePage;