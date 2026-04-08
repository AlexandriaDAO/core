import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, BookOpen, Copy, Check, GripVertical, Info, Layers, LayoutGrid, List, Loader2, Package } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Badge } from "@/lib/components/badge";
import { Skeleton } from "@/lib/components/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/components/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/lib/components/dialog";
import { NftContext, type Modal } from "@/components/NftProvider";
import { NFTModal } from "@/features/nft";
import { useShelf } from "../hooks/useShelf";
import { useCanEdit } from "../hooks/usePermissions";
import { useReorder } from "../hooks/useReorder";
import { useSetItemOrder } from "../hooks/useMutations";
import { useUsername } from "@/hooks/useUsername";
import { convertTimestamp } from "@/utils/general";
import { shortenPrincipal, getItemContentValue } from "../utils";
import type { Item } from "../types";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ItemCard from "./ItemCard";
import AddItem from "../actions/AddItem";
import RemoveItem from "../actions/RemoveItem";
import EditShelfMeta from "../actions/EditShelfMeta";
import TogglePublicAccess from "../actions/TogglePublicAccess";
import ManageTags from "../actions/ManageTags";

type ViewMode = "grid" | "list" | "blog";

const viewModes: { mode: ViewMode; icon: typeof LayoutGrid }[] = [
	{ mode: "grid", icon: LayoutGrid },
	{ mode: "list", icon: List },
	{ mode: "blog", icon: BookOpen },
];

function ViewSwitch({ viewMode, onChange }: { viewMode: ViewMode; onChange: (mode: ViewMode) => void }) {
	return (
		<div className="inline-flex items-center h-[22px] rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-1 py-0.5 gap-0.5">
			{viewModes.map(({ mode, icon: Icon }) => (
				<button
					key={mode}
					onClick={() => onChange(mode)}
					className="flex items-center justify-center h-4 w-4 rounded-full transition-colors cursor-pointer"
				>
					<span className={`flex items-center justify-center h-4 w-4 rounded-full ${viewMode === mode ? "bg-green-500" : ""}`}>
						<Icon className={`h-2.5 w-2.5 ${viewMode === mode ? "text-white" : "text-muted-foreground dark:text-gray-400"}`} />
					</span>
				</button>
			))}
		</div>
	);
}

function getItemLabel(item: Item): string {
	if ("Markdown" in item.content) {
		const text = getItemContentValue(item.content);
		return text.slice(0, 60) || "Markdown item";
	}
	if ("Nft" in item.content) return `NFT #${getItemContentValue(item.content)}`;
	if ("Shelf" in item.content) return `Shelf: ${getItemContentValue(item.content).slice(0, 20)}`;
	return "Item";
}

