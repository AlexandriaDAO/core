import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import usePerpetua from "@/hooks/actors/usePerpetua";
import { valoraKeys } from "../types";
import { normalizeShelf, unwrapResult, getHourlySeed } from "../utils";

const PAGE_LIMIT = 20n;

export function useRecentFeed() {
	const { actor } = usePerpetua();

	return useInfiniteQuery({
		queryKey: valoraKeys.recentFeed(),
		queryFn: async ({ pageParam }) => {
			const cursor: [] | [bigint] = pageParam ? [BigInt(pageParam)] : [];
			const result = await actor!.get_recent_shelves({ cursor, limit: PAGE_LIMIT });
			const data = unwrapResult(result);
			return {
				shelves: data.items.map(normalizeShelf),
				nextCursor: data.next_cursor[0]?.toString(),
			};
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: !!actor,
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});
}

export function useRandomFeed() {
	const { actor } = usePerpetua();
	const seed = getHourlySeed();

	return useQuery({
		queryKey: valoraKeys.randomFeed(seed.toString()),
		queryFn: async () => {
			const result = await actor!.get_shuffled_by_hour_feed(seed);
			return unwrapResult(result).map(normalizeShelf);
		},
		enabled: !!actor,
		staleTime: 60 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}

export function useStorylineFeed() {
	const { actor } = usePerpetua();

	return useInfiniteQuery({
		queryKey: valoraKeys.storylineFeed(),
		queryFn: async ({ pageParam }) => {
			const cursor: [] | [bigint] = pageParam ? [BigInt(pageParam)] : [];
			const result = await actor!.get_storyline_feed({ cursor, limit: PAGE_LIMIT });
			const data = unwrapResult(result);
			return {
				shelves: data.items.map(normalizeShelf),
				nextCursor: data.next_cursor[0]?.toString(),
			};
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: !!actor,
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});
}
