import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Plus, ArrowLeft, ExternalLink, Library, Globe, FolderOpen } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Slot, Shelf, SlotContent } from "../../../../../declarations/lexigraph/lexigraph.did";
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
	selectLastTimestamp
} from "@/apps/Modules/shared/state/lexigraph/lexigraphSlice";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";

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

// Utility function for finding slots across shelves
const createFindSlotById = (shelves: Shelf[]) => 
	(slotId: number): { slot: Slot; shelf: Shelf; slotKey: number } | null => {
		for (const shelf of shelves) {
			for (const [key, slotEntry] of Object.entries(shelf.slots)) {
				const [slotKey, slot] = slotEntry as [number, Slot];
				if (slot.id === slotId) {
					return { slot, shelf, slotKey };
				}
			}
		}
		return null;
	};

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

// Update the type definitions for the slot content type guard functions
const isShelfContent = (content: SlotContent): content is { 'Shelf': string } => {
	return 'Shelf' in content;
};

const isNftContent = (content: SlotContent): content is { 'Nft': string } => {
	return 'Nft' in content;
};

const isMarkdownContent = (content: SlotContent): content is { 'Markdown': string } => {
	return 'Markdown' in content;
};

// Memoize the SlotContentRenderer component for better performance
const SlotContentRenderer = React.memo(({ 
	slot, 
	showFull = false, 
	onViewSlot,
	onBackToShelf = undefined
}: {
	slot: Slot, 
	showFull?: boolean,
	onViewSlot?: (slotId: number) => void,
	onBackToShelf?: (shelfId: string) => void
}) => {
	// Type-safe handling of slot content
	if (isNftContent(slot.content)) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<div className="text-lg font-semibold mb-2">NFT</div>
					<div>ID: {slot.content.Nft}</div>
					<Button 
						variant="outline" 
						className="mt-2"
						asChild
					>
						<a href={`/nft/${slot.content.Nft}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
							<ExternalLink className="w-3 h-3" />
							View NFT
						</a>
					</Button>
				</div>
			</div>
		);
	} else if (isShelfContent(slot.content)) {
		// Now TypeScript knows slot.content is of type { 'Shelf': string }
		const shelfContent = slot.content;
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<div className="text-lg font-semibold mb-2">Nested Shelf</div>
					<div>ID: {shelfContent.Shelf}</div>
					{onViewSlot && (
						<Button 
							variant="outline" 
							className="mt-2"
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								// Convert the string to number before passing to onViewSlot
								const shelfId = parseInt(shelfContent.Shelf, 10);
								onViewSlot(shelfId);
							}}
						>
							<FolderOpen className="w-3 h-3 mr-1" />
							Open Shelf
						</Button>
					)}
					{onBackToShelf && (
						<Button 
							variant="outline" 
							className="mt-2"
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								onBackToShelf(shelfContent.Shelf);
							}}
						>
							<FolderOpen className="w-3 h-3 mr-1" />
							Open Shelf
						</Button>
					)}
				</div>
			</div>
		);
	} else if (isMarkdownContent(slot.content)) {
		return (
			<div className="prose dark:prose-invert max-w-none">
				<ReactMarkdown>
					{showFull 
						? slot.content.Markdown 
						: (slot.content.Markdown.length > 150 
							? `${slot.content.Markdown.substring(0, 150)}...` 
							: slot.content.Markdown)}
				</ReactMarkdown>
			</div>
		);
	}
	
	return <div>Unknown content type</div>;
});

// Add a displayName for better debugging
SlotContentRenderer.displayName = 'SlotContentRenderer';

// Shared utility function for breadcrumbs
const renderBreadcrumbs = (items: Array<{label: string, onClick?: () => void}>) => {
	return (
		<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
			{items.map((item, index) => (
				<React.Fragment key={index}>
					{index > 0 && <span>/</span>}
					{item.onClick ? (
						<Button variant="link" className="p-0 h-auto" onClick={item.onClick}>
							{item.label}
						</Button>
					) : (
						<span className="text-foreground">{item.label}</span>
					)}
				</React.Fragment>
			))}
		</div>
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
	
	const breadcrumbItems = [
		{ label: backButtonLabel, onClick: onBack },
		{ label: shelf.title }
	];
	
	// Convert slots object to array of [number, Slot] pairs
	const slots = Object.entries(shelf.slots).map(([_, entry]) => {
		// Each entry is already a tuple of [nat32, Slot]
		return entry as [number, Slot];
	});
	
	const handleReorder = async (slotId: number, referenceSlotId: number | null, before: boolean) => {
		if (onReorderSlot) {
			await onReorderSlot(shelf.shelf_id, slotId, referenceSlotId, before);
		}
	};
	
	return (
		<div className="h-full flex flex-col">
			<div className="flex flex-col gap-4 mb-6">
				<Button variant="outline" onClick={onBack} className="self-start flex items-center gap-2">
					<ArrowLeft className="w-4 h-4" />
					Back to {backButtonLabel}
				</Button>
				{renderBreadcrumbs(breadcrumbItems)}
			</div>
			
			<div className="bg-card rounded-lg border p-6 mb-6">
				<div className="flex justify-between items-start mb-6">
					<div>
						<h1 className="text-2xl font-bold">{shelf.title}</h1>
						<p className="text-muted-foreground mt-1">{shelf.description}</p>
						{isUserView && userId && (
							<div className="text-sm text-muted-foreground mt-2">
								Owner: <span className="font-medium">{userId}</span>
							</div>
						)}
					</div>
					{!isPublic && onAddSlot && (
						<Button onClick={() => onAddSlot(shelf)}>
							<Plus className="w-4 h-4 mr-2" />
							Add Slot
						</Button>
					)}
				</div>
				
				{slots.length === 0 ? (
					<div className="p-8 bg-secondary rounded-md text-center">
						<p>This shelf doesn't have any slots yet.</p>
						{!isPublic && onAddSlot && (
							<Button onClick={() => onAddSlot(shelf)} className="mt-4">
								<Plus className="w-4 h-4 mr-2" />
								Add Your First Slot
							</Button>
						)}
					</div>
				) : (
					<ContentGrid>
						{slots.map(([slotKey, slot], index) => (
							<ContentCard
								key={slotKey}
								onClick={() => onViewSlot(slot.id)}
								id={slot.id.toString()}
								component="Lexigraph"
								footer={
									!isPublic && onReorderSlot ? (
										<div className="flex gap-2 mt-1 w-full justify-end">
											{index > 0 && (
												<Button
													variant="outline"
													onClick={(e) => {
														e.stopPropagation();
														handleReorder(slot.id, slots[index - 1][1].id, true);
													}}
													className="text-xs py-1 h-auto"
												>
													Move Up
												</Button>
											)}
											{index < slots.length - 1 && (
												<Button
													variant="outline"
													onClick={(e) => {
														e.stopPropagation();
														handleReorder(slot.id, slots[index + 1][1].id, false);
													}}
													className="text-xs py-1 h-auto"
												>
													Move Down
												</Button>
											)}
										</div>
									) : undefined
								}
							>
								<div className="p-4 w-full h-full overflow-auto">
									<div className="text-xs text-muted-foreground mb-2">
										<div>Slot ID: {slot.id}</div>
									</div>
									
									<SlotContentRenderer 
										slot={slot} 
										onViewSlot={onViewSlot}
									/>
								</div>
							</ContentCard>
						))}
					</ContentGrid>
				)}
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
					onReorderSlot={!isPublicContext ? reorderSlot : undefined}
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
