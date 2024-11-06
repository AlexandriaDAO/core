import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { faCheck, faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import fetchTransaction, { TransactionType } from "../../thunks/lbryIcrc/getTransactions";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import TransactionHistoryObj from "./transactionHistoryObj";

const TransactionHistory = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const swap = useAppSelector((state) => state.swap);
    useEffect(() => {
        dispatch(fetchTransaction(user));
    }, [user]);
    return (<>
        <div className="overflow-x-auto lg:overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr>
                        <th className="py-3 text-left">
                            <div className='text-xl font-medium text-radiocolor items-center flex'>
                                <span className='me-2 flex'>Timestamp</span>
                                <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                    <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                </div>
                            </div>
                        </th>
                        <th className="px-6 py-3">
                            <div className='ext-xl font-medium text-radiocolor items-center flex'>
                                <span className='me-2 flex'>Type</span>
                                <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                    <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                </div>
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left">
                            <div className='text-xl font-medium text-radiocolor items-center flex'>
                                <span className='me-2 flex'>Amount</span>
                                <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                    <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                </div>
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left">
                            <div className='text-xl font-medium text-radiocolor items-center flex'>
                                <span className='me-2 flex'>Fee</span>
                                <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                    <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                </div>
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left">
                            <div className='text-xl font-medium text-radiocolor items-center flex'>
                                <span className='me-2 flex'>Status</span>
                                <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                    <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {swap.transactions?.map((trx: TransactionType, i) => {
                        return (

                            <TransactionHistoryObj key={trx.timestamp} timestamp={trx.timestamp} amount={trx.amount} type={trx.type} from={trx.from} to={trx.to} fee={trx.fee} index={i} />

                        );
                    })}
                </tbody>
            </table>
        </div>

    </>);
}
export default TransactionHistory;