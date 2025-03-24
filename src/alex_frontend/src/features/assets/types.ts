export interface AssetItem {
	id: string; // Arweave transaction ID
	url?: string; // URL to view the asset
	contentType?: string;
	size?: number;
	owner?: string; // Owner address
	timestamp?: number; // Creation timestamp
	tags?: Array<{ name: string; value: string }>;
}

export interface AssetsState {
	assets: AssetItem[];
	loading: boolean;
	error: string | null;
	selectedAsset: AssetItem | null;
}
