import React, { useCallback } from "react";
import { useAppDispatch } from '../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../store/hooks/useAppSelector";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import unstake from "../thunks/unstake";
import { useIcpSwap } from "@/hooks/actors";
import unlocked from "@/features/balance/alex/thunks/unlocked";
import { setStake } from "../stakeSlice";

const Unstake: React.FC = () => {
    const { actor: actorSwap } = useIcpSwap();
    const dispatch = useAppDispatch();
    const { stake, unstaking } = useAppSelector((state) => state.stake);

    const handleUnstake = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!actorSwap || unstaking) return;
        try{
            await dispatch(unstake(actorSwap)).unwrap();
            dispatch(setStake(null))
            dispatch(unlocked())
        }catch(error){}

    }, [actorSwap, unstaking, dispatch]);

    const hasStake = stake && stake.staked > 0;
    const isDisabled = !hasStake || unstaking || !actorSwap;

    return (
        <Button
            onClick={handleUnstake}
            disabled={isDisabled}
            variant="warning"
            scale="md"
            rounded="full"
            className="lg:text-xl md:text-lg sm:text-base xs:text-xs font-semibold me-3 flex items-center gap-2"
        >
            {unstaking && <LoaderCircle size={16} className="animate-spin" />}
            {unstaking ? 'Unstaking...' : 'Unstake'}
        </Button>
    );
};
export default Unstake;