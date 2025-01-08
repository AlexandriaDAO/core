import React, { useEffect, useState } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";

import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import claimReward from "../../thunks/claimReward";
import { flagHandler } from "../../swapSlice";
interface StakedInfoProps {
    setLoadingModalV: any;
    setActionType: any;
}
const ClaimReward: React.FC<StakedInfoProps> = ({ setLoadingModalV,setActionType}) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);


    const handleClaim = (e: any) => {
        e.preventDefault();
        dispatch(claimReward());
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
            className="lg:text-xl md:text-lg sm:text-base xs:text-xs font-semibold text-white bg-radiocolor py-2 px-5 me-3 rounded-full border-2 border-[#000]"
        >            Claim
        </button>
    );
};
export default ClaimReward;
