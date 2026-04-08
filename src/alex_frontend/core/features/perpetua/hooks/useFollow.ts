import { useQuery } from "@tanstack/react-query";
import usePerpetua from "@/hooks/actors/usePerpetua";
import { perpetuaKeys } from "../types";
import { unwrapResult } from "../utils";

export function useFollowedTags() {
	const { actor } = usePerpetua();

	return useQuery({
		queryKey: perpetuaKeys.followedTags(),
		queryFn: async () => {
			const result = await actor!.get_my_followed_tags();
			return unwrapResult(result);
		},
		enabled: !!actor,
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});
}

export function useFollowedUsers() {
	const { actor } = usePerpetua();

	return useQuery({
		queryKey: perpetuaKeys.followedUsers(),
		queryFn: async () => {
			const result = await actor!.get_my_followed_users();
			return unwrapResult(result).map((p) => p.toString());
		},
		enabled: !!actor,
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});
}
