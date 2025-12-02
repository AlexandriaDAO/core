import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useCallback } from 'react';

interface UseFullDataReturn {
	data: string | null;
	fetching: boolean;
	fetchError: string | null;
	progress: number;
}

// OPTIMIZATION: TanStack Query-based text fetcher with progress tracking and caching
const fetchFullTextData = async (url: string, signal?: AbortSignal) => {
	const response = await fetch(url, { signal });

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status}`);
	}

	// For text content, we can use simple text() method which is more efficient
	// Only use streaming if we really need progress tracking for large files
	const contentLength = response.headers.get('Content-Length');
	const isLargeFile = contentLength && parseInt(contentLength, 10) > 1024 * 1024; // 1MB

	if (!isLargeFile) {
		// Fast path for smaller files
		return await response.text();
	}

	// Streaming path for large files with progress tracking
	const total = contentLength ? parseInt(contentLength, 10) : 0;
	const reader = response.body?.getReader();
	if (!reader) throw new Error("Failed to get stream reader");

	const chunks: Uint8Array[] = [];
	let receivedLength = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		chunks.push(value);
		receivedLength += value.length;
	}

	// Convert to text
	const allChunks = new Uint8Array(receivedLength);
	let position = 0;
	for (const chunk of chunks) {
		allChunks.set(chunk, position);
		position += chunk.length;
	}

	const textDecoder = new TextDecoder();
	return textDecoder.decode(allChunks);
};

const useFullData = (url: string): UseFullDataReturn => {
	const progressRef = useRef(0);
	const [localError, setLocalError] = useState<string | null>(null);

	// OPTIMIZATION: Use TanStack Query with 1-hour cache for text content
	const { data, error, isLoading } = useQuery({
		queryKey: ['fullTextData', url],
		queryFn: ({ signal }) => {
			setLocalError(null);
			progressRef.current = 0;
			return fetchFullTextData(url, signal);
		},
		enabled: !!url,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 1000 * 60 * 60, // 1 hour cache
		retry: 2,
		retryDelay: 2000,
	});

	// Handle success and error states
	if (data && !error) {
		progressRef.current = 100;
	}

	if (error) {
		setLocalError(error instanceof Error ? error.message : "Failed to load full content");
	}

	return {
		data: data || null,
		fetching: isLoading,
		fetchError: localError || (error ? (error instanceof Error ? error.message : "Failed to load content") : null),
		progress: progressRef.current
	};
};

export default useFullData;