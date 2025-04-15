import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
    selectPopularTags,
    selectTagShelfCount,
    selectCurrentTagFilter,
    selectShelfIdsForTag,
    selectTagSearchResults,
    selectIsTagSearchLoading,
    selectIsLoadingPopularTags,
    selectIsLoadingShelvesForTag
} from '@/apps/app/Perpetua/state/perpetuaSlice';

/**
 * Hook providing selectors for accessing tag-related data from the Redux store.
 */
export function useTagData() {
    const popularTags = useSelector(selectPopularTags);
    const currentTagFilter = useSelector(selectCurrentTagFilter);
    const shelfIdsForTagSelector = useSelector(selectShelfIdsForTag);
    const tagSearchResults = useSelector(selectTagSearchResults);
    const isTagSearchLoading = useSelector(selectIsTagSearchLoading);
    const isLoadingPopularTags = useSelector(selectIsLoadingPopularTags);
    const isLoadingShelvesForTag = useSelector(selectIsLoadingShelvesForTag);
    const tagShelfCountSelector = selectTagShelfCount;

    return {
        popularTags,
        tagShelfCountSelector,
        shelfIdsForTagSelector,
        currentTagFilter,
        tagSearchResults,
        isTagSearchLoading,
        isLoadingPopularTags,
        isLoadingShelvesForTag
    };
} 