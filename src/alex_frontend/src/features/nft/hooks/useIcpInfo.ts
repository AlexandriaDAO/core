import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchIcpInfo } from "@/features/alexandrian/api/fetchIcpInfo";
import { AlexandrianToken} from "@/features/alexandrian/types";

export const useIcpInfo = (token: AlexandrianToken) => {
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery({
		queryKey: ['icpInfo', token.id, token.collection],
		queryFn: () => fetchIcpInfo(token.id, token.collection),
		enabled: !!token.id && !!token.collection,
	});

	const invalidateQuery = () => {
		queryClient.invalidateQueries({
			queryKey: ['icpInfo', token.id, token.collection]
		});
	};

	return {
		data,
		isLoading,
		error,
		invalidateQuery,
	};
};