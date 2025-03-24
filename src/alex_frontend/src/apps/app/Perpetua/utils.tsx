import React from "react";
import { Slot, Shelf, SlotContent } from "../../../../../declarations/perpetua/perpetua.did";
import { Button } from "@/lib/components/button";

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