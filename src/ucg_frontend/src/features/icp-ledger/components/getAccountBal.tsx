import React, { useEffect } from "react";
import { useAppDispatch } from '../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import getIcpBal from "../thunks/getIcpBal";
import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICEICPLEDGER } from '../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did'
interface getaccountBalProps {
    actorIcpLedger: ActorSubclass<_SERVICEICPLEDGER>;
}

const GetaccountBal: React.FC<getaccountBalProps> = ({ actorIcpLedger }) => {
    const dispatch = useAppDispatch();
    const icpLedger = useAppSelector((state) => state.icpLedger);
    const swap = useAppSelector((state) => state.swap);

    useEffect(() => {
        dispatch(getIcpBal({
            actor: actorIcpLedger,
            account: swap.subaccount
        }));
    }, [swap])

    return (<div>
        {icpLedger.loading ? (
            <div className="flex gap-1 items-center text-[#828282]">
                <span className="text-base font-normal font-roboto-condensed tracking-wider">
                    Processing
                </span>
                <ImSpinner8 size={18} className="animate animate-spin text-white" />
            </div>) : (<h3 className="balance flex justify-between">
                Balance 
                <span> {(icpLedger?.balance)}</span>
            </h3>)
        }
    </div>);
};
export default GetaccountBal;
