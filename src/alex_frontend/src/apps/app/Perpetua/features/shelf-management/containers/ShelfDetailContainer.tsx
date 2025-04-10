import React, { useMemo, useState } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
import { parsePathInfo, usePerpetuaNavigation } from "../../../routes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { selectOptimisticShelfItemOrder } from "@/apps/app/Perpetua/state";
import { ItemReorderManager } from "../../shared/reordering/components";
import { ShelfDetailView } from "../../cards/components/ShelfDetailView";
import { ShelfSettingsDialog } from "../../shelf-settings";
import { useShelfOperations } from "../hooks";
import { isShelfContent } from "../../../utils";
import { ReorderRenderProps } from "../../../types/reordering.types";

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
	shelf: Shelf;
	onBack: () => void;
	onAddItem?: (shelf: Shelf) => void;
	onReorderItem?: (shelfId: string, itemId: number, referenceItemId: number | null, before: boolean) => Promise<void>;
	hasEditAccess?: boolean;
}

// The ShelfDetailContainer component that integrates with the UI component
export const ShelfDetailContainer: React.FC<ShelfDetailProps> = ({ 
	shelf, 
	onBack,
	onAddItem,
	onReorderItem,
	hasEditAccess = true
}) => {
	const pathInfo = parsePathInfo(window.location.pathname);
	const identity = useIdentity();
	const dispatch = useAppDispatch();
	const { goToShelf } = usePerpetuaNavigation();
	
	// Access the updateMetadata function from ShelfOperations
	const { updateMetadata, addItem } = useShelfOperations();
	
	// Check for optimistic item order
	const optimisticItemOrder = useAppSelector(selectOptimisticShelfItemOrder(shelf.shelf_id)) as number[];
	
	// Optimized ordered items calculation with memoization
	const orderedItems = useMemo(() => {
		// If we have optimistic order, prioritize it
		if (optimisticItemOrder.length > 0 && shelf.items) {
			const itemMap = new Map<number, Item>();
			shelf.items.forEach(([id, item]: [number, Item]) => itemMap.set(id, item));
			
			return optimisticItemOrder
				.map(id => itemMap.has(id) ? [id, itemMap.get(id)!] as [number, Item] : null)
				.filter((item): item is [number, Item] => item !== null);
		}
		
		// Default ordering
		if (!shelf.item_positions || !shelf.items) return [];
		
		const positionEntries = shelf.item_positions.map(([id, position]: [number, number]) => ({ id, position }));
		positionEntries.sort((a, b) => a.position - b.position);
		
		return positionEntries
			.map(({ id }) => {
				const itemPair = shelf.items?.find(([itemId]) => itemId === id);
				return itemPair ? itemPair : null;
			})
			.filter((item): item is [number, Item] => item !== null);
	}, [
		JSON.stringify({ 
			items: shelf.items?.map(([id]) => id), 
			positions: shelf.item_positions?.map(([id, pos]) => `${id}:${pos}`),
			optimistic: optimisticItemOrder
		})
	]);
	
	// Handle item click to navigate to item shelf if applicable
	const handleViewItem = (itemId: number) => {
		const itemEntry = orderedItems.find(([key]) => key === itemId);
		
		if (itemEntry && isShelfContent(itemEntry[1].content)) {
			const shelfId = itemEntry[1].content.Shelf;
			goToShelf(shelfId);
		}
	};

	// Handle item submission directly from the InlineItemCreator
	const handleItemSubmit = async (content: string, type: "Nft" | "Markdown" | "Shelf", collectionType?: "NFT" | "SBT") => {
		try {
			// Use the addItem function from ShelfOperations
			await addItem(shelf, content, type);
		} catch (error) {
			console.error("Error adding item:", error);
		}
	};
	
	return (
		<ItemReorderManager
			shelf={shelf}
			orderedItems={orderedItems}
			hasEditAccess={hasEditAccess}
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
					orderedItems={orderedItems}
					isEditMode={isEditMode}
					editedItems={editedItems}
					hasEditAccess={hasEditAccess}
					onBack={onBack}
					onAddItem={handleItemSubmit}
					onViewItem={handleViewItem}
					onEnterEditMode={enterEditMode}
					onCancelEditMode={cancelEditMode}
					onSaveItemOrder={saveItemOrder}
					handleDragStart={handleDragStart}
					handleDragOver={handleDragOver}
					handleDragEnd={handleDragEnd}
					handleDrop={(e) => handleDrop(e, 0)} // Adapt the interface
					getDragItemStyle={getDragItemStyle}
					draggedIndex={draggedIndex || null}
					settingsButton={
						hasEditAccess && !isEditMode ? (
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