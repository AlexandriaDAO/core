import React, { useEffect, useState } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import { _SERVICE as _SERVICEALEX } from "../../../../../../declarations/ALEX/ALEX.did";
import { flagHandler } from "../../swapSlice";
import stakeAlex from "../../thunks/stakeAlex";
import Auth from "@/features/auth";
interface PerformStakeProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    actorAlex: ActorSubclass<_SERVICEALEX>;
    isAuthenticated: boolean;

}

const PerformStake: React.FC<PerformStakeProps> = ({ actorSwap, actorAlex,isAuthenticated }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const [amount, setAmount] = useState("0");

    const handleSubmit = (event: any) => {
        event.preventDefault();
        dispatch(stakeAlex({ actorSwap, actorAlex, amount }))

    }
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    }
    useEffect(() => {
    }, [swap.lbryRatio])
    useEffect(() => {
        if (swap.successStake === true) {
            alert("Successfuly staked");
            dispatch(flagHandler());
        }
    }, [swap])
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
                        <label htmlFor="icp">ALEX</label>
                        <div className="input-wrapper mt-2">
                            <input id="icp" alt="ICP" type="text" placeholder="Enter ALEX Numbers" value={amount} onChange={(e) => {
                                handleAmountChange(e)
                            }} className="w-full py-1.5 px-4 w-100 rounded-lg" onWheel={event => event.currentTarget.blur()} />
                        </div>
                    </div>
                    * Fees will be charged in ALEX
                    {isAuthenticated === true ?
                        (<button type="submit" className="bottom-btn w-full rounded-lg text-white bg-blue-700 px-5 py-1.5 mt-8">stake</button>) :
                        (<button type="button" className="bottom-btn w-full rounded-full text-center text-black border-solid border bg-black border-black mt-8"> <Auth /></button>)}                </form>
            </div>)
        }

    </div>);
};
export default PerformStake;