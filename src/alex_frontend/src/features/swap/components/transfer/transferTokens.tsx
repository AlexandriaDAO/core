import React, { useEffect, useState } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICEICPLEDGER } from '../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did'
import Auth from "@/features/auth";
import transferICP from "@/features/icp-ledger/thunks/transferICP";
import { _SERVICE as _SERVICELBRY } from '../../../../../../declarations/LBRY/LBRY.did';
import { _SERVICE as _SERVICEALEX } from '../../../../../../declarations/ALEX/ALEX.did';

import transferLBRY from "../../thunks/lbryIcrc/transferLBRY";
import transferALEX from "../../thunks/alexIcrc/transferALEX";
import { icpLedgerFlagHandler } from "@/features/icp-ledger/icpLedgerSlice";
import { flagHandler } from "../../swapSlice";

interface TransferTokensProps {
    actorIcpLedger: ActorSubclass<_SERVICEICPLEDGER>;
    actorLbry: ActorSubclass<_SERVICELBRY>;
    actorAlex: ActorSubclass<_SERVICEALEX>;
    isAuthenticated: boolean;
}

const TransferTokens: React.FC<TransferTokensProps> = ({ actorIcpLedger, actorLbry, actorAlex, isAuthenticated }) => {
    const dispatch = useAppDispatch();
    const icpLedger = useAppSelector((state) => state.icpLedger);
    const swap = useAppSelector((state) => state.swap);
    const [amount, setAmount] = useState("0");
    const [destination, setDestination] = useState("");
    const [accountType, setAccountType] = useState("principal");
    const [tokenType, setTokenType] = useState("")
    const handleSubmit = (event: any) => {
        event.preventDefault();
        if (tokenType === "ICP") {
            dispatch(transferICP({ actor: actorIcpLedger, amount, destination, accountType }))
        }
        else if (tokenType === "LBRY") {
            dispatch(transferLBRY({
                actorLbry: actorLbry,
                amount: amount,
                destination: destination,
            }))
        }
        else if (tokenType === "ALEX") {
            dispatch(transferALEX({
                actorAlex: actorAlex,
                amount: amount,
                destination: destination,
            }))
        }

    }
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);

    }
    const handleTransferTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setAccountType(e.target.value);
    }
    const handleTokenTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        setTokenType(e.target.value);
        if (e.target.value !== "ICP") {
            setAccountType("principal")
        }
    }

    useEffect(() => {
        if (icpLedger.transferSuccess === true) {
            alert("Success");
            dispatch(icpLedgerFlagHandler());
        }
    }, [icpLedger.transferSuccess])
    useEffect(() => {
        if (swap.transferSuccess === true) {
            alert("Success");
            dispatch(flagHandler());
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
                <form action="#" onSubmit={(e) => { handleSubmit(e) }}>
                    <div className="label-wrapper">
                        {/* <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an option</label> */}

                        <select id="tokenType" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={(e) => { handleTokenTypeChange(e) }}>
                            <option selected>Token type </option>
                            <option value="ICP">ICP</option>
                            <option value="LBRY">LBRY</option>
                            <option value="ALEX">ALEX</option>

                        </select>
                        {tokenType === "ICP" ? (<select id="accountType" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={(e) => { handleTransferTypeChange(e) }}>
                            <option selected>Transfer type </option>
                            <option value="principal">Principal</option>
                            <option value="account-id">Account-id</option>
                        </select>) : (<></>)}

                        <label htmlFor="tokenType">{tokenType}</label>
                        <div className="input-wrapper mt-2">
                            <input id="tokenType" alt="tokenType" type="number" placeholder="Enter ICP Numbers" value={amount} defaultValue={0.0} onChange={(e) => {
                                handleAmountChange(e)
                            }} className="w-full py-1.5 px-4 w-100 rounded-lg" onWheel={event => event.currentTarget.blur()} />
                        </div>
                        <div className="input-wrapper mt-2">
                            <input id="icp" alt="ICP" type="string" placeholder="Enter destination address" value={destination} onChange={(e) => {
                                setDestination(e.target.value);
                            }} className="w-full py-1.5 px-4 w-100 rounded-lg" onWheel={event => event.currentTarget.blur()} />
                        </div>
                    </div>
                    * Fees will be charged in {tokenType}
                    {isAuthenticated === true ?
                        (<button type="submit" className="bottom-btn w-full rounded-lg text-white bg-blue-700 px-5 py-1.5 mt-8">Transfer</button>) :
                        (<button type="button" className="bottom-btn w-full rounded-full text-center text-black border-solid border bg-black border-black mt-8"> <Auth /></button>)}
                </form>
            </div>)
        }

    </div>);
};
export default TransferTokens;
