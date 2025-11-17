import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchMarketAudioNFTs } from "../marketSlice";

// Hook for marketplace audio NFTs (follows Archive page pattern)
export const useMarketAudioNFTs = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const { audios, loading, loadingMore, error, pagination } = useAppSelector((state) => state.sonora.market);

    const refreshMarketAudioNFTs = (page = 1, pageSize = 8, appendMode = false) => {
        dispatch(fetchMarketAudioNFTs({ 
            page, 
            pageSize, 
            appendMode, 
            currentUserPrincipal: user?.principal 
        }));
    };

    return {
        audios,
        loading,
        loadingMore,
        error,
        pagination,
        refreshMarketAudioNFTs,
    };
};