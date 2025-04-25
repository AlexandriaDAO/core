export interface NftsState {
	// arweave ids
	ids: string[];

	// list nft for sell
	listing: boolean;
	listingError: string | null;

	loading: boolean;
	error: string | null;
}

export interface Transaction {
	id: string;
	owner: string;
	tags: { name: string; value: string }[];
	block?: {
		height: number;
		timestamp: number;
	};
	data?: {
		size: number;
		type: string;
	};
	assetUrl?: string;
	cursor?: string;
}