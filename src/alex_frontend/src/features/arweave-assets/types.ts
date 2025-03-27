export interface ArweaveAssetItem {
	id: string; // Arweave transaction ID
	url?: string; // URL to view the asset
	contentType?: string;
	size?: number;
	owner?: string; // Owner address
	timestamp?: number; // Creation timestamp
	tags?: Array<{ name: string; value: string }>;
}

export interface ArweaveAssetsState {
	assets: ArweaveAssetItem[];

	selected: ArweaveAssetItem | null;

	pulling: string | null;
	pullError: string | null;

	deleting: string | null;
	deleteError: string | null;

	loading: boolean;
	error: string | null;
}
