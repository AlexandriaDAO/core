import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { faCheck, faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import fetchTransaction, { TransactionType } from "../../thunks/lbryIcrc/getTransactions";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import TransactionHistoryObj from "./transactionHistoryObj";
import { useTheme } from "@/providers/ThemeProvider";

const TransactionHistory = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const swap = useAppSelector((state) => state.swap);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        if(!user) return;
        dispatch(fetchTransaction(user.principal));
    }, [user]);
    return (<>
        <div className="overflow-x-auto lg:overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr>
                        <th className="pb-3 pt-10 text-left">
                            <div className='text-xl font-medium text-foreground items-center flex'>
                                <span className='me-2 flex'>Timestamp</span>
                                <div className='relative h-5 w-5 group'>
                                    <div className='h-5 w-5 border-2 border-multycolor flex justify-center items-center rounded-full'>
                                        <FontAwesomeIcon className='text-multycolor text-xs position-relative' icon={faExclamation} />
                                        <span className={`${isDark ? 'bg-muted text-foreground' : 'bg-[#C5CFF9] text-black'} p-3 rounded-2xl absolute bottom-0 left-full ml-3 text-xs font-light w-48 z-10 opacity-0 group-hover:opacity-100 before:content-[''] before:block before:absolute before:border-t-[10px] before:border-t-transparent before:border-b-[10px] before:border-b-transparent before:border-l-[20px] before:rotate-[164deg] before:border-l-[#C5CFF9] before:top-[70%] before:-translate-y-1/2 before:left-[-15px]`}>Transaction timestamp </span>
                                    </div>
                                </div>
                            </div>
                        </th>
                        <th className="px-6 pb-3 pt-10">
                            <div className='text-xl font-medium text-foreground items-center flex'>
                                <span className='me-2 flex'>Type</span>
                                <div className='relative h-5 w-5 group'>
                                    <div className='h-5 w-5 border-2 border-multycolor flex justify-center items-center rounded-full'>
                                        <FontAwesomeIcon className='text-multycolor text-xs position-relative' icon={faExclamation} />
                                        <span className={`${isDark ? 'bg-muted text-foreground' : 'bg-[#C5CFF9] text-black'} p-3 rounded-2xl absolute bottom-0 left-full ml-3 text-xs font-light w-48 z-10 opacity-0 group-hover:opacity-100 before:content-[''] before:block before:absolute before:border-t-[10px] before:border-t-transparent before:border-b-[10px] before:border-b-transparent before:border-l-[20px] before:rotate-[164deg] before:border-l-[#C5CFF9] before:top-[70%] before:-translate-y-1/2 before:left-[-15px] text-left`}>Transaction type</span>
                                    </div>
                                </div>
                            </div>
                        </th>
                        <th className="px-6 pb-3 pt-10 text-left">
                            <div className='text-xl font-medium text-foreground items-center flex'>
                                <span className='me-2 flex'>Amount</span>
                                <div className='relative h-5 w-5 group'>
                                    <div className='h-5 w-5 border-2 border-multycolor flex justify-center items-center rounded-full'>
                                        <FontAwesomeIcon className='text-multycolor text-xs position-relative' icon={faExclamation} />
                                        <span className={`${isDark ? 'bg-muted text-foreground' : 'bg-[#C5CFF9] text-black'} p-3 rounded-2xl absolute bottom-0 left-full ml-3 text-xs font-light w-48 z-10 opacity-0 group-hover:opacity-100 before:content-[''] before:block before:absolute before:border-t-[10px] before:border-t-transparent before:border-b-[10px] before:border-b-transparent before:border-l-[20px] before:rotate-[164deg] before:border-l-[#C5CFF9] before:top-[70%] before:-translate-y-1/2 before:left-[-15px]`}>Transaction amount</span>
                                    </div>
                                </div>
                            </div>
                        </th>
                        <th className="px-6 pb-3 pt-10 text-left">
                            <div className='text-xl font-medium text-foreground items-center flex'>
                                <span className='me-2 flex'>Fee</span>
                                <div className='relative h-5 w-5 group'>
                                    <div className='h-5 w-5 border-2 border-multycolor flex justify-center items-center rounded-full'>
                                        <FontAwesomeIcon className='text-multycolor text-xs position-relative' icon={faExclamation} />
                                        <span className={`${isDark ? 'bg-muted text-foreground' : 'bg-[#C5CFF9] text-black'} p-3 rounded-2xl absolute bottom-0 left-full ml-3 text-xs font-light w-48 z-10 opacity-0 group-hover:opacity-100 before:content-[''] before:block before:absolute before:border-t-[10px] before:border-t-transparent before:border-b-[10px] before:border-b-transparent before:border-l-[20px] before:rotate-[164deg] before:border-l-[#C5CFF9] before:top-[70%] before:-translate-y-1/2 before:left-[-15px]`}>Transaction fee</span>
                                    </div>
                                </div>
                            </div>
                        </th>
                        <th className="px-6 pb-3 pt-10 text-left">
                            <div className='text-xl font-medium text-foreground items-center flex'>
                                <span className='me-2 flex'>Status</span>
                                <div className='relative h-5 w-5 group'>
                                    <div className='h-5 w-5 border-2 border-multycolor flex justify-center items-center rounded-full'>
                                        <FontAwesomeIcon className='text-multycolor text-xs position-relative' icon={faExclamation} />
                                        <span className={`${isDark ? 'bg-muted text-foreground' : 'bg-[#C5CFF9] text-black'} p-3 rounded-2xl absolute bottom-0 left-full ml-3 text-xs font-light w-48 z-10 opacity-0 group-hover:opacity-100 before:content-[''] before:block before:absolute before:border-t-[10px] before:border-t-transparent before:border-b-[10px] before:border-b-transparent before:border-l-[20px] before:rotate-[164deg] before:border-l-[#C5CFF9] before:top-[70%] before:-translate-y-1/2 before:left-[-15px]`}>Transaction status</span>
                                    </div>
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="text-foreground text-sm font-light">
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