import React, { useEffect, useState } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import getLBRYratio from "../../thunks/getLBRYratio";
import swapLbry from "../../thunks/swapLbry";
import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import { flagHandler } from "../../swapSlice";
import getLbryBalance from "../../thunks/getLbryBalance";
interface PerformSwapProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
}

const PerformSwap: React.FC<PerformSwapProps> = ({ actorSwap }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const [amount, setAmount] = useState("0");
    const [lbryRatio, setLbryRatio] = useState(0.0);
    const [tentativeLBRY, setTentativeLBRY] = useState(Number);
 
    const handleSubmit = (event: any) => {
        event.preventDefault();
        dispatch(swapLbry({ actor: actorSwap, amount }))

    }
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
        setTentativeLBRY(lbryRatio * Number(e.target.value));
    }
    useEffect(() => {
        setLbryRatio(Number(swap.lbryRatio))
    }, [swap.lbryRatio])
    useEffect(()=>{
        if(swap.success===true)
        {
            alert("Success");
            dispatch(flagHandler());
        }
    },[swap.success])
    return (<div>
        {swap.loading ? (
            <div className="flex gap-1 items-center text-[#828282]">
                <span className="text-base font-normal font-roboto-condensed tracking-wider">
                    Processing
                </span>
                <ImSpinner8 size={18} className="animate animate-spin text-white" />
            </div>) : (<div className="icp-wrapper one">
                <form action="#" onSubmit={(e) => { handleSubmit(e) }}>
                    <div className="label-wrapper">
                        <label htmlFor="icp">ICP</label>
                        <div className="input-wrapper mt-2">
                            <input id="icp" alt="ICP" type="number" placeholder="Enter ICP Numbers" value={amount} defaultValue={0.0} onChange={(e) => {
                                handleAmountChange(e)
                            }} className="w-full py-1.5 px-4 w-100 rounded-lg" onWheel={event => event.currentTarget.blur()} />
                        </div>
                    </div>
                    <div className="label-wrapper flex items-center justify-between rounded-lg mt-4">
                        <h3>LBRY</h3>
                        <div className="empty-container">
                            {tentativeLBRY}
                        </div>
                    </div>
                    <button type="submit" className="bottom-btn w-full rounded-lg text-white bg-blue-700 px-5 py-1.5 mt-8">Swap</button>
                </form>
            </div>)
        }

    </div>);
};
export default PerformSwap;