// Shared types for all asset components

export interface AssetLoadingState {
	loading: boolean;
	error: string | null;
	ready: boolean;
}

export interface AssetProps {
	url: string;
}

export interface VideoAssetProps extends AssetProps {
	contentType: string;
}

export interface AudioAssetProps extends AssetProps {
	contentType: string;
}

// NSFW Analysis result
export interface NsfwAnalysisResult {
	isNsfw: boolean;
	analyzing: boolean;
	error?: string;
}

// Common asset loading hook return type
export interface UseAssetLoadingReturn extends AssetLoadingState {
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setReady: (ready: boolean) => void;
	reset: () => void;
}