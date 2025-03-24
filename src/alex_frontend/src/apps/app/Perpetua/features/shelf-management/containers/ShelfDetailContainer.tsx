import React, { useMemo } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { Shelf, Slot } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { parsePathInfo, usePerpetuaNavigation } from "../../../routes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { rebalanceShelfSlots } from "@/apps/Modules/shared/state/perpetua/perpetuaThunks";
import { SlotReorderManager } from "../../slots/components/SlotReorderManager";
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
	onAddSlot?: (shelf: Shelf) => void;
	onReorderSlot?: (shelfId: string, slotId: number, referenceSlotId: number | null, before: boolean) => Promise<void>;
	hasEditAccess?: boolean;
}

// The ShelfDetailContainer component that integrates with the UI component
export const ShelfDetailContainer: React.FC<ShelfDetailProps> = ({ 
	shelf, 
	onBack,
	onAddSlot,
	onReorderSlot,
	hasEditAccess = true
}) => {
	const pathInfo = parsePathInfo(window.location.pathname);
	const identity = useIdentity();
	const dispatch = useAppDispatch();
	const { goToShelf } = usePerpetuaNavigation();
	
	// Access the updateMetadata function from ShelfOperations
	const { updateMetadata } = useShelfOperations();
	
	// Improved ordered slots calculation
	const orderedSlots = useMemo(() => {
		// Extract the slots using the slot_positions array for order
		if (!shelf.slot_positions || !shelf.slots) return [];
		
		// Convert positions to array and sort by position values
		const positionEntries = shelf.slot_positions.map(([id, position]: [number, number]) => ({ id, position }));
		positionEntries.sort((a: {position: number}, b: {position: number}) => a.position - b.position);
		
		// Map to [id, slot] pairs in the correct order
		return positionEntries.map(({ id }: {id: number}) => {
			const slotPair = shelf.slots?.find(([slotId]: [number, any]) => slotId === id);
			return slotPair ? slotPair : null;
		}).filter((slot: any): slot is [number, Slot] => slot !== null);
	}, [JSON.stringify({ 
		slots: shelf.slots?.map(([id]: [number, any]) => id), 
		positions: shelf.slot_positions?.map(([id, pos]: [number, number]) => `${id}:${pos}`)
	})]);
	
	// Existing rebalance handler
	const handleRebalance = async (shelfId: string) => {
		if (!identity || !hasEditAccess) return;
		// Check if identity.identity exists before accessing it
		if (identity.identity) {
			const principal = identity.identity.getPrincipal().toString();
			dispatch(rebalanceShelfSlots({ shelfId, principal }));
		}
	};
	
	// Handle slot click - for shelf slots, navigate to that shelf
	const handleViewSlot = (slotId: number) => {
		// Find the slot with this ID
		const slotEntry = orderedSlots.find(([key, _]: [number, Slot]) => key === slotId);
		
		if (slotEntry && isShelfContent(slotEntry[1].content)) {
			// If this is a shelf slot, navigate to that shelf
			const shelfId = slotEntry[1].content.Shelf;
			goToShelf(shelfId);
		}
	};
	
	return (
		<SlotReorderManager
			shelf={shelf}
			orderedSlots={orderedSlots}
			hasEditAccess={hasEditAccess}
		>
			{({
				isEditMode,
				editedSlots,
				enterEditMode,
				cancelEditMode,
				saveSlotOrder,
				handleDragStart,
				handleDragOver,
				handleDragEnd,
				handleDrop
			}) => (
				<ShelfDetailView
					shelf={shelf}
					orderedSlots={orderedSlots}
					isEditMode={isEditMode}
					editedSlots={editedSlots}
					hasEditAccess={hasEditAccess}
					onBack={onBack}
					onAddSlot={onAddSlot}
					onViewSlot={handleViewSlot}
					onEnterEditMode={enterEditMode}
					onCancelEditMode={cancelEditMode}
					onSaveSlotOrder={saveSlotOrder}
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
		</SlotReorderManager>
	);
};

// Export as default as well
export default ShelfDetailContainer; 