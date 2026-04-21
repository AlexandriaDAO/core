import type {
	ShelfPublic,
	Item,
	ItemContent,
	QueryError,
	ShelfPositionMetrics,
} from "../../../../declarations/perpetua/perpetua.did";

export type { ShelfPublic, Item, ItemContent, QueryError, ShelfPositionMetrics };

export interface Shelf {
	shelfId: string;
	title: string;
	description: string | null;
	owner: string;
	createdAt: number;
	updatedAt: number;
	appearsIn: string[];
	tags: string[];
	publicEditing: boolean;
	items: Array<[number, Item]>;
	itemPositions: Array<[number, number]>;
}

export type FeedType = "recency" | "random" | "storyline";
export type ContentType = "Nft" | "Markdown" | "Shelf";

export const perpetuaKeys = {
	all: ["perpetua"] as const,
	shelves: () => [...perpetuaKeys.all, "shelves"] as const,
	shelf: (id: string) => [...perpetuaKeys.all, "shelf", id] as const,
	shelfItems: (id: string) => [...perpetuaKeys.all, "shelf-items", id] as const,
	userShelves: (principal: string) => [...perpetuaKeys.all, "user-shelves", principal] as const,
	recentFeed: () => [...perpetuaKeys.all, "recent-feed"] as const,
	randomFeed: (seed: string) => [...perpetuaKeys.all, "random-feed", seed] as const,
	storylineFeed: () => [...perpetuaKeys.all, "storyline-feed"] as const,
	popularTags: () => [...perpetuaKeys.all, "popular-tags"] as const,
	shelvesByTag: (tag: string) => [...perpetuaKeys.all, "shelves-by-tag", tag] as const,
	tagSearch: (prefix: string) => [...perpetuaKeys.all, "tag-search", prefix] as const,
	tagCount: (tag: string) => [...perpetuaKeys.all, "tag-count", tag] as const,
	followedTags: () => [...perpetuaKeys.all, "followed-tags"] as const,
	followedUsers: () => [...perpetuaKeys.all, "followed-users"] as const,
	shelfPublic: (id: string) => [...perpetuaKeys.all, "shelf-public", id] as const,
	nftArweaveId: (tokenId: string) => [...perpetuaKeys.all, "nft-arweave-id", tokenId] as const,
};
