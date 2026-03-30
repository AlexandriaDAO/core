import { useQuery } from "@tanstack/react-query";
import { Principal } from "@dfinity/principal";
import usePerpetua from "@/hooks/actors/usePerpetua";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { valoraKeys } from "../types";
import { normalizeShelf, unwrapResult } from "../utils";

const DEFAULT_LIMIT = 20n;

export function useUserShelves(principalStr: string | undefined) {
	const { actor } = usePerpetua();

	return useQuery({
		queryKey: valoraKeys.userShelves(principalStr ?? ""),
		queryFn: async () => {
			const principal = Principal.fromText(principalStr!);
			const result = await actor!.get_user_shelves(principal, { offset: 0n, limit: DEFAULT_LIMIT });
			return unwrapResult(result).items.map(normalizeShelf);
		},
		enabled: !!actor && !!principalStr,
		staleTime: 30_000,
		refetchOnWindowFocus: false,
	});
}

export function useMyShelves() {
	const user = useAppSelector((state) => state.auth.user);
	return useUserShelves(user?.principal);
}