function SortableRow({ id, item, index }: { id: string; item: Item; index: number }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-shadow ${
				isDragging ? "shadow-lg ring-2 ring-primary/30 opacity-90" : "hover:shadow-sm"
			}`}
		>
			<button
				{...attributes}
				{...listeners}
				className="shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted dark:hover:bg-gray-800 transition-colors touch-none"
			>
				<GripVertical className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
			</button>
			<span className="text-sm font-medium truncate flex-1">
				{getItemLabel(item)}
			</span>
			<span className="text-xs text-muted-foreground dark:text-gray-500 shrink-0">
				#{index + 1}
			</span>
		</div>
	);
}

interface ShelfDetailProps {
	shelfId: string;
	userId?: string;
}

export default function ShelfDetail({ shelfId, userId }: ShelfDetailProps) {
	const navigate = useNavigate();
	const { data: shelf, isLoading, error } = useShelf(shelfId);
	const { isOwner, canEdit } = useCanEdit(shelfId);
	const setItemOrder = useSetItemOrder();
	const [nftModal, setNftModal] = useState<Modal | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const { username: ownerName } = useUsername(shelf?.owner);

	const handleSaveOrder = useCallback(async (reordered: [number, Item][]) => {
		await setItemOrder.mutateAsync({
			shelfId,
			itemIds: reordered.map(([, item]) => item.id),
		});
	}, [shelfId, setItemOrder]);

	const getId = useCallback(([key]: [number, Item]) => String(key), []);

	const reorder = useReorder({
		items: shelf?.items ?? [],
		getId,
		onSave: handleSaveOrder,
	});

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor),
	);

	const sortableIds = useMemo(
		() => reorder.displayItems.map(([key]) => String(key)),
		[reorder.displayItems],
	);

	if (isLoading) return <ShelfDetailSkeleton />;

	if (error || !shelf) {
		return (
			<div className="flex flex-col gap-6 px-4 py-6 max-w-6xl mx-auto animate-fade">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" scale="sm" onClick={() => navigate({ to: "/app/perpetua" })} className="self-start h-9 w-9 p-0">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Back</TooltipContent>
				</Tooltip>
				<div className="flex flex-col items-center gap-4 py-24 text-muted-foreground dark:text-gray-400">
					<div className="h-12 w-12 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center">
						<Package className="h-6 w-6" />
					</div>
					<p className="text-base">{error ? "Failed to load shelf." : "Shelf not found."}</p>
				</div>
			</div>
		);
	}

	const handleBack = () => {
		if (userId) {
			navigate({ to: "/app/perpetua/user/$userId", params: { userId } });
		} else {
			navigate({ to: "/app/perpetua" });
		}
	};

	const handleOwnerClick = () => {
		navigate({ to: "/app/perpetua/user/$userId", params: { userId: shelf.owner } });
	};

	const isBlogView = viewMode === "blog";

	return (
		<div className="flex flex-col gap-5 px-4 py-6 max-w-6xl w-full mx-auto">
			{/* Row 1: Back + Title + Edit (left) — Actions (right) */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" scale="sm" onClick={handleBack} className="h-8 w-8 p-0 shrink-0">
									<ArrowLeft className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Back</TooltipContent>
						</Tooltip>
						<h1 className="text-2xl font-bold font-syne truncate">{shelf.title}</h1>
						{isOwner && (
							<EditShelfMeta
								shelfId={shelfId}
								currentTitle={shelf.title}
								currentDescription={shelf.description}
							/>
						)}
					</div>
					<div className="mt-1.5">
						{shelf.description && (
							<p className="text-base text-muted-foreground dark:text-gray-400">{shelf.description}</p>
						)}
						<div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground dark:text-gray-400">
							<span>updated by</span>
							<button onClick={handleOwnerClick} className="hover:underline hover:text-foreground transition-colors">
								{ownerName ? `@${ownerName}` : shortenPrincipal(shelf.owner)}
							</button>
							<span>{convertTimestamp(BigInt(shelf.updatedAt), "relative")}</span>
						</div>
					</div>
				</div>

				{/* Right side actions */}
				<div className="flex items-center shrink-0">
					{canEdit && (
						<>
							{!reorder.isEditMode ? (
								shelf.items.length > 1 && (
									<Button variant="ghost" scale="sm" onClick={reorder.enterEditMode} className="h-9 px-2 text-sm text-muted-foreground dark:text-gray-400">
										<GripVertical className="h-4 w-4 mr-1" />
										Reorder
									</Button>
								)
							) : (
								<div className="flex items-center gap-1.5">
									<Button variant="primary" scale="sm" onClick={reorder.save} disabled={reorder.isSaving}>
										{reorder.isSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
										Save
									</Button>
									<Button variant="secondary" scale="sm" onClick={reorder.cancelEditMode} disabled={reorder.isSaving}>
										Cancel
									</Button>
								</div>
							)}

							<div className="h-5 w-px bg-border dark:bg-gray-700 mx-1" />

							<AddItem
								shelfId={shelfId}
								existingShelfIds={shelf.items
									.filter(([, item]) => "Shelf" in item.content)
									.map(([, item]) => getItemContentValue(item.content))
								}
							/>

							{isOwner && (
								<>
									<div className="h-5 w-px bg-border dark:bg-gray-700 mx-1" />
									<TogglePublicAccess shelfId={shelfId} isPublic={shelf.publicEditing} />
									<div className="h-5 w-px bg-border dark:bg-gray-700 mx-1" />
									<ShelfInfo shelf={shelf} />
								</>
							)}
						</>
					)}

					{!canEdit && (
						<Badge variant="outline" className="text-sm py-0.5 px-2 shrink-0">
							{shelf.publicEditing ? "Public" : "Private"}
						</Badge>
					)}
				</div>
			</div>

			{/* Row 2: View switch + Tags */}
			<div className="flex gap-2 flex-wrap items-center">
				{!reorder.isEditMode && reorder.displayItems.length > 0 && (
					<ViewSwitch viewMode={viewMode} onChange={setViewMode} />
				)}

				{isOwner ? (
					<ManageTags shelfId={shelfId} tags={shelf.tags} />
				) : shelf.tags.length > 0 ? (
					<>
						{shelf.tags.map((tag) => (
							<Badge key={tag} variant="outline" className="text-xs py-0.5 px-2.5 bg-gray-50 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
								{tag}
							</Badge>
						))}
					</>
				) : null}
			</div>

			{/* Row 3: Items — wrapped in NftContext for shared NFT modal */}
			<NftContext.Provider value={{ safe: false, modal: nftModal, setModal: setNftModal }}>
				{reorder.displayItems.length === 0 ? (
					<div className="flex flex-col items-center gap-4 py-24 text-muted-foreground dark:text-gray-400 animate-fade">
						<div className="h-12 w-12 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center">
							<Package className="h-6 w-6" />
						</div>
						<p className="text-base">This shelf is empty. Add some items to get started!</p>
					</div>
				) : reorder.isEditMode ? (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={reorder.onDragEnd}
					>
						<SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
							<div className="flex flex-col gap-2">
								{reorder.displayItems.map(([itemKey, item], index) => (
									<SortableRow
										key={itemKey}
										id={String(itemKey)}
										item={item}
										index={index}
									/>
								))}
							</div>
						</SortableContext>
					</DndContext>
				) : isBlogView ? (
					<BlogView items={reorder.displayItems} canEdit={canEdit} shelfId={shelfId} />
				) : viewMode === "list" ? (
					<div className="flex flex-col gap-4 max-w-3xl">
						{reorder.displayItems.map(([itemKey, item], index) => (
							<div
								key={itemKey}
								className="relative group animate-fade"
								style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
							>
								<ItemCard item={item} listView />
								{canEdit && (
									<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<RemoveItem shelfId={shelfId} itemId={item.id} />
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-center">
						{reorder.displayItems.map(([itemKey, item], index) => (
							<div
								key={itemKey}
								className="relative group animate-fade"
								style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
							>
								<ItemCard item={item} />
								{canEdit && (
									<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<RemoveItem shelfId={shelfId} itemId={item.id} />
									</div>
								)}
							</div>
						))}
					</div>
				)}

				<NFTModal />
			</NftContext.Provider>
		</div>
	);
}

function AppearsInShelf({ shelfId, onNavigate }: { shelfId: string; onNavigate: () => void }) {
	const { data: shelf, isLoading } = useShelf(shelfId);

	return (
		<button
			onClick={onNavigate}
			className="flex items-center gap-2 text-left px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
		>
			<Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
			{isLoading ? (
				<Skeleton className="h-4 w-32" />
			) : (
				<span className="text-sm font-roboto-condensed truncate">{shelf?.title || shelfId}</span>
			)}
		</button>
	);
}

function ShelfInfo({ shelf }: { shelf: { shelfId: string; createdAt: number; updatedAt: number; appearsIn: string[]; items: [number, Item][] } }) {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const navigate = useNavigate();

	const handleCopy = async () => {
		await navigator.clipboard.writeText(shelf.shelfId);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	const infoRows = [
		{ label: "Created", value: convertTimestamp(BigInt(shelf.createdAt), "readable") },
		{ label: "Updated", value: convertTimestamp(BigInt(shelf.updatedAt), "readable") },
		{ label: "Items", value: String(shelf.items.length) },
	];

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" scale="sm" onClick={() => setOpen(true)} className="h-9 px-2 text-sm text-muted-foreground dark:text-gray-400">
						<Info className="h-4 w-4 mr-1" />
						Info
					</Button>
				</TooltipTrigger>
				<TooltipContent>Shelf info</TooltipContent>
			</Tooltip>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 font-syne">
							<div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
								<Info className="h-4 w-4 text-muted-foreground" />
							</div>
							Shelf Details
						</DialogTitle>
						<DialogDescription className="sr-only">Details about this shelf</DialogDescription>
					</DialogHeader>

					<div className="h-px bg-border dark:bg-gray-700" />
					<p className="text-xs text-muted-foreground dark:text-gray-400">
						Metadata and identifiers for this shelf. Use the shelf ID to reference it elsewhere.
					</p>

					<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
						{/* Shelf ID row */}
						<div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
							<div className="flex flex-col gap-0.5 min-w-0">
								<span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-500">Shelf ID</span>
								<code className="text-xs font-mono text-foreground break-all">{shelf.shelfId}</code>
							</div>
							<button
								onClick={handleCopy}
								className="shrink-0 h-6 w-6 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
							>
								{copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
							</button>
						</div>

						{/* Info rows */}
						{infoRows.map(({ label, value }, i) => (
							<div key={label} className={`flex items-center justify-between px-4 py-2.5 ${i < infoRows.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
								<span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-500">{label}</span>
								<span className="text-sm text-foreground font-roboto-condensed">{value}</span>
							</div>
						))}
					</div>

					{/* Appears In section */}
					{shelf.appearsIn.length > 0 && (
						<div className="flex flex-col gap-2">
							<span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-500">
								Referenced by these shelves
							</span>
							<div className="flex flex-col gap-1.5">
								{shelf.appearsIn.map((id) => (
									<AppearsInShelf
										key={id}
										shelfId={id}
										onNavigate={() => {
											setOpen(false);
											navigate({ to: "/app/perpetua/shelf/$shelfId", params: { shelfId: id } });
										}}
									/>
								))}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

function BlogView({ items, canEdit, shelfId }: { items: [number, Item][]; canEdit: boolean; shelfId: string }) {
	type SectionType = "markdown" | "visual";
	type BlogSection = { type: SectionType; items: [number, Item, number][] };

	const sections: BlogSection[] = [];
	let currentGroup: [number, Item, number][] = [];
	let currentType: SectionType | null = null;

	items.forEach(([itemKey, item], index) => {
		const itemType: SectionType = "Markdown" in item.content ? "markdown" : "visual";
		if (currentType !== null && currentType !== itemType) {
			sections.push({ type: currentType, items: [...currentGroup] });
			currentGroup = [];
		}
		currentGroup.push([itemKey, item, index]);
		currentType = itemType;
	});
	if (currentGroup.length > 0 && currentType !== null) {
		sections.push({ type: currentType, items: [...currentGroup] });
	}

	return (
		<div className="max-w-3xl">
			{sections.map((section, sectionIndex) => (
				<div key={sectionIndex} className="mb-12 animate-fade">
					{section.type === "markdown" ? (
						<div className="prose dark:prose-invert max-w-none">
							{section.items.map(([itemKey, item]) => (
								<div key={itemKey} className="relative group mb-8">
									<MarkdownRenderer
										content={(item.content as any).Markdown}
										className="shadow-none"
									/>
									{canEdit && (
										<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<RemoveItem shelfId={shelfId} itemId={item.id} />
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-center">
							{section.items.map(([itemKey, item, index]) => (
								<div
									key={itemKey}
									className="relative group animate-fade"
									style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
								>
									<ItemCard item={item} />
									{canEdit && (
										<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<RemoveItem shelfId={shelfId} itemId={item.id} />
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

function ShelfDetailSkeleton() {
	return (
		<div className="flex flex-col gap-5 px-4 py-6 max-w-6xl w-full mx-auto">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-8 rounded-lg shrink-0" />
						<Skeleton className="h-7 w-48" />
					</div>
					<div className="ml-10 mt-2 space-y-2">
						<Skeleton className="h-5 w-72" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
				<div className="flex gap-1">
					<Skeleton className="h-9 w-9 rounded-lg" />
					<Skeleton className="h-9 w-9 rounded-lg" />
				</div>
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-8 w-20 rounded-full" />
				<Skeleton className="h-8 w-16 rounded-full" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
				{Array.from({ length: 4 }, (_, i) => (
					<Skeleton key={i} className="aspect-square rounded-lg" />
				))}
			</div>
		</div>
	);
}
