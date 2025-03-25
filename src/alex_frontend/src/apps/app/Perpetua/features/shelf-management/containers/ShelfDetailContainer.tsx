import React, { useMemo } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { Shelf, Item } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { parsePathInfo, usePerpetuaNavigation } from "../../../routes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { rebalanceShelfItems } from "@/apps/Modules/shared/state/perpetua/perpetuaThunks";
import { ItemReorderManager } from "../../items/components/ItemReorderManager";
import { ShelfDetailView } from "../../cards";
import { ShelfSettingsDialog } from "../../shelf-settings";
import { useShelfOperations } from "../hooks";
import { isShelfContent } from "../../../utils";

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
	const { updateMetadata } = useShelfOperations();
	
	// Improved ordered items calculation
	const orderedItems = useMemo(() => {
		// Extract the items using the item_positions array for order
		if (!shelf.item_positions || !shelf.items) return [];
		
		// Convert positions to array and sort by position values
		const positionEntries = shelf.item_positions.map(([id, position]: [number, number]) => ({ id, position }));
		positionEntries.sort((a: {position: number}, b: {position: number}) => a.position - b.position);
		
		// Map to [id, item] pairs in the correct order
		return positionEntries.map(({ id }: {id: number}) => {
			const itemPair = shelf.items?.find(([itemId]: [number, any]) => itemId === id);
			return itemPair ? itemPair : null;
		}).filter((item: any): item is [number, Item] => item !== null);
	}, [JSON.stringify({ 
		items: shelf.items?.map(([id]: [number, any]) => id), 
		positions: shelf.item_positions?.map(([id, pos]: [number, number]) => `${id}:${pos}`)
	})]);
	
	// Existing rebalance handler
	const handleRebalance = async (shelfId: string) => {
		if (!identity || !hasEditAccess) return;
		// Check if identity.identity exists before accessing it
		if (identity.identity) {
			const principal = identity.identity.getPrincipal().toString();
			dispatch(rebalanceShelfItems({ shelfId, principal }));
		}
	};
	
	// Handle item click - for shelf items, navigate to that shelf
	const handleViewItem = (itemId: number) => {
		// Find the item with this ID
		const itemEntry = orderedItems.find(([key, _]: [number, Item]) => key === itemId);
		
		if (itemEntry && isShelfContent(itemEntry[1].content)) {
			// If this is a shelf item, navigate to that shelf
			const shelfId = itemEntry[1].content.Shelf;
			goToShelf(shelfId);
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
				handleDrop
			}) => (
				<ShelfDetailView
					shelf={shelf}
					orderedItems={orderedItems}
					isEditMode={isEditMode}
					editedItems={editedItems}
					hasEditAccess={hasEditAccess}
					onBack={onBack}
					onAddItem={onAddItem}
					onViewItem={handleViewItem}
					onEnterEditMode={enterEditMode}
					onCancelEditMode={cancelEditMode}
					onSaveItemOrder={saveItemOrder}
					handleDragStart={handleDragStart}
					handleDragOver={handleDragOver}
					handleDragEnd={handleDragEnd}
					handleDrop={handleDrop}
					settingsButton={
						hasEditAccess && !isEditMode ? (
							<ShelfSettingsDialog 
								shelf={shelf} 
								onRebalance={handleRebalance} 
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