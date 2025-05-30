import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";

import { flagHandler } from "../../swapSlice";
import unstake from "../../thunks/unstake";
import { useIcpSwap } from "@/hooks/actors";

interface UnstakeProps {
    setLoadingModalV: any;
    setActionType: any;
}

const Unstake: React.FC<UnstakeProps> = ({ setLoadingModalV, setActionType}) => {
    const {actor: actorSwap} = useIcpSwap();
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);

    const handleUnstake = (e: any) => {
        e.preventDefault();
        if(!actorSwap) return;
        dispatch(unstake(actorSwap));
        setActionType("UnStake ICP");
        setLoadingModalV(true);
    }

    useEffect(() => {
        if (swap.unstakeSuccess === true) {
            dispatch(flagHandler());
        }
    }, [swap])

    return (
        <button
            className="lg:text-xl md:text-lg sm:text-base xs:text-xs font-semibold text-multycolor dark:text-orange-300 border-2 border-[#FF9900] dark:border-orange-400 py-2 px-5 me-3 rounded-full hover:bg-orange-50 dark:hover:bg-gray-800"
            onClick={(e) => handleUnstake(e)}
        >
            Unstake
        </button>
    );
};
export default Unstake;
