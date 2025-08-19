import type { ActorSubclass } from "@dfinity/agent";
import type { _SERVICE } from "../../../../../declarations/nft_manager/nft_manager.did";
import { Filters } from "./filters";

export const SEARCH_QUERY_KEY = "permasearch";

export interface SearchParams {
	filters: Filters;
	sortOrder: string;
	actor?: ActorSubclass<_SERVICE>;
	query?: string;
	cursor?: string;
	timestamp?: number;
}

// Canister response types
export interface CanisterMintedResult {
	Ok: boolean[];
}

export interface CanisterErrorResult {
	Err: string;
}

export type CanisterResponse = CanisterMintedResult | CanisterErrorResult;
