import React, { useEffect, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useTagData } from '../hooks/useTagData';
import { useTagActions } from '../hooks/useTagActions';
import {
    getShelfById, // Assuming exported from thunks/queryThunks via state index
} from '@/apps/app/Perpetua/state/thunks/queryThunks'; // Import thunk directly
import {
    selectShelvesEntities,
    NormalizedShelf,
    selectShelvesByTagMap // Import the map selector to check if data exists
} from '@/apps/app/Perpetua/state/perpetuaSlice'; // Import selector & type from slice
import { BaseShelfList } from '@/apps/app/Perpetua/features/cards/components/BaseShelfList';
import { LoaderCircle } from 'lucide-react';
import { ShelfPublic } from '@/../../declarations/perpetua/perpetua.did'; // Import original Shelf type
import { Principal } from '@dfinity/principal'; // Import Principal
import { RootState } from '@/store'; // Import RootState for typing selectors

// Helper to convert NormalizedShelf back to Shelf for BaseShelfList
const denormalizeShelf = (normalizedShelf: NormalizedShelf): ShelfPublic => {
    return {
        ...normalizedShelf,
        owner: Principal.fromText(normalizedShelf.owner), // Convert string back to Principal
    };
};

export const FilteredShelfListContainer: React.FC = () => {
    const dispatch = useAppDispatch();
    const { 
        currentTagFilter, 
        shelfIdsForTagSelectorFactory, // Get the factory function
        isLoadingShelvesForTag 
    } = useTagData();
    const { fetchShelvesByTag } = useTagActions(); // Get the action dispatcher

    // Check if shelf IDs for the current tag are already loaded
    const shelvesByTagMap = useAppSelector<Record<string, string[]>>(selectShelvesByTagMap);
    const areShelfIdsLoadedForTag = currentTagFilter ? shelvesByTagMap.hasOwnProperty(currentTagFilter) : false;

    // --- Fetch shelves for the selected tag if not loaded --- 
    useEffect(() => {
        if (currentTagFilter && !areShelfIdsLoadedForTag && !isLoadingShelvesForTag) {
            // Only fetch if a tag is selected, data isn't loaded, and not already loading
            fetchShelvesByTag(currentTagFilter, { limit: 20 });
        }
    }, [currentTagFilter, areShelfIdsLoadedForTag, isLoadingShelvesForTag, fetchShelvesByTag]);
    // --- End Fetch shelves --- 

    // Create the memoized selector for the current tag's shelf IDs
    const selectShelfIdsForCurrentTag = useMemo(() => {
        return currentTagFilter ? shelfIdsForTagSelectorFactory(currentTagFilter) : () => [];
    }, [currentTagFilter, shelfIdsForTagSelectorFactory]);

    // Get the IDs for the current tag using the created selector
    const shelfIds = useAppSelector<string[]>(selectShelfIdsForCurrentTag);

    // Get all shelf entities, explicitly type state
    const allShelves = useAppSelector((state: RootState) => selectShelvesEntities(state));

    // Effect to fetch missing shelf data
    useEffect(() => {
        // Ensure shelfIds is an array before iterating
        if (!Array.isArray(shelfIds) || shelfIds.length === 0) return;

        shelfIds.forEach((id: string) => { // Explicitly type id
            // Check if shelf exists and is not null/undefined
            if (!allShelves || !allShelves[id]) {
                dispatch(getShelfById(id));
            }
        });
    }, [shelfIds, allShelves, dispatch]);

    // Filter and map IDs to actual shelf objects that are loaded
    const filteredNormalizedShelves = shelfIds
        .map((id: string) => allShelves ? allShelves[id] : undefined) // Get shelf or undefined
        .filter((shelf): shelf is NormalizedShelf => !!shelf); // Filter out undefined and type guard

    // Denormalize shelves for BaseShelfList
    const filteredShelvesForList: ShelfPublic[] = filteredNormalizedShelves.map(denormalizeShelf);

    // --- Updated Loading state calculation --- 
    // Loading if: 
    // 1. We are actively loading shelf IDs for the tag OR
    // 2. A tag is selected, IDs are not loaded yet (implies initial fetch hasn't completed) OR
    // 3. We have shelf IDs, but haven't loaded all corresponding shelf entities yet.
    const isLoading: boolean = isLoadingShelvesForTag || 
                              (!!currentTagFilter && !areShelfIdsLoadedForTag) || 
                              (shelfIds.length > 0 && filteredNormalizedShelves.length < shelfIds.length);
    // --- End Updated Loading state --- 

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoaderCircle size={32} className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    const listTitle = currentTagFilter ? `Shelves tagged: ${currentTagFilter}` : 'Filtered Shelves';
    const emptyMessage = currentTagFilter ? `No shelves found for the tag: "${currentTagFilter}"` : 'No shelves found';

    return (
        <BaseShelfList 
            shelves={filteredShelvesForList} // Pass denormalized shelves
            loading={false} // We handle loading above, so BaseShelfList doesn't need its own spinner here
            title={listTitle} // Pass dynamic title
            emptyStateMessage={emptyMessage} // Pass dynamic empty state message
        />
    );
}; 