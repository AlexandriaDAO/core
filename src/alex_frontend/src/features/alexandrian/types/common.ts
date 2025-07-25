export type TokenType = "NFT" | "SBT";

export interface MinimalToken {
	id: string;
	collection: TokenType;
	synced?: boolean;
}

export const PAGE_SIZE_OPTIONS = [16, 32, 48, 64];