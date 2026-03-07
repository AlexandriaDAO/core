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

export const valoraKeys = {
	all: ["valora"] as const,
	shelves: () => [...valoraKeys.all, "shelves"] as const,
	shelf: (id: string) => [...valoraKeys.all, "shelf", id] as const,
	shelfItems: (id: string) => [...valoraKeys.all, "shelf-items", id] as const,
	userShelves: (principal: string) => [...valoraKeys.all, "user-shelves", principal] as const,
	recentFeed: () => [...valoraKeys.all, "recent-feed"] as const,
	randomFeed: (seed: string) => [...valoraKeys.all, "random-feed", seed] as const,
	storylineFeed: () => [...valoraKeys.all, "storyline-feed"] as const,
	popularTags: () => [...valoraKeys.all, "popular-tags"] as const,
	shelvesByTag: (tag: string) => [...valoraKeys.all, "shelves-by-tag", tag] as const,
	tagSearch: (prefix: string) => [...valoraKeys.all, "tag-search", prefix] as const,
	tagCount: (tag: string) => [...valoraKeys.all, "tag-count", tag] as const,
	followedTags: () => [...valoraKeys.all, "followed-tags"] as const,
	followedUsers: () => [...valoraKeys.all, "followed-users"] as const,
	shelfPublic: (id: string) => [...valoraKeys.all, "shelf-public", id] as const,
	nftArweaveId: (tokenId: string) => [...valoraKeys.all, "nft-arweave-id", tokenId] as const,
};
