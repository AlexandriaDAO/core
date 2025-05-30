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
import { usePerpetua } from '@/hooks/actors';

/**
 * Hook providing memoized action dispatchers for tag-related operations.
 */
export function useTagActions() {
    const {actor} = usePerpetua();
    const dispatch = useDispatch<AppDispatch>();

    const dispatchFetchPopularTags = useCallback((params: CursorPaginationParams<TagPopularityKeyCursor>) => {
        if(!actor) return;
        dispatch(fetchPopularTags({actor, params}));
    }, [dispatch, actor]);

    const dispatchFetchTagShelfCount = useCallback((tagName: string) => {
        if(!actor) return;
        dispatch(fetchTagShelfCount({actor, tag: tagName}));
    }, [dispatch, actor]);

    const dispatchSetTagFilter = useCallback((tagName: string | null) => {
        dispatch(setTagFilter(tagName));
    }, [dispatch]);

    const dispatchFetchShelvesByTag = useCallback((tag: string, params: CursorPaginationParams<TagShelfAssociationKeyCursor>) => {
        if(!actor) return;
        dispatch(fetchShelvesByTag({actor, tag, params}));
    }, [dispatch, actor]);

    const dispatchFetchTagsWithPrefix = useCallback((prefix: string, params: CursorPaginationParams<NormalizedTagCursor>) => {
        if(!actor) return;
        dispatch(fetchTagsWithPrefix({ actor, prefix, params }));
    }, [dispatch, actor]);

    return {
        fetchPopularTags: dispatchFetchPopularTags,
        fetchTagShelfCount: dispatchFetchTagShelfCount,
        setTagFilter: dispatchSetTagFilter,
        fetchShelvesByTag: dispatchFetchShelvesByTag,
        fetchTagsWithPrefix: dispatchFetchTagsWithPrefix,
    };
} 