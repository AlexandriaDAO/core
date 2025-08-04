import { useMemo, useState, useEffect } from "react";
import {
	useSearchQuery,
	useUpdateTransactionMutation,
	useInvalidateSearchQuery,
	SEARCH_QUERY_KEY,
} from "../api/queries";
import { Transaction } from "../types/index";
import { useNftManager } from "@/hooks/actors";
import { checkMintedStatus } from "../api/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface UseSearchReturn {
	transactions: Transaction[];
	isLoading: boolean;
	isLoadingMore: boolean;
	isRefreshing: boolean;
	isLoadingMintStatus: boolean;
	error: Error | null;
	hasNextPage: boolean;
	isEmpty: boolean;
	loadMore: () => void;
	refresh: () => Promise<void>;
	updateTransactionMinted: (transactionId: string) => void;
}

export function useSearch(): UseSearchReturn {
	const {actor} = useNftManager();
	const { query, appliedFilters, sortOrder } = useAppSelector(state => state.permasearch);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingMintStatus, setIsLoadingMintStatus] = useState(false);
	const queryClient = useQueryClient();

	const {data, isLoading, isFetchingNextPage, error, hasNextPage, fetchNextPage, refetch } = useSearchQuery({ query, filters: appliedFilters, sortOrder, actor });

	const updateMutation = useUpdateTransactionMutation();
	const invalidateQueries = useInvalidateSearchQuery();

	const transactions = useMemo(() => {
		if (!data?.pages) return [];
		return data.pages.flatMap((page) => page.transactions);
	}, [data?.pages]);

	// Check mint status when actor becomes available for existing transactions
	useEffect(() => {
		if (!actor || transactions.length === 0 || isLoadingMintStatus) return;

		// Find transactions with undefined minted status
		const transactionsNeedingCheck = transactions.filter(tx => tx.minted === undefined);
		if (transactionsNeedingCheck.length === 0) return;

		const updateMintStatus = async () => {
			setIsLoadingMintStatus(true);
			try {
				const updatedTransactions = await checkMintedStatus(transactionsNeedingCheck, actor);

				// Only update cache if we still have the same actor (user didn't log out)
				if (!actor) return;

				// Update the search query cache - only update transactions that don't already have minted: true
				queryClient.setQueriesData(
					{ queryKey: [SEARCH_QUERY_KEY] },
					(oldData: any) => {
						if (!oldData) return oldData;

						return {
							...oldData,
							pages: oldData.pages.map((page: any) => ({
								...page,
								transactions: page.transactions.map((tx: Transaction) => {
									// Don't overwrite transactions that are already minted: true
									if (tx.minted === true) return tx;

									const updatedTx = updatedTransactions.find(updated => updated.id === tx.id);
									return updatedTx || tx;
								})
							}))
						};
					}
				);
			} catch (error) {
				console.warn("Failed to check mint status:", error);
			} finally {
				setIsLoadingMintStatus(false);
			}
		};

		updateMintStatus();
	}, [actor, transactions, queryClient, isLoadingMintStatus]);

	const isEmpty = !isLoading && transactions.length === 0;

	const loadMore = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	const refresh = async () => {
		setIsRefreshing(true);
		try {
			invalidateQueries();
			await refetch();
		} finally {
			setIsRefreshing(false);
		}
	};

	const updateTransactionMinted = (transactionId: string) => {
		updateMutation.mutate({ transactionId });
	};

	return {
		transactions,
		isLoading,
		isLoadingMore: isFetchingNextPage,
		isRefreshing,
		isLoadingMintStatus,
		error,
		hasNextPage: !!hasNextPage,
		isEmpty,
		loadMore,
		refresh,
		updateTransactionMinted,
	};
}