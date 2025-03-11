import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { Library, Globe } from "lucide-react";
import { Slot, Shelf } from "../../../../../declarations/lexigraph/lexigraph.did";
import { parsePathInfo } from "./routes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { useLexigraphNavigation, useViewState } from "./routes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
	setSelectedShelf,
	selectShelves,
	selectPublicShelves,
	selectSelectedShelf,
	selectLoading,
	selectPublicLoading,
	selectLastTimestamp,
} from "@/apps/Modules/shared/state/lexigraph/lexigraphSlice";

import {
	loadShelves, 
	createShelf as createShelfAction, 
	addSlot as addSlotAction,
	reorderSlot as reorderSlotAction,
	loadRecentShelves,
	rebalanceShelfSlots,
	updateShelfMetadata
} from "@/apps/Modules/shared/state/lexigraph/lexigraphThunks";

import { getPrincipalAsString } from "@/apps/Modules/shared/utils/principalUtils";
import { createFindSlotById, createFindSlotInShelf } from "./utils";
// Import the UI components from ui-components.tsx
import {
	SlotDetail,
	ShelfDetailUI,
	LibraryShelvesUI,
	ExploreShelvesUI,
	UserShelvesUI
} from "./cards/index";
import { ShelfSettings, ShelfSettingsDialog } from "./features/shelf-settings";
import NewSlotDialog from "./components/NewSlot";
import NewShelfDialog from "./components/NewShelf";
import SlotReorderManager from "./components/SlotReorderManager";

// Props for ShelfDetail
interface ShelfDetailProps {
	shelf: Shelf;
	onBack: () => void;
	onAddSlot?: (shelf: Shelf) => void;
	onReorderSlot?: (shelfId: string, slotId: number, referenceSlotId: number | null, before: boolean) => Promise<void>;
	onViewSlot: (slotId: number) => void;
	isPublic?: boolean;
}

// Custom hook for shelf operations
const useShelfOperations = () => {
	const { identity } = useIdentity();
	const dispatch = useAppDispatch();
	const shelves = useAppSelector(selectShelves);
	const loading = useAppSelector(selectLoading);

	const loadShelvesData = useCallback(async () => {
		if (!identity) return;
		dispatch(loadShelves(identity.getPrincipal()));
	}, [identity, dispatch]);

	const createShelf = useCallback(async (title: string, description: string): Promise<void> => {
		if (!identity) return;
		await dispatch(createShelfAction({ 
			title, 
			description, 
			principal: identity.getPrincipal()
		}));
	}, [identity, dispatch]);

	const addSlot = useCallback(async (shelf: Shelf, content: string, type: "Nft" | "Markdown" | "Shelf", referenceSlotId?: number | null, before?: boolean): Promise<void> => {
		if (!identity) return;
		await dispatch(addSlotAction({ 
			shelf, 
			content, 
			type,
			principal: identity.getPrincipal(),
			referenceSlotId,
			before
		}));
	}, [identity, dispatch]);

	const reorderSlot = useCallback(async (shelfId: string, slotId: number, referenceSlotId: number | null, before: boolean): Promise<void> => {
		if (!identity) return;
		await dispatch(reorderSlotAction({ 
			shelfId, 
			slotId, 
			referenceSlotId, 
			before,
			principal: identity.getPrincipal()
		}));
	}, [identity, dispatch]);

	// Helper function to find a slot by ID across all shelves
	const findSlotById = createFindSlotById(shelves);

	const updateMetadata = async (shelfId: string, title?: string, description?: string) => {
		try {
			await dispatch(updateShelfMetadata({ shelfId, title, description })).unwrap();
			return true;
		} catch (error) {
			console.error("Failed to update shelf metadata:", error);
			return false;
		}
	};

	useEffect(() => {
		if (identity) {
			loadShelvesData();
		}
	}, [identity, loadShelvesData]);

	return {
		shelves,
		loading,
		createShelf,
		addSlot,
		reorderSlot,
		findSlotById,
		updateMetadata,
	};
};

// Custom hook for public shelf operations
const usePublicShelfOperations = () => {
	const dispatch = useAppDispatch();
	const publicShelves = useAppSelector(selectPublicShelves);
	const loading = useAppSelector(selectPublicLoading);
	const lastTimestamp = useAppSelector(selectLastTimestamp);

	const loadRecentShelvesData = useCallback(async (limit: number = 20, beforeTimestamp?: string | bigint) => {
		await dispatch(loadRecentShelves({ limit, beforeTimestamp }));
	}, [dispatch]);

	const loadMoreShelves = useCallback(async () => {
		if (lastTimestamp && !loading) {
			await loadRecentShelvesData(20, lastTimestamp);
		}
	}, [lastTimestamp, loading, loadRecentShelvesData]);

	// Find a slot by ID across all public shelves
	const findSlotById = createFindSlotById(publicShelves);

	// Only load public shelves once when the hook is first used
	const initialLoadRef = React.useRef(false);
	useEffect(() => {
		// Only load once if the public shelves array is empty and we're not already loading
		if (publicShelves.length === 0 && !loading && !initialLoadRef.current) {
			initialLoadRef.current = true;
			loadRecentShelvesData();
		}
	}, [publicShelves.length, loading, loadRecentShelvesData]);

	// Explicit refresh function - only call when needed
	const refreshPublicShelves = useCallback(() => {
		// Only refresh if not currently loading
		if (!loading) {
			loadRecentShelvesData();
		}
	}, [loading, loadRecentShelvesData]);

	return {
		publicShelves,
		loading,
		loadMoreShelves,
		findSlotById,
		refreshPublicShelves
	};
};

