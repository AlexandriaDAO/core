import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import getStakeInfo from "../../thunks/getStakedInfo";
import ClaimReward from "./claimReward";
import Unstake from "./unstake";
interface LbryRatioProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
}

const GetStakedInfo: React.FC<LbryRatioProps> = ({ actorSwap }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const auth = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(
            getStakeInfo({ actor: actorSwap, account: auth.user }))
    }, [])
    useEffect(() => {
        if (swap.successStake===true||swap.unstakeSuccess===true) {
            dispatch(
                getStakeInfo({ actor: actorSwap, account: auth.user }))
        }

    }, [swap.successStake,swap.unstakeSuccess])
    return (<div className="account-wrapper">
        <div>Alex Staked :{swap.stakeInfo.stakedAlex}  <Unstake actorSwap={actorSwap} /> </div>
        Claimable Reward:{swap.stakeInfo.rewardIcp} <ClaimReward actorSwap={actorSwap} />
    </div>);
};
export default GetStakedInfo;
