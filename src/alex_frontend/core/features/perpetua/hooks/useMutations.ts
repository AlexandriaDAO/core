import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Principal } from "@dfinity/principal";
import usePerpetua from "@/hooks/actors/usePerpetua";
import { perpetuaKeys } from "../types";
import type { Shelf } from "../types";
import { unwrapResult } from "../utils";
import type { ItemContent } from "../../../../../declarations/perpetua/perpetua.did";

export function useCreateShelf() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ title, description, tags }: {
			title: string;
			description?: string;
			tags?: string[];
		}) => {
			const desc: [] | [string] = description ? [description] : [];
			const tagList: [] | [string[]] = tags ? [tags] : [];
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.store_shelf(title, desc, [], tagList);
			return unwrapResult(result);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.shelves() });
			qc.invalidateQueries({ queryKey: perpetuaKeys.recentFeed() });
		},
	});
}

export function useUpdateShelfMetadata() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ shelfId, title, description }: {
			shelfId: string;
			title?: string;
			description?: string;
		}) => {
			const t: [] | [string] = title ? [title] : [];
			const d: [] | [string] = description !== undefined ? [description] : [];
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.update_shelf_metadata(shelfId, t, d);
			return unwrapResult(result);
		},
		onMutate: async ({ shelfId, title, description }) => {
			await qc.cancelQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
			const prev = qc.getQueryData<Shelf>(perpetuaKeys.shelf(shelfId));
			if (prev) {
				qc.setQueryData<Shelf>(perpetuaKeys.shelf(shelfId), {
					...prev,
					...(title !== undefined && { title }),
					...(description !== undefined && { description: description || null }),
				});
			}
			return { prev };
		},
		onError: (_, { shelfId }, ctx) => {
			if (ctx?.prev) qc.setQueryData(perpetuaKeys.shelf(shelfId), ctx.prev);
		},
		onSettled: (_, __, { shelfId }) => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
		},
	});
}

export function useAddItem() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ shelfId, content, referenceItemId, before = false }: {
			shelfId: string;
			content: ItemContent;
			referenceItemId?: number;
			before?: boolean;
		}) => {
			const ref: [] | [number] = referenceItemId !== undefined ? [referenceItemId] : [];
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.add_item_to_shelf(shelfId, { content, reference_item_id: ref, before });
			return unwrapResult(result);
		},
		onSuccess: (_, { shelfId }) => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
			qc.invalidateQueries({ queryKey: perpetuaKeys.recentFeed() });
		},
	});
}

export function useRemoveItem() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ shelfId, itemId }: { shelfId: string; itemId: number }) => {
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.remove_item_from_shelf(shelfId, itemId);
			return unwrapResult(result);
		},
		onMutate: async ({ shelfId, itemId }) => {
			await qc.cancelQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
			const prev = qc.getQueryData<Shelf>(perpetuaKeys.shelf(shelfId));
			if (prev) {
				qc.setQueryData<Shelf>(perpetuaKeys.shelf(shelfId), {
					...prev,
					items: prev.items.filter(([, item]) => item.id !== itemId),
				});
			}
			return { prev };
		},
		onError: (_, { shelfId }, ctx) => {
			if (ctx?.prev) qc.setQueryData(perpetuaKeys.shelf(shelfId), ctx.prev);
		},
		onSettled: (_, __, { shelfId }) => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
		},
	});
}

export function useSetItemOrder() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ shelfId, itemIds }: { shelfId: string; itemIds: number[] }) => {
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.set_item_order(shelfId, itemIds);
			return unwrapResult(result);
		},
		onSuccess: (_, { shelfId }) => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
		},
	});
}

export function useReorderProfileShelf() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ shelfId, referenceShelfId, before }: {
			shelfId: string;
			referenceShelfId?: string;
			before: boolean;
		}) => {
			const ref: [] | [string] = referenceShelfId ? [referenceShelfId] : [];
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.reorder_profile_shelf(shelfId, ref, before);
			return unwrapResult(result);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.shelves() });
		},
	});
}

export function useTogglePublicAccess() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ shelfId, publicEditing }: { shelfId: string; publicEditing: boolean }) => {
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.toggle_shelf_public_access(shelfId, publicEditing);
			unwrapResult(result);
		},
		onMutate: async ({ shelfId, publicEditing }) => {
			await qc.cancelQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
			const prev = qc.getQueryData<Shelf>(perpetuaKeys.shelf(shelfId));
			if (prev) {
				qc.setQueryData<Shelf>(perpetuaKeys.shelf(shelfId), { ...prev, publicEditing });
			}
			return { prev };
		},
		onError: (_, { shelfId }, ctx) => {
			if (ctx?.prev) qc.setQueryData(perpetuaKeys.shelf(shelfId), ctx.prev);
		},
		onSettled: (_, __, { shelfId }) => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
		},
	});
}

