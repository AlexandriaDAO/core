import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { reset } from "@/features/pinax/pinaxSlice";

export function useCleanupEffect() {
	const dispatch = useAppDispatch();

	useEffect(() => () => {
		dispatch(reset());
	}, []);
}