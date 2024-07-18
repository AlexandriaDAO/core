import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import getLBRYratio from "../../thunks/getLBRYratio";
import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
interface LbryRatioProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
}

const LbryRatio: React.FC<LbryRatioProps> = ({ actorSwap }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    useEffect(() => {
        dispatch(getLBRYratio({ actor: actorSwap }));
    }, [])

    return (<div>
        {swap.loading ? (
            <div className="flex gap-1 items-center text-[#828282]">
                <span className="text-base font-normal font-roboto-condensed tracking-wider">
                    Processing
                </span>
                <ImSpinner8 size={18} className="animate animate-spin text-white" />
            </div>) : (
            <div className="text-center flex item-center justify-center">
                <h3>1 ICP </h3>
                <span style={{ fontSize: '40px', lineHeight: '0.6' }}> &#8594; </span>
                {swap.lbryRatio + " LBRY"}
            </div>)
        }

    </div>);
};
export default LbryRatio;
