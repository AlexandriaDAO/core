import React, { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useTagData } from '../hooks/useTagData';
import {
    getShelfById, // Assuming exported from thunks/queryThunks via state index
} from '@/apps/app/Perpetua/state/thunks/queryThunks'; // Import thunk directly
import {
    selectShelvesEntities,
    NormalizedShelf // Assuming this type is exported from the slice
} from '@/apps/app/Perpetua/state/perpetuaSlice'; // Import selector & type from slice
import { BaseShelfList } from '@/apps/app/Perpetua/features/cards/components/BaseShelfList';
import { LoaderCircle } from 'lucide-react';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did'; // Import original Shelf type
import { Principal } from '@dfinity/principal'; // Import Principal
import { RootState } from '@/store'; // Import RootState for typing selectors

// Helper to convert NormalizedShelf back to Shelf for BaseShelfList
const denormalizeShelf = (normalizedShelf: NormalizedShelf): Shelf => {
    return {
        ...normalizedShelf,
        owner: Principal.fromText(normalizedShelf.owner), // Convert string back to Principal
    };
};

export const FilteredShelfListContainer: React.FC = () => {
    const dispatch = useAppDispatch();
    const { 
        currentTagFilter, 
        shelfIdsForTagSelector, 
        isLoadingShelvesForTag 
    } = useTagData();

    // Get the IDs for the current tag, explicitly type state
    const shelfIds = useAppSelector((state: RootState) => 
        currentTagFilter ? shelfIdsForTagSelector(state, currentTagFilter) : []
    );

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
        .filter((id: string) => allShelves && allShelves[id]) // Ensure shelf exists before mapping
        .map((id: string) => allShelves[id]) as NormalizedShelf[]; // Type assertion still needed

    // Denormalize shelves for BaseShelfList
    const filteredShelvesForList: Shelf[] = filteredNormalizedShelves.map(denormalizeShelf);

    // Loading state calculation (ensure shelfIds is an array and result is boolean)
    const isLoading: boolean = isLoadingShelvesForTag || (
        Array.isArray(shelfIds) && shelfIds.length > 0 && 
        filteredNormalizedShelves.length < shelfIds.length
    );

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
            loading={isLoading} // Pass the boolean loading state
            title={listTitle} // Pass dynamic title
            emptyStateMessage={emptyMessage} // Pass dynamic empty state message
        />
    );
}; 