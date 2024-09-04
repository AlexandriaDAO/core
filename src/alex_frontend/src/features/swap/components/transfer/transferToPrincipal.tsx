import React, { useEffect, useState } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICEICPLEDGER } from '../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did'
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';

import { icpLedgerFlagHandler } from "@/features/icp-ledger/icpLedgerSlice";
import transferICPFromUserWalletcanister from "../../thunks/transferICPFromUserWallet";

interface TransferToPrincipalProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    isAuthenticated: boolean;
}

const TransferToPrincipal: React.FC<TransferToPrincipalProps> = ({ actorSwap, isAuthenticated }) => {
    const dispatch = useAppDispatch();
    const icpLedger = useAppSelector((state) => state.icpLedger);
    const swap = useAppSelector((state) => state.swap);
    const auth = useAppSelector((state) => state.auth);

    const [amount, setAmount] = useState("0");
    const [destination, setDestination] = useState("");
    const handleTransfer = (event: any) => {
        event.preventDefault();
        dispatch(transferICPFromUserWalletcanister({
            actorSwap: actorSwap,
            amount: amount,
            destination: destination,
        }))


    }
    useEffect(() => {
        setAmount(icpLedger.subAccountBalance);
        setDestination(auth.user);
    }, [auth.user,icpLedger.subAccountBalance])

    useEffect(() => {
        if (swap.transferSuccess === true) {
            alert("Success");
            dispatch(icpLedgerFlagHandler());
        }
    }, [swap.transferSuccess])
    return (<div>
        {icpLedger.loading ? (
            <div className="flex gap-1 items-center text-[#828282]">
                <span className="text-base font-normal font-roboto-condensed tracking-wider">
                    Processing
                </span>
                <ImSpinner8 size={18} className="animate animate-spin text-white" />
            </div>) : (<div className="icp-wrapper one">

                {isAuthenticated===true ? 
                    (<button type="submit" className="bottom-btn rounded-lg text-white bg-blue-700 px-5 py-1.5 mt-8" onClick={(e)=>{handleTransfer(e)}}>Transfer To principal</button>) : <></>}
                
            </div>)
        }

    </div>);
};
export default TransferToPrincipal;
