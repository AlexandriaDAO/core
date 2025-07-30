import { Principal } from "@dfinity/principal";
import { ArweaveNft } from "../../../../declarations/emporium/emporium.did";

export const MARKETPLACE_LBRY_FEE = 20; // MarketPlace fee frontend

export interface MarketplaceFilters {
	page: number;
	pageSize: number;
	sortBy: "Price" | "Time";
	sortOrder: "Asc" | "Desc";
	selectedUser?: Principal;
	searchTerm?: string;
}

export interface TransformedNft {
	arweave_id: string;
	token_id: bigint;
	owner: string;
	price: string;
	time: number;
	status: ArweaveNft['status'];
}

export interface TransformedListingsResponse {
	nfts: TransformedNft[];
	total_count: number;
	page: number;
	page_size: number;
	total_pages: number;
	has_next: boolean;
	has_prev: boolean;
}