import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Plus, ArrowLeft, Library, Globe, Check, X, Edit } from "lucide-react";
import { Slot, Shelf, ShelfPositionMetrics } from "../../../../../declarations/lexigraph/lexigraph.did";
import { convertTimestamp } from "@/utils/general";
import { parsePathInfo } from "./routes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { useLexigraphNavigation, useViewState } from "./routes";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { 
	loadShelves, 
	createShelf as createShelfAction, 
	addSlot as addSlotAction,
	reorderSlot as reorderSlotAction,
	loadRecentShelves,
	setSelectedShelf,
	selectShelves,
	selectPublicShelves,
	selectSelectedShelf,
	selectLoading,
	selectPublicLoading,
	selectLastTimestamp,
	rebalanceShelfSlots,
	updateShelfMetadata
} from "@/apps/Modules/shared/state/lexigraph/lexigraphSlice";
import { createFindSlotById, createFindSlotInShelf, renderSlotContent, SlotContentRenderer, renderBreadcrumbs } from "./utils";
// Import the UI components from ui-components.tsx
import {
	SlotDetail,
	ShelfDetailUI,
	LibraryShelvesUI,
	ExploreShelvesUI,
	UserShelvesUI
} from "./ui-components";
import { ShelfSettings } from "./ShelfSettings";

// Common dialog props used across dialog components
interface DialogProps {
	isOpen: boolean;
	onClose: () => void;
}

// Props for NewShelfDialog
interface NewShelfDialogProps extends DialogProps {
	onSubmit: (title: string, description: string) => Promise<void>;
}

// Props for NewSlotDialog
interface NewSlotDialogProps extends DialogProps {
	onSubmit: (content: string, type: "Nft" | "Markdown" | "Shelf") => Promise<void>;
	shelves?: Shelf[];
}

// Props for ShelfDetail
interface ShelfDetailProps {
	shelf: Shelf;
	onBack: () => void;
	onAddSlot?: (shelf: Shelf) => void;
	onReorderSlot?: (shelfId: string, slotId: number, referenceSlotId: number | null, before: boolean) => Promise<void>;
	onViewSlot: (slotId: number) => void;
	isPublic?: boolean;
}

// Props for SlotDetail
interface SlotDetailProps {
	slot: Slot;
	shelf: Shelf;
	slotKey: number;
	onBack: () => void;
	onBackToShelf: (shelfId: string) => void;
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

	const addSlot = useCallback(async (shelfId: string, content: string, type: "Nft" | "Markdown" | "Shelf"): Promise<void> => {
		if (!identity) return;
		
		// Find the shelf with the given ID
		const shelf = shelves.find(s => s.shelf_id === shelfId);
		if (!shelf) return;

		await dispatch(addSlotAction({ 
			shelf, 
			content, 
			type, 
			principal: identity.getPrincipal() 
		}));
	}, [identity, dispatch, shelves]);

