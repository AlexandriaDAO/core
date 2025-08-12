import { useMemo } from "react";
import { SEARCH_QUERY_KEY, SearchResponse, Transaction } from "../types/index";
import { useNftManager } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSearchResults } from "../api/fetchers";

interface UseSearchReturn {
	transactions: Transaction[];
	isLoading: boolean;
	isLoadingMore: boolean;
	isRefreshing: boolean;
	error: Error | null;
	hasNextPage: boolean;
	isEmpty: boolean;
	loadMore: () => void;
	refresh: () => Promise<void>;
}

export function useSearch(): UseSearchReturn {
	const {actor} = useNftManager();
	const { query, appliedFilters, sortOrder, randomDate } = useAppSelector(state => state.permasearch);
	const queryClient = useQueryClient();

	const {data, isLoading, isRefetching, isFetchingNextPage, error, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery<SearchResponse, Error>({
		queryKey: [SEARCH_QUERY_KEY, { query, appliedFilters, sortOrder, randomDate }],
		queryFn: ({ pageParam = null, signal }) =>
			fetchSearchResults({
				query,
				filters: appliedFilters,
				sortOrder,
				randomDate,
				cursor: pageParam as string | undefined,
				actor,
				signal,
			}),
        placeholderData: (previousData) => previousData,
		getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.cursor : undefined,
		initialPageParam: null,
		gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time, when user navigates away and query becomes inactive
		staleTime: 30 * 60 * 1000, // 30 minutes - increased to reduce auto-refetches
		refetchOnWindowFocus: false, // Prevent refetch on window focus
		refetchOnReconnect: false, // Prevent refetch on reconnect
	});

	const transactions = useMemo(() => {
		if (!data?.pages) return [];
		return data.pages.flatMap((page) => page.transactions);
	}, [data?.pages]);

	const loadMore = () => {
		if(!hasNextPage) return;
		if(isFetchingNextPage) return;

		fetchNextPage();
	};

	const refresh = async () => {
		try {
			// If currently fetching or refetching, cancel the requests
			if (isRefetching || isFetchingNextPage) {
				// Cancel search queries
				await queryClient.cancelQueries({
					queryKey: [SEARCH_QUERY_KEY, { query, appliedFilters, sortOrder }]
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
		transactions, isLoading, error,
		isLoadingMore: isFetchingNextPage,
		isRefreshing: isRefetching,
		hasNextPage: !!hasNextPage,
		isEmpty: !isLoading && transactions.length === 0,
		loadMore, refresh,
	};
}