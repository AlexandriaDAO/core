import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { SEARCH_QUERY_KEY, SearchResponse } from "../types";

export function useUpdate() {
	const queryClient = useQueryClient();

	return (transactionId: string) => {
		queryClient.setQueriesData<InfiniteData<SearchResponse>>( { queryKey: [SEARCH_QUERY_KEY] }, (oldData) => {
			if (!oldData) return oldData;

			return {
				...oldData,
				pages: oldData.pages.map(page => ({
					...page,
					transactions: page.transactions.map(tx => tx.id === transactionId ? { ...tx, minted: true }: tx)
				})),
			};
		});
	};
}