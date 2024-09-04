import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import getLBRYratio from "../../thunks/getLBRYratio";
import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import { _SERVICE as _SERVICETOKENOMICS } from '../../../../../../declarations/tokenomics/tokenomics.did';

import getAlexMintRate from "../../thunks/tokenomics/getAlexMintRate";
import getMaxLbryBurn from "../../thunks/getMaxLbryBurn";
interface LbryBurnRatioProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    actorTokenomics: ActorSubclass<_SERVICETOKENOMICS>;
}

const LbryBurnRatio: React.FC<LbryBurnRatioProps> = ({ actorSwap, actorTokenomics }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const tokenomics = useAppSelector((state) => state.tokenomics);

    useEffect(() => {

        dispatch(getLBRYratio({ actor: actorSwap }));
        dispatch(getMaxLbryBurn({ actor: actorSwap }));
        dispatch(getAlexMintRate({ actor: actorTokenomics }))
    }, [])
    useEffect(() => {
        if (swap.burnSuccess === true || swap.swapSuccess === true) {
            dispatch(getLBRYratio({ actor: actorSwap }));
            dispatch(getMaxLbryBurn({ actor: actorSwap }));
            dispatch(getAlexMintRate({ actor: actorTokenomics }))
        }
    }, [swap])

    return (<div>
        {swap.loading ? (
            <div className="flex gap-1 items-center text-[#828282]">
                <span className="text-base font-normal font-roboto-condensed tracking-wider">
                    Processing
                </span>
                <ImSpinner8 size={18} className="animate animate-spin text-white" />
            </div>) : (
            <div>
                <div className="text-center flex item-center justify-center">{swap.lbryRatio + " LBRY "}
                    <span style={{ fontSize: '40px', lineHeight: '0.6' }}> &#8594; </span>
                    <h3>0.5 ICP </h3>
                </div>
                <div className="text-center flex item-center justify-center">{1 + " LBRY"}
                    <span style={{ fontSize: '40px', lineHeight: '0.6' }}> &#8594; </span>
                    <h3>{tokenomics.alexMintRate + " ALEX"} </h3>
                </div>
                <div className="flex items-center justify-between">
                    <h3>Max LBRY Burn allowed:</h3>
                    <span>
                        {" " + swap.maxLbryBurn.toString()}
                    </span>
                </div>
            </div>)
        }

    </div>);
};
export default LbryBurnRatio;
