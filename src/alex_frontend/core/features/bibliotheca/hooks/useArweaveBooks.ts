import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { fetchBooks } from "../browse/thunks/fetchBooks";
import { clearError, reset } from "../browse/browseSlice";
import { ArweaveBook } from "../types";

interface UseArweaveBooksReturn {
    books: ArweaveBook[];
    loading: boolean;
    error: string | null;
    hasNext: boolean;
    loadMore: () => void;
    refresh: () => void;
    clearError: () => void;
    isEmpty: boolean;
}

export const useArweaveBooks = (): UseArweaveBooksReturn => {
    const dispatch = useAppDispatch();
    const { books, loading, error, hasNext } = useAppSelector(
        (state) => state.bibliotheca.browse
    );

    const loadMore = () => {
        if (loading || !hasNext) return;
        dispatch(fetchBooks({ reset: false }));
    };

    const refresh = () => {
        if (loading) return;
        dispatch(fetchBooks({ reset: true }));
    };

    const handleClearError = () => {
        dispatch(clearError());
    };

    const isEmpty = !loading && books.length === 0;

    return {
        books,
        loading,
        error,
        hasNext,
        loadMore,
        refresh,
        clearError: handleClearError,
        isEmpty,
    };
};