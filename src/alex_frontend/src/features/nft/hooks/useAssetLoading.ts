import { useState, useEffect, useCallback } from 'react';
import { UseAssetLoadingReturn } from '../types/assetTypes';

// Unified asset loading hook - provides consistent state management for all asset types
const useAssetLoading = (url: string): UseAssetLoadingReturn => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [ready, setReady] = useState(false);

	// Reset function to start loading again
	const reset = useCallback(() => {
		setLoading(true);
		setError(null);
		setReady(false);
	}, []);

	// Reset state when URL changes
	useEffect(() => {
		if (url) reset();
	}, [url, reset]);

	return {
		loading,
		error,
		ready,
		setLoading,
		setError,
		setReady,
		reset,
	};
};

export default useAssetLoading;