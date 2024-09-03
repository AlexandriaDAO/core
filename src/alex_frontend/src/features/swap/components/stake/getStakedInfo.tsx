import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import getStakeInfo from "../../thunks/getStakedInfo";
import ClaimReward from "./claimReward";
import Unstake from "./unstake";
import Auth from "@/features/auth";
interface LbryRatioProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    isAuthenticated: Boolean
}

const GetStakedInfo: React.FC<LbryRatioProps> = ({ actorSwap, isAuthenticated }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const auth = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(
            getStakeInfo({ actor: actorSwap, account: auth.user }))
    }, [auth.user])
    useEffect(() => {
        if (swap.successStake === true || swap.unstakeSuccess === true ||swap.successClaimReward===true) {
            dispatch(
                getStakeInfo({ actor: actorSwap, account: auth.user }))
        }

    }, [swap])
    return (<div className="account-wrapper">
        <div>Alex Staked :{swap.stakeInfo.stakedAlex} ALEX {isAuthenticated === true ? (<Unstake actorSwap={actorSwap} />) : <button className=" w-full rounded-full text-center text-black border-solid border bg-black border-black mt-8"><Auth /></button>}  </div>
        Claimable Reward:{swap.stakeInfo.rewardIcp } ICP {isAuthenticated === true ? (<ClaimReward actorSwap={actorSwap} />) : <button className=" w-full rounded-full text-center text-black border-solid border bg-black border-black mt-8"><Auth /></button>}
    </div>);
};
export default GetStakedInfo;
