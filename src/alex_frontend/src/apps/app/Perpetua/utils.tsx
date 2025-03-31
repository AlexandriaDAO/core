import React from "react";
import { Item, Shelf, ItemContent } from "@/../../declarations/perpetua/perpetua.did";
import { Button } from "@/lib/components/button";
import { NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { Principal } from '@dfinity/principal';
import { ShelfMetrics } from './features/shelf-settings/hooks/useShelfMetrics';

// Generic Result type similar to Rust's Result
export type Result<T, E> = { Ok: T } | { Err: E };

/**
 * Converts a string or Principal to a Principal
 */
export const toPrincipal = (principal: Principal | string): Principal => {
	return typeof principal === 'string' ? Principal.fromText(principal) : principal;
};

/**
 * Creates a function to find a item by its ID across multiple shelves
 * Supports both Shelf and NormalizedShelf types
 */
export const createFindItemById = (shelves: (Shelf | NormalizedShelf)[]) => 
	(itemId: number): { item: Item; shelf: Shelf | NormalizedShelf; itemKey: number } | null => {
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
 * Supports both Shelf and NormalizedShelf types
 */
export const createFindItemInShelf = (shelf: Shelf | NormalizedShelf) => 
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

/**
 * Normalizes a principal to its string representation for consistent handling
 */
export const principalToString = (principal: Principal | string): string => {
	return typeof principal === 'string' ? principal : principal.toString();
};

/**
 * Formats a shelf metric value for display
 */
export const formatMetricValue = (value: number | bigint): string => {
	if (typeof value === 'bigint') {
		return value.toString();
	}
	
	// Format floating point numbers to 2 decimal places
	if (Number.isInteger(value)) {
		return value.toString();
	} else {
		return value.toFixed(2);
	}
};

/**
 * Determines if rebalancing is recommended based on metrics
 */
export const isRebalanceRecommended = (metrics: ShelfMetrics | null): boolean => {
	if (!metrics) return false;
	return metrics.needs_rebalance;
};

/**
 * Extracts a useful error message from various error types
 */
export const extractErrorMessage = (error: unknown, fallback: string = "An error occurred"): string => {
	if (error instanceof Error) {
		return error.message;
	} else if (typeof error === 'string') {
		return error;
	} else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
		return error.message;
	}
	return fallback;
}; 