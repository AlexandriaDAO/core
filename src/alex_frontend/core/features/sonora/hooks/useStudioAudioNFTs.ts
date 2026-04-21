import { useCallback } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchStudioAudioNFTs } from "../studioSlice";

// Hook for user's listed audio NFTs (follows Market page pattern)
export const useStudioAudioNFTs = () => {
    const dispatch = useAppDispatch();
    const { audios, loading, loadingMore, error, pagination } = useAppSelector((state) => state.sonora.studio);

    const refreshStudioAudioNFTs = useCallback((userPrincipal: string, page = 1, pageSize = 8, appendMode = false) => {
        dispatch(fetchStudioAudioNFTs({ userPrincipal, page, pageSize, appendMode }));
    }, [dispatch]);

    return {
        audios,
        loading,
        loadingMore,
        error,
        pagination,
        refreshStudioAudioNFTs,
    };
};