import React, { useEffect, useState } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import { _SERVICE as _SERVICELBRY } from '../../../../../../declarations/LBRY/LBRY.did';

import burnLbry from "../../thunks/burnLBRY";
interface PerformSwapProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    actorLbry: ActorSubclass<_SERVICELBRY>
}

const BurnSwap: React.FC<PerformSwapProps> = ({ actorSwap, actorLbry }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const tokenomics = useAppSelector((state) => state.tokenomics);
    const [amountLBRY, setAmountLBRY] = useState("0");
    const [tentativeICP, setTentativeICP] = useState(Number);
    const [tentativeALEX, setTentativeALEX] = useState(Number);

    const handleSubmit = (event: any) => {
        event.preventDefault();
        dispatch(burnLbry({ actorSwap, actorLbry, amount: amountLBRY }))
    }
    const handleAmountLBRYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmountLBRY(e.target.value);
        setTentativeICP((Number(e.target.value) / Number(swap.lbryRatio)) / 2);
        setTentativeALEX(Number(e.target.value) * Number(tokenomics.alexMintRate));
    }
    return (<div>
        {swap.loading ? (
            <div className="flex gap-1 items-center text-[#828282]">
                <span className="text-base font-normal font-roboto-condensed tracking-wider">
                    Processing
                </span>
                <ImSpinner8 size={18} className="animate animate-spin text-white" />
            </div>) : (<div className="icp-wrapper">
                <form action="#" onSubmit={(e) => { handleSubmit(e) }}>
                    <div className="label-wrapper">
                        <label htmlFor="icp">LBRY</label>
                        <div className="input-wrapper mt-2">
                            <input id="icp" alt="ICP" type="number" placeholder="Enter ICP Numbers" value={amountLBRY} defaultValue={0.0} onChange={(e) => {
                                handleAmountLBRYChange(e)
                            }} className="w-full py-1.5 px-4 w-100 rounded-lg" onWheel={event => event.currentTarget.blur()} />
                        </div>
                    </div>
                    <div className="label-wrapper flex items-center justify-between rounded-lg mt-4">
                        <h3>ICP</h3>
                        <div className="empty-container">
                            {tentativeICP}
                        </div>
                    </div>
                    <div className="label-wrapper flex items-center justify-between rounded-lg mt-4">
                        <h3>ALEX</h3>
                        <div className="empty-container">
                            {tentativeALEX}
                        </div>
                    </div>
                    <button type="submit" className="bottom-btn w-full rounded-lg text-white bg-blue-700 px-5 py-1.5 mt-8">Burn</button>
                </form>
            </div>)
        }

    </div>);
};
export default BurnSwap;
