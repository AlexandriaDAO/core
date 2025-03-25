import React from "react";
import { Item, Shelf, ItemContent } from "../../../../../declarations/perpetua/perpetua.did";
import { Button } from "@/lib/components/button";

/**
 * Creates a function to find a item by its ID across multiple shelves
 */
export const createFindItemById = (shelves: Shelf[]) => 
	(itemId: number): { item: Item; shelf: Shelf; itemKey: number } | null => {
		for (const shelf of shelves) {
			for (const [key, itemEntry] of Object.entries(shelf.items)) {
				const [itemKey, item] = itemEntry as [number, Item];
				if (item.id === itemId) {
					return { item, shelf, itemKey };
				}
			}
		}
		return null;
	};

/**
 * Creates a function to find a item by its ID within a single shelf
 */
export const createFindItemInShelf = (shelf: Shelf) => 
	(itemId: number): Item | null => {
		for (const [key, itemEntry] of Object.entries(shelf.items)) {
			const [itemKey, item] = itemEntry as [number, Item];
			if (item.id === itemId) {
				return item;
			}
		}
		return null;
	};

/**
 * Type guard for shelf content
 */
export const isShelfContent = (content: ItemContent): content is { 'Shelf': string } => {
	return 'Shelf' in content;
};

/**
 * Type guard for NFT content
 */
export const isNftContent = (content: ItemContent): content is { 'Nft': string } => {
	return 'Nft' in content;
};

/**
 * Type guard for Markdown content
 */
export const isMarkdownContent = (content: ItemContent): content is { 'Markdown': string } => {
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