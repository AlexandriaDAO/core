import React, { useMemo, useState, useEffect } from "react";
import { useIdentity } from "@/lib/ic-use-identity";
import { ShelfPublic, Item, ItemContent } from "@/../../declarations/perpetua/perpetua.did";
import { parsePathInfo, usePerpetuaNavigation } from "../../../routes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
	selectOptimisticShelfItemOrder,
	selectIsOwner,
	selectCanAddItem,
	selectShelfById,
	selectNestedShelvesDataMap
} from "@/apps/app/Perpetua/state";
import { ItemReorderManager } from "../../shared/reordering/components";
import { ShelfDetailView } from "../../cards/components/ShelfDetailView";
import { ShelfSettingsDialog } from "../../shelf-settings";
import { useShelfOperations } from "../hooks";
import { isShelfContent } from "../../../utils";
import { ReorderRenderProps } from "../../../types/reordering.types";
import { NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { getShelfById as getShelfByIdThunk } from "@/apps/app/Perpetua/state/thunks/queryThunks";
import { Principal } from '@dfinity/principal';
import { RootState } from "@/store";
import { usePerpetua } from "@/hooks/actors";

// Define a type for enriched item content
type EnrichedItemContent = 
	| { Shelf: ShelfPublic } 
	| { Shelf: string, isLoading?: boolean } // For ID or loading state
	| ItemContent; // Other item content types

type EnrichedItem = Omit<Item, 'content'> & { content: EnrichedItemContent };

/**
 * ShelfDetailContainer Component
 * 
 * This component is responsible for managing the state and logic of a shelf detail view.
 * It works together with the ShelfDetailView component from the cards directory:
 * 
 * - ShelfDetailContainer (this component): Manages shelf state, data processing, and business logic
 * - ShelfDetailView (from cards/components/ShelfDetailView.tsx): Pure presentational component that renders the UI
 * 
 * This separation follows a container/presentational component pattern where:
 * - This container component handles data fetching, state management, and logic
 * - The ShelfDetailView handles the visual representation without business logic
 */
export interface ShelfDetailProps {
	shelf: ShelfPublic;
	onBack: () => void;
	onAddItem?: (shelf: ShelfPublic	) => void;
	onReorderItem?: (shelfId: string, itemId: number, referenceItemId: number | null, before: boolean) => Promise<void>;
}

// The ShelfDetailContainer component that integrates with the UI component
export const ShelfDetailContainer: React.FC<ShelfDetailProps> = ({ 
	shelf, 
	onBack,
	onAddItem,
	onReorderItem,
}) => {
	const {actor} = usePerpetua();
	const pathInfo = parsePathInfo(window.location.pathname);
	const identity = useIdentity();
	const dispatch = useAppDispatch();
	const { goToShelf } = usePerpetuaNavigation();
	
	// Access the updateMetadata function from ShelfOperations
	const { updateMetadata, addItem } = useShelfOperations();
	
	// Determine access rights using selectors
	const isOwner = useAppSelector<boolean>(selectIsOwner(shelf.shelf_id));
	const canAddItem = useAppSelector<boolean>(selectCanAddItem(shelf.shelf_id));
	
	// Check for optimistic item order
	const optimisticItemOrder = useAppSelector(selectOptimisticShelfItemOrder(shelf.shelf_id)) as number[];
	
	// Optimized ordered items calculation with memoization
	const baseOrderedItems = useMemo((): [number, Item][] => {
		if (optimisticItemOrder && optimisticItemOrder.length > 0 && shelf.items) {
			const itemMap = new Map<number, Item>();
			shelf.items.forEach(([id, item]) => itemMap.set(id, item));
			return optimisticItemOrder
				.map(id => itemMap.has(id) ? [id, itemMap.get(id)!] as [number, Item] : null)
				.filter((item): item is [number, Item] => item !== null);
		}
		if (!shelf.item_positions || !shelf.items) return [];
		const positionEntries = shelf.item_positions.map(([id, position]) => ({ id, position }));
		positionEntries.sort((a, b) => a.position - b.position);
		return positionEntries
			.map(({ id }) => {
				const itemPair = shelf.items?.find(([itemId]) => itemId === id);
				return itemPair ? itemPair : null;
			})
			.filter((item): item is [number, Item] => item !== null);
	}, [
		shelf.items, 
		shelf.item_positions, 
		optimisticItemOrder 
	]);
	
	// --- BEGIN: Enriching items with full nested shelf data ---
	const [isLoadingGlobalNestedShelves, setIsLoadingGlobalNestedShelves] = useState(false);

	// 1. Get unique IDs of all nested shelves
	const allNestedShelfIds = useMemo(() => {
		const ids = new Set<string>();
		baseOrderedItems.forEach(([, item]) => {
			if (isShelfContent(item.content)) {
				const nestedShelfId = item.content.Shelf; // This is a string ID
				if (typeof nestedShelfId === 'string') {
					ids.add(nestedShelfId);
				}
			}
		});
		return Array.from(ids);
	}, [baseOrderedItems]);

	// 2. Fetch data for all unique nested shelf IDs if not already loading or present
	useEffect(() => {
		if(!actor) return;
		let isMounted = true;
		const idsToFetchActually: string[] = [];

		allNestedShelfIds.forEach(id => {
			// This direct check is tricky because useAppSelector can't be in a loop.
			// Instead, we'll fetch all and rely on Redux or thunk to handle duplicates/already fetched.
			// A more optimized version might involve checking store state here, but that adds complexity.
			idsToFetchActually.push(id);
		});
		
		if (idsToFetchActually.length > 0) {
			setIsLoadingGlobalNestedShelves(true);
			const promises = idsToFetchActually.map(id => dispatch(getShelfByIdThunk({actor, shelfId: id})));
			Promise.all(promises).finally(() => {
				if (isMounted) {
					setIsLoadingGlobalNestedShelves(false);
				}
			});
		}
		return () => { isMounted = false; };
	}, [allNestedShelfIds, actor, dispatch]);
	
	// 3. Select all required nested shelves data from the store
	// This selector needs to be stable. We select a map of shelves.
	const nestedShelvesDataMapSelector = useMemo(() => {
		return selectNestedShelvesDataMap(allNestedShelfIds);
	}, [allNestedShelfIds]);
	
	const nestedShelvesDataMap = useAppSelector(nestedShelvesDataMapSelector) as Record<string, NormalizedShelf | undefined>;

	// 4. Create enriched items, now using nestedShelvesDataMap
	const enrichedOrderedItems = useMemo((): [number, EnrichedItem][] => {
		return baseOrderedItems.map(([itemKey, item]): [number, EnrichedItem] => {
			if (isShelfContent(item.content)) {
				const nestedShelfId = item.content.Shelf; // This is a string ID
				if (typeof nestedShelfId === 'string') {
					const normalizedNestedShelf = nestedShelvesDataMap[nestedShelfId];
					if (normalizedNestedShelf && typeof normalizedNestedShelf.owner === 'string') {
						const shelfPublicData = denormalizeShelfForContainer(normalizedNestedShelf);
						return [itemKey, { ...item, content: { Shelf: shelfPublicData } }];
					} else {
						// Still loading or not found, pass ID and loading state
						return [itemKey, { ...item, content: { Shelf: nestedShelfId, isLoading: true } }];
					}
				}
			}
			return [itemKey, item as EnrichedItem]; // Cast other items
		});
	}, [baseOrderedItems, nestedShelvesDataMap, isLoadingGlobalNestedShelves]);
	// --- END: Enriching items ---

	// Handle item click to navigate to item shelf if applicable
	const handleViewItem = (itemId: number) => {
		const itemEntry = enrichedOrderedItems.find(([key]) => key === itemId);
		if (!itemEntry) return;

		const content = itemEntry[1].content; // Type is EnrichedItemContent

		// Check if it's any kind of Shelf content
		// The 'Shelf' property can be ShelfPublic (object), string (ID), or our { Shelf: string, isLoading: true } object.
		if (content && typeof content === 'object' && 'Shelf' in content) {
			const shelfField = (content as { Shelf: unknown }).Shelf;

			if (typeof shelfField === 'object' && shelfField !== null && 'shelf_id' in shelfField) {
				// It's a ShelfPublic object
				goToShelf((shelfField as ShelfPublic).shelf_id);
			} else if (typeof shelfField === 'string') {
				// It's a shelf ID string (potentially from initial load or if data fetch failed but we still have ID)
				goToShelf(shelfField);
			} else if (typeof shelfField === 'object' && shelfField !== null && 'isLoading' in shelfField && typeof (shelfField as any).Shelf === 'string') {
				// It's our temporary loading state object { Shelf: string (ID), isLoading: true }
				goToShelf((shelfField as any).Shelf);
			}
		}
		// If other content types (NFT, Markdown) also need navigation via onViewItem, that logic would go here.
		// The original isShelfContent(itemEntry[1].content) was specific to Shelf type.
	};

	// Handle item submission directly from the InlineItemCreator
	const handleItemSubmit = async (content: string, type: "Nft" | "Markdown" | "Shelf", collectionType?: "NFT" | "SBT") => {
		try {
			// Use the addItem function from ShelfOperations
			await addItem(shelf, content, type);
		} catch (error) {
			console.error("Error adding item:", error);
			throw error; // Re-throw the error
		}
	};
	
	return (
		<ItemReorderManager
			shelf={shelf}
			orderedItems={enrichedOrderedItems as [number, Item][]}
			isOwner={isOwner}
		>
			{({
				isEditMode,
				editedItems,
				enterEditMode,
				cancelEditMode,
				saveItemOrder,
				handleDragStart,
				handleDragOver,
				handleDragEnd,
				handleDrop,
				getDragItemStyle = (index) => ({ opacity: 1 }), // Provide a default implementation
				draggedIndex
			}: ReorderRenderProps) => (
				<ShelfDetailView
					shelf={shelf}
					orderedItems={enrichedOrderedItems as [number, Item][]}
					isEditMode={isEditMode}
					editedItems={editedItems}
					isOwner={isOwner}
					canAddItem={canAddItem}
					onBack={onBack}
					onAddItem={handleItemSubmit}
					onViewItem={handleViewItem}
					onEnterEditMode={enterEditMode}
					onCancelEditMode={cancelEditMode}
					onSaveItemOrder={saveItemOrder}
					handleDragStart={handleDragStart}
					handleDragOver={handleDragOver}
					handleDragEnd={handleDragEnd}
					handleDrop={handleDrop}
					getDragItemStyle={getDragItemStyle}
					draggedIndex={draggedIndex || null}
					settingsButton={
						isOwner && !isEditMode ? (
							<ShelfSettingsDialog 
								shelf={shelf} 
								onUpdateMetadata={updateMetadata}
								className="mr-2"
							/>
						) : undefined
					}
				/>
			)}
		</ItemReorderManager>
	);
};

// Export as default as well
export default ShelfDetailContainer;

// Denormalization function (can be moved to a shared util)
const denormalizeShelfForContainer = (normalizedShelf: NormalizedShelf): ShelfPublic => {
	return {
		...normalizedShelf,
		owner: Principal.fromText(normalizedShelf.owner),
		created_at: BigInt(normalizedShelf.created_at),
		updated_at: BigInt(normalizedShelf.updated_at)
	} as ShelfPublic;
}; 