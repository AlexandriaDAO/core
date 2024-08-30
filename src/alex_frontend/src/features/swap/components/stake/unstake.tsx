import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import getStakeInfo from "../../thunks/getStakedInfo";
import claimReward from "../../thunks/claimReward";
import { flagHandler } from "../../swapSlice";
import getIcpBal from "@/features/icp-ledger/thunks/getIcpBal";
import unstake from "../../thunks/unstake";
interface LbryRatioProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
}

const Unstake: React.FC<LbryRatioProps> = ({ actorSwap }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);

    const handleUnstake = (e: any) => {
        e.preventDefault();
        dispatch(
            unstake({ actor: actorSwap }))
    }
    useEffect(() => {
        if (swap.unstakeSuccess === true) {
            alert("Successfully unstaked!");
            dispatch(flagHandler());
        }


    }, [swap])
    return (<div className="account-wrapper">
        <button
            className="rounded-lg text-white bg-blue-700 px-5 py-1.5 mt-8"
            onClick={(e) => handleUnstake(e)}
        >Unstake
        </button>
    </div>);
};
export default Unstake;