	const reorderSlot = useCallback(async (
		shelfId: string, 
		slotId: number, 
		referenceSlotId: number | null, 
		before: boolean
	): Promise<void> => {
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

	const loadRecentShelvesData = useCallback(async (limit: number = 20, beforeTimestamp?: bigint) => {
		await dispatch(loadRecentShelves({ limit, beforeTimestamp }));
	}, [dispatch]);

	const loadMoreShelves = useCallback(async () => {
		if (lastTimestamp && !loading) {
			await loadRecentShelvesData(20, lastTimestamp);
		}
	}, [lastTimestamp, loading, loadRecentShelvesData]);

	// Find a slot by ID across all public shelves
	const findSlotById = createFindSlotById(publicShelves);

	// Ensure public shelves are loaded
	useEffect(() => {
		// Only load if the public shelves array is empty and we're not already loading
		if (publicShelves.length === 0 && !loading) {
			loadRecentShelvesData();
		}
	}, [publicShelves.length, loading, loadRecentShelvesData]);

	return {
		publicShelves,
		loading,
		loadMoreShelves,
		findSlotById,
		refreshPublicShelves: () => loadRecentShelvesData() // Add a refresh function
	};
};

// New Shelf Dialog Component
const NewShelfDialog = ({ isOpen, onClose, onSubmit }: NewShelfDialogProps) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = async () => {
		await onSubmit(title, description);
		setTitle("");
		setDescription("");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Shelf</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Shelf Title"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Description"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={handleSubmit}>Create</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

// New Slot Dialog Component
const NewSlotDialog = ({ isOpen, onClose, onSubmit, shelves }: NewSlotDialogProps) => {
	const [content, setContent] = useState("");
	const [type, setType] = useState<"Nft" | "Markdown" | "Shelf">("Markdown");
	const [selectedShelfId, setSelectedShelfId] = useState<string>("");

	const handleSubmit = async () => {
		// If type is Shelf, use the selected shelf ID as content
		const finalContent = type === "Shelf" ? selectedShelfId : content;
		await onSubmit(finalContent, type);
		setContent("");
		setSelectedShelfId("");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Slot</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label>Content Type</Label>
						<div className="flex gap-4 flex-wrap">
							<Button
								variant={type === "Markdown" ? "primary" : "outline"}
								onClick={() => setType("Markdown")}
							>
								Markdown
							</Button>
							<Button
								variant={type === "Nft" ? "primary" : "outline"}
								onClick={() => setType("Nft")}
							>
								NFT
							</Button>
							<Button
								variant={type === "Shelf" ? "primary" : "outline"}
								onClick={() => setType("Shelf")}
							>
								Shelf
							</Button>
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="content">Content</Label>
						{type === "Markdown" ? (
							<Textarea
								id="content"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Enter markdown content..."
							/>
						) : type === "Nft" ? (
							<Input
								id="content"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Enter NFT ID..."
							/>
						) : (
							<div className="grid gap-2">
								<Label htmlFor="shelfSelect">Select a Shelf</Label>
								<select
									id="shelfSelect"
									value={selectedShelfId}
									onChange={(e) => setSelectedShelfId(e.target.value)}
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<option value="">Select a shelf...</option>
									{shelves?.map((shelf) => (
										<option key={shelf.shelf_id} value={shelf.shelf_id}>
											{shelf.title}
										</option>
									))}
								</select>
							</div>
						)}
					</div>
				</div>
				<DialogFooter>
					<Button onClick={handleSubmit} disabled={type === "Shelf" && !selectedShelfId}>Add</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
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
	
	// Add edit mode state
	const [isEditMode, setIsEditMode] = useState(false);
	const [editedSlots, setEditedSlots] = useState<[number, Slot][]>([]);
	const [draggedItem, setDraggedItem] = useState<number | null>(null);
	const [dragOverItem, setDragOverItem] = useState<number | null>(null);
	
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
	}, [shelf.slots, shelf.slot_positions]);
	
	// Enter edit mode
	const enterEditMode = () => {
		// Initialize editedSlots with the current slot order
		setEditedSlots([...orderedSlots]);
		setIsEditMode(true);
		setDraggedItem(null);
		setDragOverItem(null);
	};
	
	// Existing reorder handler
	const handleReorder = async (slotId: number, referenceSlotId: number | null, before: boolean) => {
		if (onReorderSlot) {
			await onReorderSlot(shelf.shelf_id, slotId, referenceSlotId, before);
		}
	};
	
	// Existing rebalance handler
	const handleRebalance = async (shelfId: string) => {
		if (identity && identity.identity) {
			const principal = identity.identity.getPrincipal();
			await dispatch(rebalanceShelfSlots({ 
				shelfId,
				principal
			}));
		}
	};
	
	// New handler for saving the edited slots order
	const saveSlotOrder = async () => {
		if (identity && identity.identity) {
			const principal = identity.identity.getPrincipal();
			
			try {
				// Get original order to compare with
				const originalOrderMap = new Map();
				orderedSlots.forEach(([id], index) => {
					originalOrderMap.set(id, index);
				});
				
				// Find the differences and apply each move
				// We need to reorder one slot at a time using the backend API
				for (let newIndex = 0; newIndex < editedSlots.length; newIndex++) {
					const [slotId] = editedSlots[newIndex];
					const oldIndex = originalOrderMap.get(slotId);
					
					// If position has changed
					if (oldIndex !== newIndex) {
						// Find the reference slot (the one we'll place this slot before or after)
						let referenceSlotId: number | null = null;
						let before = false;
						
						if (newIndex === 0) {
							// If moving to the first position, place before the current first item
							if (editedSlots.length > 1) {
								const [firstSlotId] = editedSlots[1];
								referenceSlotId = firstSlotId;
								before = true;
							}
						} else {
							// Otherwise, place after the previous item
							const [prevSlotId] = editedSlots[newIndex - 1];
							referenceSlotId = prevSlotId;
							before = false;
						}
						
						// Call the reorderSlot action
						await dispatch(reorderSlotAction({
							shelfId: shelf.shelf_id,
							slotId,
							referenceSlotId,
							before,
							principal
						}));
					}
				}
				
				// Exit edit mode after successful updates
				setIsEditMode(false);
			} catch (error) {
				console.error("Failed to save slot order:", error);
				// Could add error notification here
			}
		}
	};
	
	// Drag handlers
	const handleDragStart = (index: number) => {
		setDraggedItem(index);
	};
	
	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		setDragOverItem(index);
	};
	
	const handleDragEnd = () => {
		// Reset the dragged item
		setDraggedItem(null);
		setDragOverItem(null);
		
		// If we have both a valid dragged item and drop target
		if (draggedItem !== null && dragOverItem !== null && draggedItem !== dragOverItem) {
			// Create a copy of the items
			const items = [...editedSlots];
			// Remove the dragged item
			const draggedItemContent = items[draggedItem];
			items.splice(draggedItem, 1);
			// Add it back at the new position
			items.splice(dragOverItem, 0, draggedItemContent);
			// Update state
			setEditedSlots(items);
		}
	};
	
	const handleDrop = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		// The state updates will be handled in dragEnd
	};

	// Use the UI component
	const shelfDetailUI = (
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
			onCancelEditMode={() => setIsEditMode(false)}
			onSaveSlotOrder={saveSlotOrder}
			handleDragStart={handleDragStart}
			handleDragOver={handleDragOver}
			handleDragEnd={handleDragEnd}
			handleDrop={handleDrop}
		/>
	);

	return (
		<div className="container mx-auto p-4">
			{shelfDetailUI}
			{/* Show ShelfSettings with rebalance option for owner only, but hide in edit mode */}
			{!isPublic && !isEditMode && <ShelfSettings shelf={shelf} onRebalance={handleRebalance} onUpdateMetadata={updateMetadata} />}
		</div>
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
			await addSlot(selectedShelf.shelf_id, content, type);
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
	}, [isExplore, publicShelves.length, publicLoading, refreshPublicShelves]);

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
						<div className="flex justify-between items-center mb-6">
							<h1 className="text-2xl font-bold">My Shelves</h1>
							<Dialog open={isNewShelfDialogOpen} onOpenChange={setIsNewShelfDialogOpen}>
								<DialogTrigger asChild>
									<Button>
										<Plus className="w-4 h-4 mr-2" />
										New Shelf
									</Button>
								</DialogTrigger>
							</Dialog>
						</div>

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
						<div className="flex justify-between items-center mb-6">
							<h1 className="text-2xl font-bold">Explore Shelves</h1>
						</div>

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
