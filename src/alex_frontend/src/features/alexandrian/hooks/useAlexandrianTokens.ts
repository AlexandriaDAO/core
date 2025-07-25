import { createTokenFetcher } from "../api/createTokenFetcher";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	UseAlexandrianTokensParams,
	UseAlexandrianTokensReturn,
} from "../types";

const useAlexandrianTokens = ({
	collectionType,
	user = null,
	page = 0,
	pageSize = 10,
	sortOrder = "newest",
	sortBy = "default",
	currentUserPrincipal,
}: UseAlexandrianTokensParams): UseAlexandrianTokensReturn => {
	// Create the query key - this is what TanStack Query uses to identify unique requests
	// When this key changes, TanStack Query will trigger a new request
	const queryKey = [
		"alexandrian-tokens",
		collectionType,
		user || "all",
		page,
		pageSize,
		sortOrder,
		sortBy,
		currentUserPrincipal, // Include for ownership updates
	];

	// Create the fetcher function with the current actor and user
	const fetcher = createTokenFetcher(currentUserPrincipal);

	// Use TanStack Query with automatic cancellation support
	const { data, error, isPending, isLoading, isFetching, refetch } = useQuery(
		{
			queryKey,
			queryFn: async ({ signal }) => {
				// TanStack Query automatically provides AbortSignal for cancellation
				const params = {
					collectionType,
					user,
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

	// Create query client for cache mutations
	const queryClient = useQueryClient();

	// Optimistic update mutation for token ownership (similar to PermaFind)
	const updateOwnershipMutation = useMutation({
		mutationFn: async ({ tokenId }: { tokenId: string }) => {
			// This is just updating the cache, no actual API call needed
			return { tokenId };
		},
		onSuccess: ({ tokenId }) => {
			// Update the cache for this specific query
			queryClient.setQueryData(queryKey, (oldData: any) => {
				if (!oldData) return oldData;

				return {
					...oldData,
					tokens: {
						...oldData.tokens,
						[tokenId]: {
							...oldData.tokens[tokenId],
							owned: true,
						},
					},
				};
			});
		},
	});

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
		refresh: () => refetch(), // Force refresh the data
		updateTokenOwnership: (tokenId: string) => {
			updateOwnershipMutation.mutate({ tokenId });
		},
	};
};

export default useAlexandrianTokens;
