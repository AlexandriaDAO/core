import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useShelf } from "./useShelf";

export function useCanEdit(shelfId: string | undefined) {
	const user = useAppSelector((state) => state.auth.user);
	const { data: shelf } = useShelf(shelfId);

	const isOwner = !!user?.principal && !!shelf && shelf.owner === user.principal;
	const canEdit = isOwner || (shelf?.publicEditing ?? false);

	return { isOwner, canEdit, isPublic: shelf?.publicEditing ?? false };
}
