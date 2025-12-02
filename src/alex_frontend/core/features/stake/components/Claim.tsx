import React, { useCallback } from "react";
import { useAppDispatch } from '../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../store/hooks/useAppSelector";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import claim from "../thunks/claim";
import { useIcpSwap } from "@/hooks/actors";

const Claim: React.FC = () => {
    const dispatch = useAppDispatch();
    const { stake, claiming } = useAppSelector((state) => state.stake);
    const { actor: actorSwap } = useIcpSwap();

    const handleClaim = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (!actorSwap || claiming || !stake) return;
        dispatch(claim({ actor: actorSwap, reward: stake.reward }));
    }, [actorSwap, claiming, dispatch, stake]);

    const hasRewards = stake && stake.reward > 0;
    const isDisabled = !hasRewards || claiming || !actorSwap;

    return (
        <Button
            onClick={handleClaim}
            disabled={isDisabled}
            variant="constructive"
            scale="md"
            rounded="full"
            className="lg:text-xl md:text-lg sm:text-base xs:text-xs font-semibold me-3 flex items-center gap-2"
        >
            {claiming && <LoaderCircle size={16} className="animate-spin" />}
            {claiming ? 'Claiming...' : 'Claim'}
        </Button>
    );
};
export default Claim;