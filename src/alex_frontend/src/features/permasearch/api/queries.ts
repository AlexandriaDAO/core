import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
	InfiniteData,
} from "@tanstack/react-query";
import { fetchSearchResults } from "./fetchers";
import { SearchResponse, SearchParams } from "../types/index";

export const SEARCH_QUERY_KEY = "permasearch";

export function useSearchQuery({
	query,
	filters,
	sortOrder,
	actor,
}: SearchParams) {
	return useInfiniteQuery<SearchResponse, Error>({
		queryKey: [SEARCH_QUERY_KEY, { query, filters, sortOrder }],
		queryFn: ({ pageParam = null, signal }) =>
			fetchSearchResults({
				query,
				filters,
				sortOrder,
				cursor: pageParam as string | undefined,
				actor,
				signal,
			}),
		getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.cursor : undefined,
		initialPageParam: null,
		// enabled: !!actor,
		gcTime: 10 * 60 * 1000, // 10 minutes
		staleTime: 3 * 60 * 1000, // 3 minutes
	});
}

export function useUpdateTransactionMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ transactionId }: { transactionId: string }) => {
			// This is just updating the cache, no actual API call needed
			return { transactionId };
		},
		onSuccess: ({ transactionId }) => {
			queryClient.setQueriesData<InfiniteData<SearchResponse>>(
				{ queryKey: [SEARCH_QUERY_KEY] },
				(oldData) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						pages: oldData.pages.map((page) => ({...page, transactions: page.transactions.map((tx: any) => tx.id === transactionId ? { ...tx, minted: true }: tx) })),
					};
				}
			);
		},
	});
}

export function useInvalidateSearchQuery() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: [SEARCH_QUERY_KEY] });
	};
}
