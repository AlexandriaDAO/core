import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import claimReward from "../../thunks/claimReward";
import { flagHandler } from "../../swapSlice";
interface LbryRatioProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
}

const ClaimReward: React.FC<LbryRatioProps> = ({ actorSwap }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const auth = useAppSelector((state) => state.auth);

    const handleClaim = (e: any) => {
        e.preventDefault();
        dispatch(
            claimReward({ actor: actorSwap }))
    }
    useEffect(() => {
        if (swap.successClaimReward === true) {
            alert("Successfully Claimed");
            dispatch(flagHandler());
        }


    }, [swap])
    return (
        <button
            onClick={(e) => handleClaim(e)}
            className="text-xl font-semibold text-white bg-radiocolor py-2 px-5 me-3 rounded-full"
        >            Claim
        </button>
   );
};
export default ClaimReward;
