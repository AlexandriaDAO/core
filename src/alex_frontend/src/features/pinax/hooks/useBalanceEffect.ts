import { useLbry, useNftManager } from "@/hooks/actors";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useEffect } from "react";
import getSpendingBalance from "@/features/swap/thunks/lbryIcrc/getSpendingBalance";

export function useBalanceEffect() {
	const dispatch = useAppDispatch();
	const { actor: lbryActor } = useLbry();
	const { actor: nftManagerActor } = useNftManager();

	const { user } = useAppSelector(state => state.auth);

    // Fetch LBRY balance when component mounts or user changes
	useEffect(() => {
        if (!user || !lbryActor || !nftManagerActor) return;

		dispatch(getSpendingBalance({lbryActor, nftManagerActor, userPrincipal: user.principal}));
    }, [user, lbryActor, nftManagerActor]);
}
