import type { ShelfPublic } from "../../../../declarations/perpetua/perpetua.did";
import type { Shelf } from "./types";

export function normalizeShelf(raw: ShelfPublic): Shelf {
	// Build a position lookup from item_positions (already sorted by position)
	const positionMap = new Map<number, number>();
	raw.item_positions.forEach(([itemId, position]) => {
		positionMap.set(itemId, position);
	});

	// Sort items by position — raw.items comes from BTreeMap (sorted by ID, not position)
	const sortedItems = [...raw.items].sort(([idA], [idB]) => {
		const posA = positionMap.get(idA) ?? Infinity;
		const posB = positionMap.get(idB) ?? Infinity;
		return posA - posB;
	});

	return {
		shelfId: raw.shelf_id,
		title: raw.title,
		description: raw.description[0] ?? null,
		owner: raw.owner.toString(),
		createdAt: Number(raw.created_at),
		updatedAt: Number(raw.updated_at),
		appearsIn: raw.appears_in,
		tags: raw.tags,
		publicEditing: raw.public_editing,
		items: sortedItems,
		itemPositions: raw.item_positions,
	};
}

export function unwrapResult<T>(result: { Ok: T } | { Err: any }): T {
	if ("Ok" in result) return result.Ok;
	const err = result.Err;
	if (typeof err === "string") throw new Error(err);
	const key = Object.keys(err)[0];
	const val = err[key];
	const detail = val !== null && val !== undefined ? `: ${JSON.stringify(val)}` : "";
	throw new Error(key ? `${key}${detail}` : "Unknown error");
}

export function getHourlySeed(): bigint {
	return BigInt(Math.floor(Date.now() / (1000 * 60 * 60)));
}

export function shortenPrincipal(principal: string, chars = 5): string {
	if (principal.length <= chars * 2 + 3) return principal;
	return `${principal.slice(0, chars)}...${principal.slice(-chars)}`;
}

export function getItemContentType(content: { Nft?: string; Markdown?: string; Shelf?: string }): "Nft" | "Markdown" | "Shelf" {
	if ("Nft" in content) return "Nft";
	if ("Markdown" in content) return "Markdown";
	return "Shelf";
}

export function getItemContentValue(content: { Nft?: string; Markdown?: string; Shelf?: string }): string {
	if ("Nft" in content) return content.Nft!;
	if ("Markdown" in content) return content.Markdown!;
	return content.Shelf!;
}
