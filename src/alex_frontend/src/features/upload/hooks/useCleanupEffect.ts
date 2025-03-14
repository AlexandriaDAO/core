import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { reset } from "@/features/upload/uploadSlice";

export function useCleanupEffect() {
	const dispatch = useAppDispatch();

	useEffect(() => () => {
		dispatch(reset());
	}, []);
}