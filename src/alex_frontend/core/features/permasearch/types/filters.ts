import { Tag } from "@/features/nft/types";

export interface IncludePreset {
	value: number | undefined;
	label: string;
	description: string;
	info: string;
}

export interface Filters {
	types: string[];
	categories: string[];
	include: number | undefined;
	customType: string;
	tags: Tag[];
	query: string;
	timestamp: number | undefined; // Unix timestamp in seconds, undefined for no timestamp filtering
}

export interface SearchState {
	filters: Filters;
	appliedFilters: Filters;
	showFilters: boolean;
	expanded: { [key: string]: boolean };
	sortOrder: string;
	safeSearch: boolean;
	continuousScroll: boolean;
}

// Filter processing types for API
export interface TagFilter {
	name: string;
	values: string[];
}

export interface BlockFilter {
	min: number;
	max: number;
}
