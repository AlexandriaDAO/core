export interface Transaction {
	id: string;
	data: {
		size: string;
		type: string;
	};
	tags: Array<{
		name: string;
		value: string;
	}>;
	block: {
		height: number;
		timestamp: number;
	};
	minted?: boolean;
}

export interface SearchResponse {
	transactions: Transaction[];
	hasNext: boolean;
	cursor?: string | null;
}
