import { useQueryClient } from "@tanstack/react-query";
import { SEARCH_QUERY_KEY } from "../types";

export function useInvalidate() {
	const queryClient = useQueryClient();

	const invalidate = ()=>{
		queryClient.invalidateQueries({ queryKey: [SEARCH_QUERY_KEY] });
	}

	return invalidate;
}
