import React, { useMemo } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { Shelf, Slot } from "../../../../../../../../declarations/lexigraph/lexigraph.did";
import { parsePathInfo } from "../../../routes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { rebalanceShelfSlots } from "@/apps/Modules/shared/state/lexigraph/lexigraphThunks";
import { SlotReorderManager } from "../../slots/components/SlotReorderManager";
import { ShelfDetailUI } from "../../cards/containers/ShelfDetail";
import { ShelfSettingsDialog } from "../../shelf-settings";
import { useShelfOperations } from "../hooks";

/**
 * ShelfDetail Component
 * 
 * This component is responsible for managing the state and logic of a shelf detail view.
 * It works together with the ShelfDetailUI component from the cards directory:
 * 
 * - ShelfDetail (this component): Manages shelf state, data processing, and business logic
 * - ShelfDetailUI (from cards/ShelfDetail.tsx): Pure presentational component that renders the UI
 * 
 * This separation follows a container/presentational component pattern where:
 * - This container component handles data fetching, state management, and logic
 * - The ShelfDetailUI handles the visual representation without business logic
 */
export interface ShelfDetailProps {
	shelf: Shelf;
	onBack: () => void;
	onAddSlot?: (shelf: Shelf) => void;
	onReorderSlot?: (shelfId: string, slotId: number, referenceSlotId: number | null, before: boolean) => Promise<void>;
	onViewSlot: (slotId: number) => void;
	isPublic?: boolean;
}

// The ShelfDetail component that integrates with the UI component
export const ShelfDetail: React.FC<ShelfDetailProps> = ({ 
	shelf, 
	onBack,
	onAddSlot,
	onReorderSlot,
	onViewSlot,
	isPublic = false
}) => {
	const pathInfo = parsePathInfo(window.location.pathname);
	const identity = useIdentity();
	const dispatch = useAppDispatch();
	
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
		if (!identity || isPublic) return;
		// Check if identity.identity exists before accessing it
		if (identity.identity) {
			const principal = identity.identity.getPrincipal().toString();
			dispatch(rebalanceShelfSlots({ shelfId, principal }));
		}
	};
	
	return (
		<SlotReorderManager
			shelf={shelf}
			orderedSlots={orderedSlots}
			isPublic={isPublic}
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
				<div className="container mx-auto p-4">
					<ShelfDetailUI
						shelf={shelf}
						orderedSlots={orderedSlots}
						isEditMode={isEditMode}
						editedSlots={editedSlots}
						isPublic={isPublic}
						onBack={onBack}
						onAddSlot={onAddSlot}
						onViewSlot={onViewSlot}
						onEnterEditMode={enterEditMode}
						onCancelEditMode={cancelEditMode}
						onSaveSlotOrder={saveSlotOrder}
						handleDragStart={handleDragStart}
						handleDragOver={handleDragOver}
						handleDragEnd={handleDragEnd}
						handleDrop={handleDrop}
						settingsButton={
							!isPublic && !isEditMode ? (
								<ShelfSettingsDialog 
									shelf={shelf} 
									onRebalance={handleRebalance} 
									onUpdateMetadata={updateMetadata}
									className="mr-2"
								/>
							) : undefined
						}
					/>
				</div>
			)}
		</SlotReorderManager>
	);
};

// Export as default as well
export default ShelfDetail; 