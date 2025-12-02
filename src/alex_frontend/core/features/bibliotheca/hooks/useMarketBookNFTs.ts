import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchMarketBookNFTs } from "../marketSlice";

// Hook for marketplace book NFTs (follows Library page pattern)
export const useMarketBookNFTs = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const { books, loading, loadingMore, error, pagination } = useAppSelector((state) => state.bibliotheca.market);

    const refreshMarketBookNFTs = (page = 1, pageSize = 8, appendMode = false) => {
        dispatch(fetchMarketBookNFTs({ 
            page, 
            pageSize, 
            appendMode, 
            currentUserPrincipal: user?.principal 
        }));
    };

    return {
        books,
        loading,
        loadingMore,
        error,
        pagination,
        refreshMarketBookNFTs,
    };
};