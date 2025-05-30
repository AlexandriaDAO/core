import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";

import claimReward from "../../thunks/claimReward";
import { flagHandler } from "../../swapSlice";
import { useIcpSwap } from "@/hooks/actors";

interface StakedInfoProps {
    setLoadingModalV: any;
    setActionType: any;
}

const ClaimReward: React.FC<StakedInfoProps> = ({ setLoadingModalV, setActionType }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const {actor: actorSwap} = useIcpSwap();

    const handleClaim = (e: any) => {
        e.preventDefault();
        if(!actorSwap) return;
        dispatch(claimReward({actor: actorSwap, reward:swap.stakeInfo.rewardIcp}));
        setActionType("Claiming ICP rewards");
        setLoadingModalV(true);
    }

    useEffect(() => {
        if (swap.successClaimReward === true) {
            dispatch(flagHandler());
        }
    }, [swap])

    return (
        <button
            onClick={(e) => handleClaim(e)}
            className="lg:text-xl md:text-lg sm:text-base xs:text-xs font-semibold text-white bg-radiocolor dark:bg-gray-700 py-2 px-5 me-3 rounded-full border-2 border-[#000] dark:border-gray-600 hover:bg-opacity-90 dark:hover:bg-opacity-90"
        >
            Claim
        </button>
    );
};
export default ClaimReward;
