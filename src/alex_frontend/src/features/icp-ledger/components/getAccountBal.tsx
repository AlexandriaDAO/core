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
    const auth = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (auth.user !== "" && swap.subaccount !== "") {
            dispatch(getIcpBal({
                actor: actorIcpLedger,
                subaccount: swap.subaccount,
                account: auth.user
            }));
        }
    }, [auth.user, swap.subaccount])
    useEffect(() => {
        if (swap.successClaimReward === true || swap.success == true
        ) {
            dispatch(getIcpBal({
                actor: actorIcpLedger,
                subaccount: swap.subaccount,
                account: auth.user
            }));
        }
    }, [swap])

    return (<div>
        {icpLedger.loading ? (
            <div className="flex gap-1 items-center text-[#828282]">
                <span className="text-base font-normal font-roboto-condensed tracking-wider">
                    Processing
                </span>
                <ImSpinner8 size={18} className="animate animate-spin text-white" />
            </div>) : (<div className="balance-wrapper flex">

                <div className="balance balance1 w-2/4">
                    <h2 className="text-3xl">Prinicpal Acocunt:</h2>
                    <h3>Address</h3>
                    <span className="address">
                        {auth.user}
                    </span>
                    <h3>Balance</h3>
                    <span className="address">
                        {(icpLedger?.accountBalance)}
                    </span>
                </div>
                <div className="balance balance2 w-2/4">
                    <h2 className="text-3xl">Subaccount Acocunt:</h2>
                    <h3>Address</h3>
                    <span className="address">
                        {swap.subaccount}
                    </span>
                    <h3>Balance</h3>
                    <span className="address">
                        {(icpLedger?.subAccountBalance)}
                    </span>
                </div>

            </div>)
        }
    </div>);
};
export default GetaccountBal;
