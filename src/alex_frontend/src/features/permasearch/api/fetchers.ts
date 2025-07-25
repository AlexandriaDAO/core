import { SearchResponse, SearchParams } from "../types";
import { fetchByQuery } from "./query-fetcher";
import { fetchByFilters } from "./filter-fetcher";

export async function fetchSearchResults({
	query,
	filters,
	sortOrder,
	cursor,
	actor,
	signal,
}: SearchParams & {
	signal?: AbortSignal;
}): Promise<SearchResponse> {
	if (query) {
		return fetchByQuery({ query, sortOrder, cursor, actor, signal });
	} else {
		return fetchByFilters({ filters, sortOrder, cursor, actor, signal });
	}
}