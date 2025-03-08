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
	deleteShelf as deleteShelfAction,
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
	updateShelf
} from "@/apps/Modules/shared/state/lexigraph/lexigraphSlice";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { getActorLexigraph } from "@/features/auth/utils/authUtils";
import { createFindSlotById, isShelfContent, renderSlotContent, SlotContentRenderer, renderBreadcrumbs } from "./utils";

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

	const deleteShelf = useCallback(async (shelfId: string): Promise<void> => {
		if (!identity) return;
		await dispatch(deleteShelfAction({ 
			shelfId, 
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

	useEffect(() => {
		if (identity) {
			loadShelvesData();
		}
	}, [identity]);

	return {
		shelves,
		loading,
		createShelf,
		deleteShelf,
		addSlot,
		reorderSlot,
		findSlotById
	};
};

// Custom hook for public shelf operations
const usePublicShelfOperations = () => {
	const dispatch = useAppDispatch();
	const publicShelves = useAppSelector(selectPublicShelves);
	const loading = useAppSelector(selectPublicLoading);
	const lastTimestamp = useAppSelector(selectLastTimestamp);

	const loadRecentShelvesData = async (limit: number = 20, beforeTimestamp?: bigint) => {
		await dispatch(loadRecentShelves({ limit, beforeTimestamp }));
	};

	const loadMoreShelves = async () => {
		if (lastTimestamp && !loading) {
			await loadRecentShelvesData(20, lastTimestamp);
		}
	};

	// Find a slot by ID across all public shelves
	const findSlotById = createFindSlotById(publicShelves);

	useEffect(() => {
		loadRecentShelvesData();
	}, []);

	return {
		publicShelves,
		loading,
		loadRecentShelvesData,
		loadMoreShelves,
		findSlotById
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

// SlotDetail component for individual slot view
const SlotDetail = ({
	slot,
	shelf,
	slotKey,
	onBack,
	onBackToShelf
}: SlotDetailProps) => {
	const pathInfo = parsePathInfo(window.location.pathname);
	const { isExplore, isUserView, userId, backButtonLabel } = pathInfo;
	
	const breadcrumbItems = [
		{ label: backButtonLabel, onClick: onBack },
		{ label: shelf.title, onClick: () => onBackToShelf(shelf.shelf_id) },
		{ label: `Slot ${slotKey}` }
	];
	
	return (
		<div className="h-full flex flex-col">
			<div className="flex flex-col gap-4 mb-6">
				<Button variant="outline" onClick={() => onBackToShelf(shelf.shelf_id)} className="self-start flex items-center gap-2">
					<ArrowLeft className="w-4 h-4" />
					Back to Shelf
				</Button>
				{renderBreadcrumbs(breadcrumbItems)}
			</div>
			
			<div className="bg-card rounded-lg border p-6">
				<div className="mb-6">
					<h2 className="text-2xl font-bold">Slot {slotKey}</h2>
					<div className="text-sm text-muted-foreground">
						From shelf: <span className="font-medium">{shelf.title}</span>
					</div>
					{isUserView && userId && (
						<div className="text-sm text-muted-foreground mt-1">
							Owner: <span className="font-medium">{userId.slice(0, 8)}...</span>
						</div>
					)}
				</div>
				
				<div className="flex-1 overflow-auto">
					<ContentCard
						id={slot.id.toString()}
						component="Lexigraph"
						onClick={() => {
							if (isShelfContent(slot.content)) {
								const shelfContent = slot.content;
								onBackToShelf(shelfContent.Shelf);
							}
						}}
					>
						<div className="p-4 w-full h-full overflow-auto">
							<SlotContentRenderer 
								slot={slot} 
								showFull={true}
								onBackToShelf={onBackToShelf}
							/>
						</div>
					</ContentCard>
				</div>
			</div>
		</div>
	);
};

// Shelf Card Component for the list view
const ShelfCard = ({ 
	shelf, 
	onDelete, 
	onViewShelf 
}: {
	shelf: Shelf,
	onDelete: (shelfId: string) => Promise<void>,
	onViewShelf: (shelfId: string) => void
}) => {
	const createdAt = convertTimestamp(shelf.created_at);
	const slotCount = Object.keys(shelf.slots).length;
	
	return (
		<ContentCard
			onClick={() => onViewShelf(shelf.shelf_id)}
			id={shelf.shelf_id}
			component="Lexigraph"
			footer={
				<div className="flex justify-between items-center w-full mt-2">
					<div className="text-xs text-muted-foreground">
						{slotCount} {slotCount === 1 ? 'item' : 'items'}
					</div>
					<Button
						variant="outline"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(shelf.shelf_id);
						}}
						className="text-xs h-7"
					>
						Delete
					</Button>
				</div>
			}
		>
			<div className="p-4 w-full h-full flex flex-col">
				<h3 className="text-lg font-semibold mb-2">{shelf.title}</h3>
				<p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{shelf.description}</p>
				<div className="text-xs text-muted-foreground mt-2">Created {createdAt}</div>
			</div>
		</ContentCard>
	);
};

// Public Shelf Card Component for the explore view
const PublicShelfCard = ({ 
	shelf, 
	onViewShelf 
}: {
	shelf: Shelf,
	onViewShelf: (shelfId: string) => void
}) => {
	const createdAt = convertTimestamp(shelf.created_at);
	const slotCount = Object.keys(shelf.slots).length;
	
	const handleViewUser = (e: React.MouseEvent) => {
		e.stopPropagation();
		// Navigate to user's shelves
		window.location.href = `/lexigraph/user/${shelf.owner}`;
	};
	
	return (
		<ContentCard
			onClick={() => onViewShelf(shelf.shelf_id)}
			id={shelf.shelf_id}
			owner={shelf.owner.toString()}
			component="Lexigraph"
			footer={
				<div className="text-xs text-muted-foreground w-full">
					{slotCount} {slotCount === 1 ? 'item' : 'items'}
				</div>
			}
		>
			<div className="p-4 w-full h-full flex flex-col">
				<h3 className="text-lg font-semibold mb-2">{shelf.title}</h3>
				<p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{shelf.description}</p>
				<div className="text-xs text-muted-foreground mt-2">
					<span>Created {createdAt}</span>
					<Button 
						variant="link" 
						className="p-0 h-auto text-xs text-blue-500 hover:text-blue-700 ml-2"
						onClick={handleViewUser}
					>
						By: {shelf.owner.toString().slice(0, 8)}...
					</Button>
				</div>
			</div>
		</ContentCard>
	);
};

// New component for shelf settings including rebalancing
const ShelfSettings = ({ 
	shelf,
	onRebalance 
}: {
	shelf: Shelf,
	onRebalance?: (shelfId: string) => Promise<void>
}) => {
	const [metrics, setMetrics] = useState<ShelfPositionMetrics | null>(null);
	const [loading, setLoading] = useState(false);
	
	// Load metrics when component mounts
	useEffect(() => {
		const loadMetrics = async () => {
			try {
				setLoading(true);
				const lexigraphActor = await getActorLexigraph();
				const result = await lexigraphActor.get_shelf_position_metrics(shelf.shelf_id);
				if ("Ok" in result) {
					setMetrics(result.Ok);
				}
			} catch (error) {
				console.error("Failed to load metrics:", error);
			} finally {
				setLoading(false);
			}
		};
		
		loadMetrics();
	}, [shelf.shelf_id]);
	
	return (
		<div className="mt-4 p-4 bg-gray-50 rounded-lg">
			<h3 className="text-lg font-semibold mb-2">Shelf Health</h3>
			
			{loading ? (
				<div>Loading metrics...</div>
			) : metrics ? (
				<div className="mb-3 text-sm">
					<div className="flex justify-between mb-1">
						<span>Slots:</span>
						<span>{metrics.slot_count.toString()}</span>
					</div>
					<div className="flex justify-between mb-1">
						<span>Min gap:</span>
						<span>{metrics.min_gap}</span>
					</div>
					<div className="flex justify-between mb-1">
						<span>Max gap:</span>
						<span>{metrics.max_gap}</span>
					</div>
					<div className="flex justify-between mb-1">
						<span>Avg gap:</span>
						<span>{metrics.avg_gap.toFixed(2)}</span>
					</div>
					<div className="flex justify-between mb-1">
						<span>Rebalance count:</span>
						<span>{metrics.rebalance_count}</span>
					</div>
					<div className="flex justify-between">
						<span>Needs rebalance:</span>
						<span>{metrics.needs_rebalance ? "Yes" : "No"}</span>
					</div>
				</div>
			) : (
				<div className="mb-3">No metrics available</div>
			)}
			
			{onRebalance && (
				<button 
					onClick={() => onRebalance(shelf.shelf_id)}
					className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200"
					disabled={metrics ? !metrics.needs_rebalance : false}
				>
					Rebalance Slots
				</button>
			)}
			<p className="text-xs text-gray-500 mt-2">
				Rebalancing optimizes the internal position values for better performance with many reorderings.
			</p>
		</div>
	);
};

// Consolidated ShelfDetail component that works for both personal and public shelves
const ShelfDetail = ({ 
	shelf, 
	onBack,
	onAddSlot,
	onReorderSlot,
	onViewSlot,
	isPublic = false
}: ShelfDetailProps) => {
	const pathInfo = parsePathInfo(window.location.pathname);
	const { isExplore, isUserView, userId, backButtonLabel } = pathInfo;
	const identity = useIdentity();
	
	const dispatch = useAppDispatch();
	
	// Add edit mode state
	const [isEditMode, setIsEditMode] = useState(false);
	const [editedSlots, setEditedSlots] = useState<[number, Slot][]>([]);
	const [draggedItem, setDraggedItem] = useState<number | null>(null);
	const [dragOverItem, setDragOverItem] = useState<number | null>(null);
	
	// Breadcrumbs data
	const breadcrumbItems = [
		{ label: backButtonLabel, onClick: onBack },
		{ label: shelf.title }
	];
	
	// Simplified drag and drop functionality
	useEffect(() => {
		if (!isEditMode) return;
		
		const styleEl = document.createElement('style');
		styleEl.textContent = `
			.slot-item {
				transition: transform 0.2s ease, box-shadow 0.2s ease;
				user-select: none;
			}
			.opacity-50 {
				opacity: 0.5;
			}
			.border-dashed {
				border-style: dashed !important;
			}
			.border-primary {
				border-color: #6366f1 !important;
			}
			.cursor-move {
				cursor: move;
			}
			.cursor-grab {
				cursor: grab;
			}
			.slot-drag-handle {
				cursor: grab;
				padding: 8px;
				border-radius: 4px;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.slot-drag-handle:hover {
				background: #f0f0f0;
			}
		`;
		document.head.appendChild(styleEl);
		
		return () => {
			document.head.removeChild(styleEl);
		};
	}, [isEditMode]);
	
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

	return (
		<div className="container mx-auto p-6">
			<div className="space-y-6">
				{/* Breadcrumbs */}
				<div className="mb-6">
					{renderBreadcrumbs(breadcrumbItems)}
				</div>
				
				{/* Shelf header with title, description, and control buttons */}
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-2xl font-bold">{shelf.title}</h1>
						<p className="text-muted-foreground mt-1">{shelf.description}</p>
						{isUserView && userId && (
							<div className="text-sm text-muted-foreground mt-2">
								Owner: <span className="font-medium">{userId}</span>
							</div>
						)}
					</div>
					<div className="flex gap-2">
						{!isPublic && !isEditMode && onAddSlot && (
							<Button onClick={() => onAddSlot(shelf)}>
								<Plus className="w-4 h-4 mr-2" />
								Add Slot
							</Button>
						)}
						{!isPublic && !isEditMode && orderedSlots.length > 0 && (
							<Button variant="outline" onClick={enterEditMode}>
								<Edit className="w-4 h-4 mr-2" />
								Edit Layout
							</Button>
						)}
					</div>
				</div>

				{/* Display the slots in a unified grid view with conditional edit features */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{orderedSlots.length === 0 ? (
						<div className="p-8 bg-secondary rounded-md text-center col-span-3">
							<p>This shelf doesn't have any slots yet.</p>
							{!isPublic && onAddSlot && (
								<Button onClick={() => onAddSlot(shelf)} className="mt-4">
									<Plus className="w-4 h-4 mr-2" />
									Add Your First Slot
								</Button>
							)}
						</div>
					) : (
						(isEditMode ? editedSlots : orderedSlots).map(([slotId, slot], index) => (
							<div 
								key={slotId} 
								className={`relative group ${
									isEditMode && index === draggedItem ? 'opacity-50' : ''
								} ${
									isEditMode && index === dragOverItem ? 'border-dashed border-2 border-primary' : ''
								}`}
								draggable={isEditMode}
								onDragStart={isEditMode ? () => handleDragStart(index) : undefined}
								onDragOver={isEditMode ? (e) => handleDragOver(e, index) : undefined}
								onDragEnd={isEditMode ? handleDragEnd : undefined}
								onDrop={isEditMode ? (e) => handleDrop(e, index) : undefined}
							>
								<div
									className={`border rounded-lg p-4 h-full hover:border-primary hover:shadow-md transition-all ${
										isEditMode ? 'cursor-move' : 'cursor-pointer'
									}`}
									onClick={isEditMode ? undefined : () => onViewSlot(slotId)}
								>
									{!isPublic && isEditMode && (
										<div className="flex items-center justify-between mb-2">
											<div className="font-medium">Slot #{slotId}</div>
											<div 
												className="slot-drag-handle text-gray-400 p-1 rounded hover:bg-gray-100 cursor-grab"
												onMouseDown={(e) => {
													// Prevent the click event on the parent div
													e.stopPropagation();
												}}
											>
												<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
													<path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
												</svg>
											</div>
										</div>
									)}
									{renderSlotContent(slot, slotId)}
								</div>
							</div>
						))
					)}
				</div>
				
				{/* Show edit controls for non-public shelves */}
				{!isPublic && orderedSlots.length > 0 && (
					<div className="mt-6 flex justify-end space-x-2">
						{isEditMode ? (
							<>
								<Button 
									variant="outline"
									onClick={() => setIsEditMode(false)}
								>
									<X className="w-4 h-4 mr-2" />
									Cancel
								</Button>
								<Button 
									onClick={saveSlotOrder}
									variant="primary"
								>
									<Check className="w-4 h-4 mr-2" />
									Save Order
								</Button>
							</>
						) : (
							<Button variant="outline" onClick={enterEditMode}>
								<Edit className="w-4 h-4 mr-2" />
								Edit Layout
							</Button>
						)}
					</div>
				)}
				
				{/* Show ShelfSettings with rebalance option for owner only, but hide in edit mode */}
				{!isPublic && !isEditMode && <ShelfSettings shelf={shelf} onRebalance={handleRebalance} />}
			</div>
		</div>
	);
};

const Lexigraph: React.FC = () => {
	const { shelves, loading, createShelf, deleteShelf, addSlot, reorderSlot, findSlotById } = useShelfOperations();
	const { publicShelves, loading: publicLoading, loadMoreShelves, findSlotById: findPublicSlotById } = usePublicShelfOperations();
	const [isNewShelfDialogOpen, setIsNewShelfDialogOpen] = useState(false);
	const [isNewSlotDialogOpen, setIsNewSlotDialogOpen] = useState(false);
	const dispatch = useAppDispatch();
	const selectedShelf = useAppSelector(selectSelectedShelf);
	
	// Use both hooks for combined functionality
	const { 
		goToShelves, 
		goToShelf, 
		goToSlot, 
		switchTab,
		goToUser
	} = useLexigraphNavigation();
	
	// Use the new hook for view state determination
	const { viewFlags, params } = useViewState();
	const { shelfId, slotId, userId } = params;
	const { 
		isMyLibrary, 
		isExplore, 
		isUserView,
		isShelfDetail,
		isSlotDetail,
		isUserDetail,
		isMainView,
		isPublicContext
	} = viewFlags;
	
	// Derive active tab directly from route state - no need for separate state
	const activeTab = isExplore ? "explore" : isUserView ? "user" : "my-library";
	
	// Tab change handler calls the navigation function
	const handleTabChange = useCallback((value: string) => {
		switchTab(value);
	}, [switchTab]);

	// Memoize computed values for better performance
	const shelvesWithSlots = useMemo(() => {
		return shelves?.map(shelf => ({
			...shelf,
			slotsCount: shelf.slots?.length || 0
		})) || [];
	}, [shelves]);

	// Update callbacks with proper dependencies
	const handleCreateShelf = useCallback(async (title: string, description: string) => {
		await createShelf(title, description);
		setIsNewShelfDialogOpen(false);
	}, [createShelf, setIsNewShelfDialogOpen]);

	const handleDeleteShelf = useCallback(async (shelfId: string) => {
		await deleteShelf(shelfId);
		// If we're on the shelf detail page and that shelf was deleted, go back to the list
		if (window.location.pathname.includes(`/shelf/${shelfId}`)) {
			goToShelves();
		}
	}, [deleteShelf, goToShelves]);

	const handleAddSlot = useCallback((shelf: Shelf) => {
		dispatch(setSelectedShelf(shelf));
		setIsNewSlotDialogOpen(true);
	}, [dispatch, setSelectedShelf, setIsNewSlotDialogOpen]);

	const handleAddNewSlot = useCallback(async (content: string, type: "Nft" | "Markdown" | "Shelf") => {
		if (selectedShelf) {
			await addSlot(selectedShelf.shelf_id, content, type);
			setIsNewSlotDialogOpen(false);
		}
	}, [selectedShelf, addSlot, setIsNewSlotDialogOpen]);

	const handleSubmitNewSlot = useCallback(async (content: string, type: "Nft" | "Markdown" | "Shelf") => {
		await handleAddNewSlot(content, type);
	}, [handleAddNewSlot]);

	const handleBackToShelf = useCallback((shelfId: string) => {
		goToShelf(shelfId);
	}, [goToShelf]);

	const handleBackToShelves = useCallback(() => {
		goToShelves();
	}, [goToShelves]);

	const handleViewShelf = useCallback((shelfId: string) => {
		goToShelf(shelfId);
	}, [goToShelf]);

	const handleViewSlot = useCallback((slotId: number) => {
		goToSlot(slotId);
	}, [goToSlot]);

	// Add the reorderSlot handler
	const handleReorderSlot = useCallback(async (
		shelfId: string, 
		slotId: number, 
		referenceSlotId: number | null, 
		before: boolean
	) => {
		await reorderSlot(shelfId, slotId, referenceSlotId, before);
	}, [reorderSlot]);

	// If we have a slotId parameter, show the individual slot view
	if (isSlotDetail && slotId) {
		const numericSlotId = parseInt(slotId, 10);
		const slotInfo = isPublicContext
			? findPublicSlotById(numericSlotId)
			: findSlotById(numericSlotId);
		
		if (!slotInfo) {
			return (
				<div className="container mx-auto p-4">
					<div className="flex items-center gap-4 mb-6">
						<Button variant="outline" onClick={handleBackToShelves} className="flex items-center gap-2">
							<ArrowLeft className="w-4 h-4" />
							Back
						</Button>
					</div>
					<div className="p-8 text-center">
						<h2 className="text-xl font-semibold mb-4">Slot not found</h2>
						<p>The slot you're looking for doesn't exist or has been deleted.</p>
					</div>
				</div>
			);
		}
		
		return (
			<div className="container mx-auto p-4">
				<SlotDetail 
					slot={slotInfo.slot}
					shelf={slotInfo.shelf}
					slotKey={slotInfo.slotKey}
					onBack={handleBackToShelves}
					onBackToShelf={handleBackToShelf}
				/>
			</div>
		);
	}

	// If we have a shelfId parameter, show the individual shelf view
	if (isShelfDetail && shelfId) {
		const currentShelf = isPublicContext
			? publicShelves.find(shelf => shelf.shelf_id === shelfId)
			: shelves.find(shelf => shelf.shelf_id === shelfId);
		
		if (!currentShelf) {
			return (
				<div className="container mx-auto p-4">
					<div className="flex items-center gap-4 mb-6">
						<Button variant="outline" onClick={handleBackToShelves} className="flex items-center gap-2">
							<ArrowLeft className="w-4 h-4" />
							Back
						</Button>
					</div>
					<div className="p-8 text-center">
						<h2 className="text-xl font-semibold mb-4">Shelf not found</h2>
						<p>The shelf you're looking for doesn't exist or has been deleted.</p>
					</div>
				</div>
			);
		}
		
		return (
			<div className="container mx-auto p-4">
				<ShelfDetail 
					shelf={currentShelf}
					onBack={handleBackToShelves}
					onAddSlot={!isPublicContext ? handleAddSlot : undefined}
					onReorderSlot={!isPublicContext ? handleReorderSlot : undefined}
					onViewSlot={handleViewSlot}
					isPublic={isPublicContext}
				/>
				
				{!isPublicContext && (
					<NewSlotDialog 
						isOpen={isNewSlotDialogOpen}
						onClose={() => setIsNewSlotDialogOpen(false)}
						onSubmit={handleSubmitNewSlot}
						shelves={shelves}
					/>
				)}
			</div>
		);
	}

	// If we have a userId parameter but no shelfId or slotId, show the user's shelves
	if (isUserDetail) {
		return (
			<div className="container mx-auto p-4">
				<div className="flex items-center gap-4 mb-6">
					<Button variant="outline" onClick={() => goToShelves()} className="flex items-center gap-2">
						<ArrowLeft className="w-4 h-4" />
						Back to Explore
					</Button>
					<h1 className="text-2xl font-bold">User's Shelves</h1>
				</div>

				{publicLoading ? (
					<div className="p-8 text-center">Loading shelves...</div>
				) : publicShelves.length === 0 ? (
					<div className="p-8 bg-secondary rounded-md text-center">
						<p>This user has no public shelves.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{publicShelves.map((shelf) => (
							<PublicShelfCard 
								key={shelf.shelf_id}
								shelf={shelf}
								onViewShelf={handleViewShelf}
							/>
						))}
					</div>
				)}
			</div>
		);
	}

	// Main view with tabs (only show if we're not in a specific user, shelf, or slot view)
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

						{loading ? (
							<div className="p-8 text-center">Loading your shelves...</div>
						) : shelves.length === 0 ? (
							<div className="p-8 bg-secondary rounded-md text-center">
								<p className="mb-4">You don't have any shelves yet.</p>
								<Button onClick={() => setIsNewShelfDialogOpen(true)}>
									<Plus className="w-4 h-4 mr-2" />
									Create Your First Shelf
								</Button>
							</div>
						) : (
							<ContentGrid>
								{shelves.map((shelf) => (
									<ShelfCard 
										key={shelf.shelf_id}
										shelf={shelf}
										onDelete={handleDeleteShelf}
										onViewShelf={handleViewShelf}
									/>
								))}
							</ContentGrid>
						)}

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

						{publicLoading ? (
							<div className="p-8 text-center">Loading shelves...</div>
						) : publicShelves.length === 0 ? (
							<div className="p-8 bg-secondary rounded-md text-center">
								<p>No public shelves available.</p>
							</div>
						) : (
							<>
								<ContentGrid>
									{publicShelves.map((shelf) => (
										<PublicShelfCard 
											key={shelf.shelf_id}
											shelf={shelf}
											onViewShelf={handleViewShelf}
										/>
									))}
								</ContentGrid>
								
								<div className="mt-6 text-center">
									<Button variant="outline" onClick={loadMoreShelves}>
										Load More
									</Button>
								</div>
							</>
						)}
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
