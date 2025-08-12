import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import LedgerService from "@/utils/LedgerService";
import {
	ListingsResponse,
	ListingsQuery,
	ArweaveNft,
} from "../../../../../declarations/emporium/emporium.did";
import { emporium } from "../../../../../declarations/emporium";
import { TransformedNft, TransformedListingsResponse } from "../types";

// Main hook for marketplace listings
export const useListing = () => {
	const queryClient = useQueryClient();

	// Get filters from Redux store
	const filters = useAppSelector((state) => ({
		page: state.marketplace.page,
		pageSize: state.marketplace.pageSize,
		sortBy: state.marketplace.sortBy,
		sortOrder: state.marketplace.sortOrder,
		selectedUser: state.marketplace.selectedUser,
		searchTerm: state.marketplace.searchTerm,
	}));

	const queryKey = useMemo(
		() => [
			"marketplace-listings",
			filters.page,
			filters.pageSize,
			filters.sortBy,
			filters.sortOrder,
			filters.selectedUser?.toString(),
			filters.searchTerm,
		],
		[filters]
	);

	const { data, isLoading, error, refetch, isFetching, isRefetching } = useQuery({
		queryKey,
		queryFn: (): Promise<ListingsResponse> => {
			const query: ListingsQuery = {
				page: BigInt(filters.page),
				page_size: BigInt(filters.pageSize),
				sort_by:
					filters.sortBy === "Price"
						? { Price: null }
						: { Time: null },
				sort_order:
					filters.sortOrder === "Asc"
						? { Asc: null }
						: { Desc: null },
				selected_user: filters.selectedUser
					? [filters.selectedUser]
					: [],
				search_term: filters.searchTerm ? [filters.searchTerm] : [],
			};
			return emporium.get_listings(query);
		},
		select: (data: ListingsResponse): TransformedListingsResponse => ({
			...data,
			nfts: data.nfts.map(
				(nft: ArweaveNft): TransformedNft => ({
					...nft,
					price: LedgerService().e8sToIcp(nft.price).toString(),
					owner: nft.owner.toString(),
					time: Number(nft.time),
				})
			),
			total_count: Number(data.total_count),
			page: Number(data.page),
			page_size: Number(data.page_size),
			total_pages: Number(data.total_pages),
		}),
		staleTime: 30 * 1000,
		gcTime: 5 * 60 * 1000,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	const refresh = useCallback(async () => {
		try {
			// // If currently fetching or refetching, cancel the requests
			// if (isRefetching || isFetching) {
			// 	// Cancel marketplace listing queries
			// 	await queryClient.cancelQueries({
			// 		queryKey: queryKey
			// 	});

			// 	return; // Don't start a new request
			// }

			// If not currently fetching, start a new refetch
			await queryClient.invalidateQueries({
				queryKey: ["marketplace-listings"],
				exact: false,
			});
			return refetch();
		} catch (error) {
			console.log('marketplace refetch error', error);
		}
	}, [queryClient, refetch, isRefetching, isFetching, queryKey]);

	return {
		data,
		isLoading,
		isFetching,
		error: error?.message || null,
		refresh,
		isEmpty: !data || data.nfts.length === 0,
		hasData: !!(data && data.nfts.length > 0),
	};
};
