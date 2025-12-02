import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import locked from "@/features/balance/lbry/thunks/locked";
import { useEffect } from "react";

export function useBalanceEffect() {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector(state => state.auth);
	const { minted } = useAppSelector(state => state.pinax);

	useEffect(() => {
		if (!user) return;
		dispatch(locked());
	}, [user])

	useEffect(() => {
		if (!minted) return;
		dispatch(locked());
	}, [minted])
}
