import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import getStakeInfo from "../../thunks/getStakedInfo";
import ClaimReward from "./claimReward";
import Unstake from "./unstake";
import getALlStakesInfo from "../../thunks/getAllStakesInfo";
import getStakersCount from "../../thunks/getStakersCount";

const StakedInfo = () => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const {user} = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getStakeInfo(user))
        dispatch(getStakersCount())
        dispatch(getALlStakesInfo())
    }, [user])
    useEffect(() => {
        if (swap.successStake === true || swap.unstakeSuccess === true || swap.successClaimReward === true) {
            dispatch( getStakeInfo(user))
            dispatch(getALlStakesInfo())
            dispatch(getStakersCount())

        }
    }, [swap])
    return (
        <div >
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="border-b border-gray-300 hover:bg-gray-100">
                        <th className="py-3 text-left text-lg font-semibold text-radiocolor whitespace-nowrap">
                            <span className='flex me-7'>Date</span>
                        </th>
                        <th className="py-3 text-left text-lg font-semibold text-radiocolor whitespace-nowrap">
                            <span className='flex me-7'>Amount staked</span>
                        </th>
                        <th className="py-3 text-left text-lg font-semibold text-radiocolor whitespace-nowrap">
                            <span className='flex me-7'>Amount earned</span>
                        </th>
                        <th className="py-3 text-left text-lg font-semibold text-radiocolor whitespace-nowrap">
                            <span className='flex me-7'>Earned today</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    <tr className="border-b border-gray-300 hover:bg-gray-100">
                        <td className="py-3 text-left text-base font-medium text-radiocolor whitespace-nowrap">{new Date(Number(swap.stakeInfo.unix_stake_time) / 1e6).toLocaleString()}</td>
                        <td className="py-3 px-6 text-left text-base font-medium text-radiocolor whitespace-nowrap">{swap.stakeInfo.stakedAlex} ALEX</td>
                        <td className="py-3 px-6 text-left text-base font-medium text-radiocolor whitespace-nowrap">{swap.stakeInfo.rewardIcp} ICP</td>
                        <td className="py-3 px-6 text-left text-base font-medium text-radiocolor whitespace-nowrap">N/A ICP</td>
                        <th className="py-3 px-6 text-left">
                            <div className='stake-table whitespace-nowrap'>
                                <ClaimReward />
                                <Unstake />
                            </div>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>);
};
export default StakedInfo;
