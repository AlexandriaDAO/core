import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchAudios } from "../browse/thunks/fetchAudios";
import { clearError, reset } from "../browse/browseSlice";
import { ArweaveAudio } from "../types";

interface UseArweaveAudiosReturn {
    audios: ArweaveAudio[];
    loading: boolean;
    error: string | null;
    hasNext: boolean;
    loadMore: () => void;
    refresh: () => void;
    clearError: () => void;
    isEmpty: boolean;
}

export const useArweaveAudios = (): UseArweaveAudiosReturn => {
    const dispatch = useAppDispatch();
    const { audios, loading, error, hasNext } = useAppSelector(
        (state) => state.sonora.browse
    );

    const loadMore = () => {
        if (loading || !hasNext) return;
        dispatch(fetchAudios({ reset: false }));
    };

    const refresh = () => {
        if (loading) return;
        dispatch(fetchAudios({ reset: true }));
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    const isEmpty = !loading && audios.length === 0;

    return {
        audios,
        loading,
        error,
        hasNext,
        loadMore,
        refresh,
        clearError: handleClearError,
        isEmpty,
    };
};