import { useQuery } from '@tanstack/react-query';

// Extract fetching logic into separate function
const fetchPartialText = async (url: string, maxBytes: number, signal?: AbortSignal) => {
	const headers = new Headers();
	headers.append('Range', `bytes=0-${maxBytes - 1}`);

	// Use Range header to get only first portion
	const response = await fetch(url, { headers, signal });

	if (!response.ok) throw new Error(`Failed to fetch partial data: ${response.status}`);

	// Get the response as text
	const text = await response.text();

	// Better way to detect if content is actually truncated:
	// Check if the returned content length equals our requested maxBytes
	const actuallyTruncated = text.length >= maxBytes;

	return {
		data: text,
		partial: actuallyTruncated
	};
};

const usePartialData = (url: string, maxBytes: number = 500) => {
	const { data, error, isLoading } = useQuery({
		queryKey: ['partial-text', url, maxBytes],
		queryFn: ({ signal }) => fetchPartialText(url, maxBytes, signal),
		enabled: !!url,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 1,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return {
		data: data?.data || null,
		fetching: isLoading,
		fetchError: error?.message || null,
		partial: data?.partial || false
	};
};

export default usePartialData;