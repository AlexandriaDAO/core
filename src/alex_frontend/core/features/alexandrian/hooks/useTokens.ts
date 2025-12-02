import { createTokenFetcher } from "../api/createTokenFetcher";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseAlexandrianTokensReturn } from "../types";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const useTokens = (): UseAlexandrianTokensReturn => {
	const { collectionType, selectedUser, page, pageSize, sortOrder, sortBy } = useAppSelector((state) => state.alexandrian);
	const queryClient = useQueryClient();

	// Create the query key - this is what TanStack Query uses to identify unique requests
	// When this key changes, TanStack Query will trigger a new request
	const queryKey = [
		"alexandrian-tokens",
		collectionType,
		selectedUser || "all",
		page,
		pageSize,
		sortOrder,
		sortBy,
	];

	// Create the fetcher function with the current actor and user
	const fetcher = createTokenFetcher();

	// Use TanStack Query with automatic cancellation support
	const { data, error, isPending, isLoading, isFetching, isRefetching, refetch } = useQuery(
		{
			queryKey,
			queryFn: async ({ signal }) => {
				// TanStack Query automatically provides AbortSignal for cancellation
				const params = {
					collectionType,
					user: selectedUser,
					page,
					pageSize,
					sortOrder,
					sortBy,
				};
				return fetcher(params, signal);
			},
			// enabled: !!actor, // Only run query when actor is available
			// TanStack Query configuration
			refetchOnWindowFocus: false, // Don't refetch when user focuses tab
			refetchOnReconnect: true, // Do refetch when internet reconnects
			staleTime: 30000, // Consider data stale after 30 seconds
			gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after component unmount
			retry: 2, // Retry failed requests 2 times
			retryDelay: (attemptIndex) => {
				// Exponential backoff: 3s, 6s, 12s...
				return Math.min(3000 * Math.pow(2, attemptIndex), 30000);
			},
			placeholderData: (previousData) => previousData, // Keep previous data while loading new data
		}
	);


	const refresh = async () => {
		try {
			// If currently fetching or refetching, cancel the requests
			if (isRefetching || isFetching) {
				// Cancel alexandrian token queries
				await queryClient.cancelQueries({
					queryKey: ["alexandrian-tokens", collectionType, selectedUser || "all", page, pageSize, sortOrder, sortBy]
				});

				return; // Don't start a new request
			}

			// If not currently fetching, start a new refetch
			await refetch();
		}catch(error){
			console.log('refetch error', error)
		}
	};

	return {
		// Data
		tokens: data?.tokens || {},
		totalPages: data?.totalPages || 0,
		totalItems: data?.totalItems || 0,

		// Loading states
		loading: isPending, // True during initial load
		updating: isFetching && !isLoading, // True during background updates

		// Error handling
		error: error?.message || null,

		// Actions
		refresh,
	};
};

export default useTokens;