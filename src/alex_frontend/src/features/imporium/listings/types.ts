export interface ListingItem {
	tokenId: string;
	arweaveId: string;
	price: string;
	owner: string;
}

export type Listing = Record<string, ListingItem>;

export interface ListingsState {
	// arweave ids
	nfts: Listing;

	// search results
	found: Listing;

	// current page
	page: number;

	// total pages
	pages: number | null;

	// number of items per page
	size: number;

	// sort by price
	sortByPrice: boolean | null;

	// sort by time
	sortByTime: boolean | null;

	// unlisting
	unlisting: boolean;
	unlistingError: string | null;

	// purchasing
	purchasing: boolean;
	purchasingError: string | null;

	// editing
	editing: boolean;
	editingError: string | null;

	// loading
	loading: boolean;

	// error
	error: string | null;
}
