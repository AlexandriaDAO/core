import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { setTagFilter } from '@/apps/app/Perpetua/state/perpetuaSlice';
import { 
    fetchPopularTags, 
    fetchTagShelfCount, 
    fetchShelvesByTag, 
    fetchTagsWithPrefix 
} from '@/apps/app/Perpetua/state/thunks/queryThunks';
import { 
    CursorPaginationParams, 
    TagPopularityKeyCursor, 
    TagShelfAssociationKeyCursor, 
    NormalizedTagCursor 
} from '@/apps/app/Perpetua/state/services';
import { useCallback } from 'react';

/**
 * Hook providing memoized action dispatchers for tag-related operations.
 */
export function useTagActions() {
    const dispatch = useDispatch<AppDispatch>();

    const dispatchFetchPopularTags = useCallback((params: CursorPaginationParams<TagPopularityKeyCursor>) => {
        dispatch(fetchPopularTags(params));
    }, [dispatch]);

    const dispatchFetchTagShelfCount = useCallback((tagName: string) => {
        dispatch(fetchTagShelfCount(tagName));
    }, [dispatch]);

    const dispatchSetTagFilter = useCallback((tagName: string | null) => {
        dispatch(setTagFilter(tagName));
    }, [dispatch]);

    const dispatchFetchShelvesByTag = useCallback((tag: string, params: CursorPaginationParams<TagShelfAssociationKeyCursor>) => {
        dispatch(fetchShelvesByTag({ tag, params }));
    }, [dispatch]);

    const dispatchFetchTagsWithPrefix = useCallback((prefix: string, params: CursorPaginationParams<NormalizedTagCursor>) => {
        dispatch(fetchTagsWithPrefix({ prefix, params }));
    }, [dispatch]);

    return {
        fetchPopularTags: dispatchFetchPopularTags,
        fetchTagShelfCount: dispatchFetchTagShelfCount,
        setTagFilter: dispatchSetTagFilter,
        fetchShelvesByTag: dispatchFetchShelvesByTag,
        fetchTagsWithPrefix: dispatchFetchTagsWithPrefix,
    };
} 