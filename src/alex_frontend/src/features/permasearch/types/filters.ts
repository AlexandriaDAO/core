export interface DateRange {
	from?: string;
	to?: string;
}


export interface Filters {
	types: string[];
	categories: string[];
	dateRange: DateRange;
	datePreset: string;
	customType: string;
	tags: Array<{ name: string; value: string }>;
}

export interface SearchState {
	query: string;
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