export function useAddTag() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ shelfId, tag }: { shelfId: string; tag: string }) => {
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.add_tag_to_shelf({ shelf_id: shelfId, tag });
			unwrapResult(result);
		},
		onMutate: async ({ shelfId, tag }) => {
			await qc.cancelQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
			const prev = qc.getQueryData<Shelf>(perpetuaKeys.shelf(shelfId));
			if (prev && !prev.tags.includes(tag)) {
				qc.setQueryData<Shelf>(perpetuaKeys.shelf(shelfId), {
					...prev,
					tags: [...prev.tags, tag],
				});
			}
			return { prev };
		},
		onError: (_, { shelfId }, ctx) => {
			if (ctx?.prev) qc.setQueryData(perpetuaKeys.shelf(shelfId), ctx.prev);
		},
		onSettled: (_, __, { shelfId }) => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
			qc.invalidateQueries({ queryKey: perpetuaKeys.popularTags() });
		},
	});
}

export function useRemoveTag() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ shelfId, tag }: { shelfId: string; tag: string }) => {
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.remove_tag_from_shelf({ shelf_id: shelfId, tag });
			unwrapResult(result);
		},
		onMutate: async ({ shelfId, tag }) => {
			await qc.cancelQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
			const prev = qc.getQueryData<Shelf>(perpetuaKeys.shelf(shelfId));
			if (prev) {
				qc.setQueryData<Shelf>(perpetuaKeys.shelf(shelfId), {
					...prev,
					tags: prev.tags.filter((t) => t !== tag),
				});
			}
			return { prev };
		},
		onError: (_, { shelfId }, ctx) => {
			if (ctx?.prev) qc.setQueryData(perpetuaKeys.shelf(shelfId), ctx.prev);
		},
		onSettled: (_, __, { shelfId }) => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.shelf(shelfId) });
			qc.invalidateQueries({ queryKey: perpetuaKeys.popularTags() });
		},
	});
}

export function useFollowTag() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (tag: string) => {
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.follow_tag(tag);
			unwrapResult(result);
		},
		onMutate: async (tag) => {
			await qc.cancelQueries({ queryKey: perpetuaKeys.followedTags() });
			const prev = qc.getQueryData<string[]>(perpetuaKeys.followedTags());
			if (prev && !prev.includes(tag)) {
				qc.setQueryData<string[]>(perpetuaKeys.followedTags(), [...prev, tag]);
			}
			return { prev };
		},
		onError: (_, __, ctx) => {
			if (ctx?.prev) qc.setQueryData(perpetuaKeys.followedTags(), ctx.prev);
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.followedTags() });
		},
	});
}

export function useUnfollowTag() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (tag: string) => {
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.unfollow_tag(tag);
			unwrapResult(result);
		},
		onMutate: async (tag) => {
			await qc.cancelQueries({ queryKey: perpetuaKeys.followedTags() });
			const prev = qc.getQueryData<string[]>(perpetuaKeys.followedTags());
			if (prev) {
				qc.setQueryData<string[]>(perpetuaKeys.followedTags(), prev.filter((t) => t !== tag));
			}
			return { prev };
		},
		onError: (_, __, ctx) => {
			if (ctx?.prev) qc.setQueryData(perpetuaKeys.followedTags(), ctx.prev);
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.followedTags() });
		},
	});
}

export function useFollowUser() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (principalStr: string) => {
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.follow_user(Principal.fromText(principalStr));
			unwrapResult(result);
		},
		onMutate: async (principalStr) => {
			await qc.cancelQueries({ queryKey: perpetuaKeys.followedUsers() });
			const prev = qc.getQueryData<string[]>(perpetuaKeys.followedUsers());
			if (prev && !prev.includes(principalStr)) {
				qc.setQueryData<string[]>(perpetuaKeys.followedUsers(), [...prev, principalStr]);
			}
			return { prev };
		},
		onError: (_, __, ctx) => {
			if (ctx?.prev) qc.setQueryData(perpetuaKeys.followedUsers(), ctx.prev);
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.followedUsers() });
		},
	});
}

export function useUnfollowUser() {
	const { actor } = usePerpetua();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (principalStr: string) => {
			if (!actor) throw new Error("Not authenticated");
			const result = await actor.unfollow_user(Principal.fromText(principalStr));
			unwrapResult(result);
		},
		onMutate: async (principalStr) => {
			await qc.cancelQueries({ queryKey: perpetuaKeys.followedUsers() });
			const prev = qc.getQueryData<string[]>(perpetuaKeys.followedUsers());
			if (prev) {
				qc.setQueryData<string[]>(perpetuaKeys.followedUsers(), prev.filter((u) => u !== principalStr));
			}
			return { prev };
		},
		onError: (_, __, ctx) => {
			if (ctx?.prev) qc.setQueryData(perpetuaKeys.followedUsers(), ctx.prev);
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: perpetuaKeys.followedUsers() });
		},
	});
}
