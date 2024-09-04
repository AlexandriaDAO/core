import React, { useEffect, useState } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import swapLbry from "../../thunks/swapLbry";
import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import { flagHandler } from "../../swapSlice";
import Auth from "@/features/auth";
interface PerformSwapProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    isAuthenticated: boolean;
}

const PerformSwap: React.FC<PerformSwapProps> = ({ actorSwap, isAuthenticated }) => {
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
    useEffect(() => {
        if (swap.swapSuccess === true) {
            //alert("Success");
            dispatch(flagHandler());
        }
    }, [swap.swapSuccess])
    return (<div>
        {swap.loading? (
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
                    * Fees will be charged in ICP
                    {isAuthenticated===true ? 
                    (<button type="submit" className="bottom-btn w-full rounded-lg text-white bg-blue-700 px-5 py-1.5 mt-8">Swap</button>) : 
                    (<button type="button" className="bottom-btn w-full rounded-full text-center text-black border-solid border bg-black border-black mt-8"> <Auth/></button>)}
                </form>
            </div>)
        }

    </div>);
};
export default PerformSwap;