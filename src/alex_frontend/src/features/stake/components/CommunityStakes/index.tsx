import React, { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import Returns from "./Returns";
import Staked from "./Staked";
import Stakers from "./Stakers";
import getStakers from "../../thunks/getStakers";
import getYield from "../../thunks/getYield";
import getStaked from "../../thunks/getStaked";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const CommunityStakes: React.FC = () => {
    const dispatch = useAppDispatch();

    const {stake} = useAppSelector(state=>state.stake)

    useEffect(() => {
        dispatch(getStakers());
        dispatch(getStaked());
        dispatch(getYield());
    }, [stake]);

    return (
        <div className={`stake-info flex flex-col gap-5`}>
            <div className="">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community Stakes</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Current staking details and estimated rewards
                </p>
            </div>

            <Returns/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Staked />
                <Stakers />
            </div>
        </div>
    );
};

export default CommunityStakes;