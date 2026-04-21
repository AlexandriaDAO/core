import { useQuery } from "@tanstack/react-query";
import usePerpetua from "@/hooks/actors/usePerpetua";
import { perpetuaKeys } from "../types";
import { normalizeShelf, unwrapResult } from "../utils";

export function useShelf(shelfId: string | undefined) {
	const { actor } = usePerpetua();

	return useQuery({
		queryKey: perpetuaKeys.shelf(shelfId ?? ""),
		queryFn: async () => {
			const result = await actor!.get_shelf(shelfId!);
			return normalizeShelf(unwrapResult(result));
		},
		enabled: !!actor && !!shelfId,
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});
}