// The ShelfDetail component that integrates with the UI component
const ShelfDetail = ({ 
	shelf, 
	onBack,
	onAddSlot,
	onReorderSlot,
	onViewSlot,
	isPublic = false
}: ShelfDetailProps) => {
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
		const positionEntries = shelf.slot_positions.map(([id, position]) => ({ id, position }));
		positionEntries.sort((a, b) => a.position - b.position);
		
		// Map to [id, slot] pairs in the correct order
		return positionEntries.map(({ id }) => {
			const slotPair = shelf.slots.find(([slotId]) => slotId === id);
			return slotPair ? slotPair : null;
		}).filter((slot): slot is [number, Slot] => slot !== null);
	}, [JSON.stringify({ 
		slots: shelf.slots?.map(([id]) => id), 
		positions: shelf.slot_positions?.map(([id, pos]) => `${id}:${pos}`)
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

const Lexigraph: React.FC = () => {
	const { shelves, loading, createShelf, addSlot, reorderSlot } = useShelfOperations();
	const { publicShelves, loading: publicLoading, loadMoreShelves, refreshPublicShelves } = usePublicShelfOperations();
	const [isNewShelfDialogOpen, setIsNewShelfDialogOpen] = useState(false);
	const [isNewSlotDialogOpen, setIsNewSlotDialogOpen] = useState(false);
	const dispatch = useAppDispatch();
	const selectedShelf = useAppSelector(selectSelectedShelf);
	
	// Use navigation hooks
	const { 
		goToShelves, 
		goToShelf, 
		goToSlot, 
		switchTab
	} = useLexigraphNavigation();
	
	// Use the view state hook
	const { viewFlags, params } = useViewState();
	const { shelfId, slotId, userId } = params;
	const { 
		isExplore, 
		isShelfDetail,
		isSlotDetail,
		isUserDetail,
		isMainView,
		isPublicContext
	} = viewFlags;
	
	// Derive active tab directly from route state
	const activeTab = isExplore ? "explore" : "my-library";
	
	// Tab change handler
	const handleTabChange = useCallback((value: string) => {
		switchTab(value);
		// If switching to the explore tab, ensure we have the latest public shelves
		if (value === 'explore') {
			refreshPublicShelves();
		}
	}, [switchTab, refreshPublicShelves]);

	// Update callbacks
	const handleCreateShelf = useCallback(async (title: string, description: string) => {
		await createShelf(title, description);
		setIsNewShelfDialogOpen(false);
	}, [createShelf]);

	const handleAddSlot = useCallback((shelf: Shelf) => {
		dispatch(setSelectedShelf(shelf));
		setIsNewSlotDialogOpen(true);
	}, [dispatch]);

	const handleSubmitNewSlot = useCallback(async (content: string, type: "Nft" | "Markdown" | "Shelf") => {
		if (selectedShelf) {
			await addSlot(selectedShelf, content, type);
			setIsNewSlotDialogOpen(false);
		}
	}, [selectedShelf, addSlot]);

	const handleViewShelf = useCallback((shelfId: string) => {
		goToShelf(shelfId);
	}, [goToShelf]);

	const handleViewSlot = useCallback((slotId: number) => {
		// Save the current shelf ID in the state
		if (shelfId) {
			// Store the shelf ID so we can use it in the slot view
			const shelf = isPublicContext 
				? publicShelves.find(s => s.shelf_id === shelfId)
				: shelves.find(s => s.shelf_id === shelfId);
				
			if (shelf) {
				dispatch(setSelectedShelf(shelf));
			}
			goToSlot(slotId);
		}
	}, [goToSlot, shelfId, shelves, publicShelves, isPublicContext, dispatch]);

	// Handle reordering slots
	const handleReorderSlot = useCallback(async (
		shelfId: string, 
		slotId: number, 
		referenceSlotId: number | null, 
		before: boolean
	) => {
		await reorderSlot(shelfId, slotId, referenceSlotId, before);
	}, [reorderSlot]);

	// Update selected shelf when shelfId changes
	useEffect(() => {
		if (shelfId) {
			const shelf = isPublicContext 
				? publicShelves.find(s => s.shelf_id === shelfId)
				: shelves.find(s => s.shelf_id === shelfId);
			
			if (shelf && (!selectedShelf || selectedShelf.shelf_id !== shelf.shelf_id)) {
				dispatch(setSelectedShelf(shelf));
			}
		}
		// We don't want to clear the selectedShelf when navigating to a slot
		// because we need it for the slot detail view
	}, [shelfId, shelves, publicShelves, isPublicContext, selectedShelf, dispatch]);

	// Load public shelves when the explore tab is active
	useEffect(() => {
		if (isExplore && publicShelves.length === 0 && !publicLoading) {
			refreshPublicShelves();
		}
		// Only run this effect when switching to the explore tab for the first time
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isExplore]);

	// Shelf detail view
	if (isShelfDetail) {
		const shelf = isPublicContext 
			? publicShelves.find(s => s.shelf_id === shelfId)
			: shelves.find(s => s.shelf_id === shelfId);
		
		if (!shelf) {
			if ((isPublicContext && publicLoading) || (!isPublicContext && loading)) {
				return <div>Loading shelf...</div>;
			}
			return <div>Shelf not found</div>;
		}
		
		return (
			<>
				<ShelfDetail
					shelf={shelf}
					onBack={goToShelves}
					onAddSlot={isExplore ? undefined : handleAddSlot}
					onReorderSlot={isExplore ? undefined : handleReorderSlot}
					onViewSlot={handleViewSlot}
					isPublic={isExplore}
				/>
				
				<NewSlotDialog 
					isOpen={isNewSlotDialogOpen}
					onClose={() => setIsNewSlotDialogOpen(false)}
					onSubmit={handleSubmitNewSlot}
					shelves={shelves}
				/>
			</>
		);
	}

	// Slot detail view
	if (isSlotDetail) {
		if (!slotId) return <div>Missing parameters</div>;
		
		// Try to get the shelf from URL params first, then fall back to selectedShelf
		let shelf: Shelf | undefined | null = null;
		
		if (shelfId) {
			shelf = isPublicContext 
				? publicShelves.find(s => s.shelf_id === shelfId)
				: shelves.find(s => s.shelf_id === shelfId);
		} else if (selectedShelf) {
			// Use the selected shelf if URL param is not available
			shelf = selectedShelf;
		}
		
		if (!shelf) {
			if ((isPublicContext && publicLoading) || (!isPublicContext && loading)) {
				return <div>Loading shelf...</div>;
			}
			return <div>Shelf not found. Please go back and try again.</div>;
		}
		
		const findSlotInCurrentShelf = createFindSlotInShelf(shelf);
		const slotId_num = parseInt(slotId);
		const slot = findSlotInCurrentShelf(slotId_num);
		
		if (!slot) return <div>Slot not found</div>;
		
		return (
			<>
				<SlotDetail
					slot={slot}
					shelf={shelf}
					slotKey={slotId_num}
					onBack={() => goToShelf(shelf.shelf_id)}
					onBackToShelf={goToShelf}
				/>
				
				<NewSlotDialog 
					isOpen={isNewSlotDialogOpen}
					onClose={() => setIsNewSlotDialogOpen(false)}
					onSubmit={handleSubmitNewSlot}
					shelves={shelves}
				/>
			</>
		);
	}

	// User detail view
	if (isUserDetail) {
		return (
			<>
				<UserShelvesUI
					shelves={publicShelves}
					loading={publicLoading}
					onBack={goToShelves}
					onViewShelf={handleViewShelf}
				/>
				
				<NewSlotDialog 
					isOpen={isNewSlotDialogOpen}
					onClose={() => setIsNewSlotDialogOpen(false)}
					onSubmit={handleSubmitNewSlot}
					shelves={shelves}
				/>
			</>
		);
	}

	// Main view with tabs
	if (isMainView) {
		return (
			<div className="container mx-auto p-4">
				<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-6">
						<TabsTrigger value="my-library" className="flex items-center gap-2">
							<Library className="w-4 h-4" />
							My Library
						</TabsTrigger>
						<TabsTrigger value="explore" className="flex items-center gap-2">
							<Globe className="w-4 h-4" />
							Explore
						</TabsTrigger>
					</TabsList>
					
					<TabsContent value="my-library">
						<LibraryShelvesUI
							shelves={shelves}
							loading={loading}
							onNewShelf={() => setIsNewShelfDialogOpen(true)}
							onViewShelf={handleViewShelf}
						/>

						<NewShelfDialog 
							isOpen={isNewShelfDialogOpen}
							onClose={() => setIsNewShelfDialogOpen(false)}
							onSubmit={handleCreateShelf}
						/>
					</TabsContent>
					
					<TabsContent value="explore">
						<ExploreShelvesUI
							shelves={publicShelves}
							loading={publicLoading}
							onViewShelf={handleViewShelf}
							onLoadMore={loadMoreShelves}
						/>
					</TabsContent>
				</Tabs>

				<NewSlotDialog 
					isOpen={isNewSlotDialogOpen}
					onClose={() => setIsNewSlotDialogOpen(false)}
					onSubmit={handleSubmitNewSlot}
					shelves={shelves}
				/>
			</div>
		);
	}

	// Fallback for any other case
	return (
		<div className="container mx-auto p-4">
			<div className="p-8 text-center">
				<h2 className="text-xl font-semibold mb-4">Loading...</h2>
			</div>
		</div>
	);
}

export default Lexigraph;
