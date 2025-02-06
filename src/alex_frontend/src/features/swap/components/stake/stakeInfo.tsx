import React, { useEffect, useState } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { useTheme } from "@/providers/ThemeProvider";

import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import getStakeInfo from "../../thunks/getStakedInfo";
import ClaimReward from "./claimReward";
import Unstake from "./unstake";
import getALlStakesInfo from "../../thunks/getAllStakesInfo";
import getStakersCount from "../../thunks/getStakersCount";
import getAverageApy from "../../thunks/getAverageApy";
interface StakedInfoProps {
    setLoadingModalV: any;
    setActionType: any;
    userEstimateReward:number;
}
const StakedInfo: React.FC<StakedInfoProps> = ({ setLoadingModalV, setActionType,userEstimateReward }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const { user } = useAppSelector((state) => state.auth);
    const { theme } = useTheme();

    useEffect(() => {

        if(user) dispatch(getStakeInfo(user.principal));
        dispatch(getStakersCount());
        dispatch(getALlStakesInfo());
        dispatch(getAverageApy());

    }, [user])
    useEffect(() => {
        if (swap.successStake === true || swap.unstakeSuccess === true || swap.successClaimReward === true) {
            if(user) dispatch(getStakeInfo(user.principal))
            dispatch(getALlStakesInfo())
            dispatch(getStakersCount())
        }
    }, [user, swap])

    return (
        <div >
           <table className="min-w-full border-collapse">
                <thead>
                    {/* Header row hidden on small screens */}
                    <tr className="hidden sm:table-row border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <th className="py-3 text-left text-lg font-semibold text-radiocolor dark:text-white whitespace-nowrap">
                        <span className="flex me-7">Date</span>
                    </th>
                    <th className="py-3 text-left text-lg font-semibold text-radiocolor dark:text-white whitespace-nowrap">
                        <span className="flex me-7">Amount Staked</span>
                    </th>
                    <th className="py-3 text-left text-lg font-semibold text-radiocolor dark:text-white whitespace-nowrap">
                        <span className="flex me-7">Amount Earned</span>
                    </th>
                    <th className="py-3 text-left text-lg font-semibold text-radiocolor dark:text-white whitespace-nowrap">
                        <span className="flex me-7">Estimated Reward</span>
                    </th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
                    {/* Each row switches between horizontal and vertical */}
                    <tr className="block sm:table-row border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="block sm:table-cell py-3 text-left text-base font-medium text-radiocolor dark:text-white whitespace-nowrap">
                        <span className="block sm:hidden font-semibold dark:text-gray-400">Date:</span>
                        {new Date(Number(swap.stakeInfo.unix_stake_time) / 1e6).toLocaleString()}
                    </td>
                    <td className="block sm:table-cell py-3 sm:px-6 xs:px-2 text-left text-base font-medium text-radiocolor dark:text-white whitespace-nowrap">
                        <span className="block sm:hidden font-semibold dark:text-gray-400">Amount Staked:</span>
                        {swap.stakeInfo.stakedAlex} ALEX
                    </td>
                    <td className="block sm:table-cell py-3 sm:px-6 xs:px-2 text-left text-base font-medium text-radiocolor dark:text-white whitespace-nowrap">
                        <span className="block sm:hidden font-semibold dark:text-gray-400">Amount Earned:</span>
                        {swap.stakeInfo.rewardIcp} ICP
                    </td>
                    <td className="block sm:table-cell py-3 sm:px-6 xs:px-2 text-left text-base font-medium text-radiocolor dark:text-white whitespace-nowrap">
                        <span className="block sm:hidden font-semibold dark:text-gray-400">Estimated Reward:</span>
                        {userEstimateReward} ICP
                    </td>
                    <td className="block sm:table-cell py-3 sm:px-6 xs:px-2 text-left">
                        <span className="block sm:hidden font-semibold dark:text-gray-400">Actions:</span>
                        <div className="stake-table whitespace-nowrap">
                        <ClaimReward setLoadingModalV={setLoadingModalV} setActionType={setActionType} />
                        <Unstake setLoadingModalV={setLoadingModalV} setActionType={setActionType} />
                        </div>
                    </td>
                    </tr>
                </tbody>
           </table>


        </div>);
};
export default StakedInfo;
