import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchShelfBookNFTs } from "../shelfSlice";

// Hook for user's listed book NFTs (follows Market page pattern)
export const useShelfBookNFTs = () => {
    const dispatch = useAppDispatch();
    const { books, loading, loadingMore, error, pagination } = useAppSelector((state) => state.bibliotheca.shelf);

    const refreshShelfBookNFTs = (userPrincipal: string, page = 1, pageSize = 8, appendMode = false) => {
        dispatch(fetchShelfBookNFTs({ userPrincipal, page, pageSize, appendMode }));
    };

    return {
        books,
        loading,
        loadingMore,
        error,
        pagination,
        refreshShelfBookNFTs,
    };
};