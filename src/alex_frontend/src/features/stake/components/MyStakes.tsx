import React, { useEffect, useMemo } from "react";
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from "@/store/hooks/useAppSelector";
import getStake from "../thunks/getStake";
import { Calendar, Coins, TrendingUp, Activity } from "lucide-react";
import Claim from "./Claim";
import Unstake from "./Unstake";

const MyStakes: React.FC = () => {
    const dispatch = useAppDispatch();
    const { stake, staked, yield: yieldValue} = useAppSelector((state) => state.stake);

    useEffect(() => {
        dispatch(getStake());
    }, []);

    const formatDate = useMemo(() => {
        if (!stake || !stake.staked_at || stake.staked_at <= 0) return "Not staked yet";

        // staked_at is in nanoseconds from IC, convert to milliseconds for JS Date
        const date = new Date(stake.staked_at / 1000000);

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }, [stake]);

    const userEstimateReward = useMemo(() => {
        const stakedAmount = staked || 0;
        return stakedAmount * yieldValue;
    }, [staked, yieldValue]);

    // no stakings by user
    if(!stake || stake.staked<=0 ) return (
        <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Staking Activity</h3>
            <p className="text-gray-600 dark:text-gray-400">Start staking ALEX tokens to see your activity here</p>
        </div>
    )

    return (
        <div className="mt-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Staking History</h2>
                <p className="text-gray-600 dark:text-gray-400">Track your staking activity and manage your rewards</p>
            </div>
            <div className="overflow-x-auto">
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <Calendar size={16} />
                                            <span>Stake Date</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <Coins size={16} />
                                            <span>Amount Staked</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp size={16} />
                                            <span>Rewards Earned</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Estimated Hourly
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {formatDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {stake.staked}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">ALEX</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                {stake.reward}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">ICP</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {userEstimateReward > 0 ? <>
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    {userEstimateReward}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">ICP</span>
                                            </>:(
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Unknown</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Claim />
                                            <Unstake />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stake Date</span>
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">{formatDate}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Coins size={16} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount Staked</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {stake.staked}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">ALEX</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp size={16} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rewards Earned</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                        {stake.reward}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">ICP</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Hourly</span>
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {userEstimateReward}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">ICP</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex items-center space-x-2">
                                    <Claim />
                                    <Unstake />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyStakes;