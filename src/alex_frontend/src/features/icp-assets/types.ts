export interface IcpAssetItem {
	key: string;
	encodings: Array<{
		modified: number;
		length: number;
		content_encoding: string;
	}>;
	content_type: string;
}

export interface IcpAssetsState {
	assets: IcpAssetItem[];

	uploading: boolean;
	percentage: number;
	uploadError: string | null;

	deleting: IcpAssetItem | null;
	deleteError: string | null;

	loading: boolean;
	error: string | null;
}
