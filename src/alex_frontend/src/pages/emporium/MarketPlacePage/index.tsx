import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Alert } from "@/components/Alert";

import Listings from "./Listings";
import Found from "./Found";
import { useSearch } from "@tanstack/react-router";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import searchThunk from '@/features/imporium/listings/thunks/search';
import { setQuery } from "@/features/imporium/listings/listingsSlice";
import { Skeleton } from "@/lib/components/skeleton";

const MarketPlacePage = () => {
    const { search }: any = useSearch({ strict: false});

    const dispatch = useAppDispatch();
    const { nfts, found, query, loading, error, size } = useAppSelector((state) => state.imporium.listings);

    useEffect(() => {
        if(!search || search.trim() === '') return;

        dispatch(setQuery(search))
        dispatch(searchThunk(query))
    }, [search]);

    if(loading) return <Skeleton className="w-full flex-grow rounded" />

    if(error) return (
        <div className="max-w-2xl flex-grow container flex justify-center items-start">
            <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
        </div>
    )

    if(Object.keys(found).length > 0) return <Found />;

    if(Object.keys(nfts).length <= 0) return (
        <div className="max-w-2xl flex-grow container flex justify-center items-start">
            <Alert variant="danger" title="Error" className="w-full">No NFTs listed for sale</Alert>
        </div>
    )

    return <Listings />;
};
export default MarketPlacePage;