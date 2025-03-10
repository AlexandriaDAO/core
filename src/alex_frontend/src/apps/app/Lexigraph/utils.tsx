import React from "react";
import { Slot, Shelf, SlotContent } from "../../../../../declarations/lexigraph/lexigraph.did";
import { Button } from "@/lib/components/button";
import { ExternalLink, FolderOpen } from "lucide-react";
import ReactMarkdown from 'react-markdown';

/**
 * Creates a function to find a slot by its ID across multiple shelves
 */
export const createFindSlotById = (shelves: Shelf[]) => 
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

/**
 * Creates a function to find a slot by its ID within a single shelf
 */
export const createFindSlotInShelf = (shelf: Shelf) => 
	(slotId: number): Slot | null => {
		for (const [key, slotEntry] of Object.entries(shelf.slots)) {
			const [slotKey, slot] = slotEntry as [number, Slot];
			if (slot.id === slotId) {
				return slot;
			}
		}
		return null;
	};

/**
 * Type guard for shelf content
 */
export const isShelfContent = (content: SlotContent): content is { 'Shelf': string } => {
	return 'Shelf' in content;
};

/**
 * Type guard for NFT content
 */
export const isNftContent = (content: SlotContent): content is { 'Nft': string } => {
	return 'Nft' in content;
};

/**
 * Type guard for Markdown content
 */
export const isMarkdownContent = (content: SlotContent): content is { 'Markdown': string } => {
	return 'Markdown' in content;
};

/**
 * Renders the content of a slot based on its type
 */
export const renderSlotContent = (slot: Slot, slotId: number) => {
	const { content } = slot;
	
	if (isShelfContent(content)) {
		return (
			<div>
				<div className="flex items-center gap-2 mb-2">
					<FolderOpen className="w-4 h-4 text-primary" />
					<span className="font-medium">Shelf</span>
				</div>
				<div className="text-sm">{content.Shelf}</div>
			</div>
		);
	}
	
	if (isNftContent(content)) {
		return (
			<div>
				<div className="flex items-center gap-2 mb-2">
					<ExternalLink className="w-4 h-4 text-primary" />
					<span className="font-medium">NFT</span>
				</div>
				<div className="text-sm truncate">{content.Nft}</div>
			</div>
		);
	}
	
	if (isMarkdownContent(content)) {
		return (
			<div>
				<div className="flex items-center gap-2 mb-2">
					<span className="font-medium">Note</span>
				</div>
				<div className="text-sm line-clamp-3">{content.Markdown}</div>
			</div>
		);
	}
	
	return <div>Unknown content type</div>;
};

/**
 * Memoized component for rendering slot content based on its type
 */
export const SlotContentRenderer = React.memo(({ 
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

/**
 * Renders breadcrumb navigation
 */
export const renderBreadcrumbs = (items: Array<{label: string, onClick?: () => void}>) => {
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