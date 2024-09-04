import React, { useEffect, useState } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import { _SERVICE as _SERVICELBRY } from '../../../../../../declarations/LBRY/LBRY.did';

import burnLbry from "../../thunks/burnLBRY";
import Auth from "@/features/auth";
import { flagHandler } from "../../swapSlice";
import swapLbry from "../../thunks/swapLbry";
interface BurnSwapProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    actorLbry: ActorSubclass<_SERVICELBRY>;
    isAuthenticated: boolean;

}

const BurnSwap: React.FC<BurnSwapProps> = ({ actorSwap, actorLbry,isAuthenticated }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const fee=0.0004;
    const tokenomics = useAppSelector((state) => state.tokenomics);
    const [amountLBRY, setAmountLBRY] = useState(0);
    const [tentativeICP, setTentativeICP] = useState(Number);
    const [tentativeALEX, setTentativeALEX] = useState(Number);

    const handleSubmit = (event: any) => {
        event.preventDefault();
        dispatch(swapLbry({ actor: actorSwap, amount:"0.1".toString() }));
        dispatch(burnLbry({ actorSwap, actorLbry, amount: amountLBRY }))
    }
    const handleAmountLBRYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmountLBRY(Number(e.target.value));
        setTentativeICP((Number(e.target.value) / Number(swap.lbryRatio)) / 2);
        setTentativeALEX(Number(e.target.value) * Number(tokenomics.alexMintRate));
    }
    useEffect(()=>{
        if(swap.burnSuccess===true)
        {
            //alert("Burned successfully!")
            dispatch(flagHandler())
        }
    },[swap.burnSuccess])


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
                        <label htmlFor="lbry">LBRY</label>
                        <div className="input-wrapper mt-2">
                            <input id="lbry" alt="LBRY" type="integer" placeholder="Enter " value={amountLBRY} defaultValue={0} onChange={(e) => {
                                handleAmountLBRYChange(e)
                            }} className="w-full py-1.5 px-4 w-100 rounded-lg" onWheel={event => event.currentTarget.blur()} />
                        </div>
                    </div>
                    <div className="label-wrapper flex items-center justify-between rounded-lg mt-4">
                        <h3>ICP</h3>
                        <div className="empty-container">
                            {tentativeICP.toFixed(4)}
                        </div>
                    </div>
                    <div className="label-wrapper flex items-center justify-between rounded-lg mt-4">
                        <h3>ALEX</h3>
                        <div className="empty-container">
                            {tentativeALEX.toFixed(4)}
                        </div>
                    </div>
                    * Fees will be charged in LBRY
                    {isAuthenticated===true ? 
                    (<button type="submit" className="bottom-btn w-full rounded-lg text-white bg-blue-700 px-5 py-1.5 mt-8">Burn</button>) : 
                    (<button type="button" className="bottom-btn w-full rounded-full text-center text-black border-solid border bg-black border-black mt-8"> <Auth/></button>)}
                </form>
            </div>)
        }

    </div>);
};
export default BurnSwap;
