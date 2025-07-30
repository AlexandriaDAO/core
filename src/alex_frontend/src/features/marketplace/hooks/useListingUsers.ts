import { useQuery } from "@tanstack/react-query";
import { emporium } from "../../../../../declarations/emporium";

export const useListingUsers = () => {
	const { data: users, isLoading, error } = useQuery({
		queryKey: ["listing-users"],
		queryFn: () => emporium.get_listing_users(),
		staleTime: 2 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	return {
		users: users || [],
		isLoading,
		error: error?.message || null,
	};
};
