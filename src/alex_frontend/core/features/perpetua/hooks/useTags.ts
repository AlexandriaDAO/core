import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import usePerpetua from "@/hooks/actors/usePerpetua";
import { perpetuaKeys } from "../types";
import { normalizeShelf, unwrapResult } from "../utils";

export function usePopularTags(limit = 20n) {
	const { actor } = usePerpetua();

	return useQuery({
		queryKey: perpetuaKeys.popularTags(),
		queryFn: async () => {
			const result = await actor!.get_popular_tags({ cursor: [], limit });
			return unwrapResult(result).items;
		},
		enabled: !!actor,
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});
}

export function useShelvesByTag(tag: string | null) {
	const { actor } = usePerpetua();

	return useInfiniteQuery({
		queryKey: perpetuaKeys.shelvesByTag(tag ?? ""),
		queryFn: async ({ pageParam }) => {
			const cursor = pageParam ? [pageParam] : [];
			const result = await actor!.get_shelves_by_tag(tag!, { cursor: cursor as any, limit: 20n });
			const data = unwrapResult(result);
			return {
				shelves: data.items.map(normalizeShelf),
				nextCursor: data.next_cursor.length > 0 ? data.next_cursor[0] : undefined,
			};
		},
		initialPageParam: undefined as any,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: !!actor && !!tag,
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});
}

export function useTagSearch(prefix: string) {
	const { actor } = usePerpetua();

	return useQuery({
		queryKey: perpetuaKeys.tagSearch(prefix),
		queryFn: async () => {
			const result = await actor!.get_tags_with_prefix(prefix, { cursor: [], limit: 10n });
			return unwrapResult(result).items;
		},
		enabled: !!actor && prefix.length >= 1,
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});
}

export function useTagShelfCount(tag: string | null) {
	const { actor } = usePerpetua();

	return useQuery({
		queryKey: perpetuaKeys.tagCount(tag ?? ""),
		queryFn: async () => {
			return Number(await actor!.get_tag_shelf_count(tag!));
		},
		enabled: !!actor && !!tag,
		staleTime: 60_000,
	});
}
