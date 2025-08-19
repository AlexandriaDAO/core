export interface DateRange {
	from?: string;
	to?: string;
}

export interface Filters {
	types: string[];
	categories: string[];
	range: number; // Block range ± from target block (default 500)
	customType: string;
	tags: Array<{ name: string; value: string }>;
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

