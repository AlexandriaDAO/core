import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useTheme } from "@/providers/ThemeProvider";

const TransactionPreview = () => {
    const { selectedTransaction } = useAppSelector(state => state.history);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    if (!selectedTransaction) {
        return (
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 h-full flex items-center justify-center`}>
                <div className="text-center">
                    <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>📄</div>
                    <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        No Transaction Selected
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Select a transaction from the list to view details
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 h-full`}>
            <div className="mb-6">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Transaction Details
                </h3>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <div className='flex items-center mb-2'>
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                                Timestamp
                            </span>
                            <FontAwesomeIcon icon={faQuestionCircle} className='text-gray-400 text-xs' />
                        </div>
                        <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.timestamp}
                        </p>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <div className='flex items-center mb-2'>
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                                Type
                            </span>
                            <FontAwesomeIcon icon={faQuestionCircle} className='text-gray-400 text-xs' />
                        </div>
                        <span className={`${selectedTransaction.type === "mint" ? "bg-mintbtnbg" : "bg-sendbtnbg"} bg-opacity-30 px-3 py-1 rounded-bordertb text-sm font-medium`}>
                            {selectedTransaction.type}
                        </span>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <div className='flex items-center mb-2'>
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                                Status
                            </span>
                            <FontAwesomeIcon icon={faQuestionCircle} className='text-gray-400 text-xs' />
                        </div>
                        <div className={`flex items-center text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <span className="mr-2">Completed</span>
                            <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                        </div>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <div className='flex items-center mb-2'>
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                                From
                            </span>
                            <FontAwesomeIcon icon={faQuestionCircle} className='text-gray-400 text-xs' />
                        </div>
                        <p className={`text-base font-medium break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.from}
                        </p>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <div className='flex items-center mb-2'>
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                                To
                            </span>
                            <FontAwesomeIcon icon={faQuestionCircle} className='text-gray-400 text-xs' />
                        </div>
                        <p className={`text-base font-medium break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.to}
                        </p>
                    </div>

                    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                        <div className='flex items-center mb-2'>
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                                Amount
                            </span>
                            <FontAwesomeIcon icon={faQuestionCircle} className='text-gray-400 text-xs' />
                        </div>
                        <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.amount}
                        </p>
                    </div>

                    <div>
                        <div className='flex items-center mb-2'>
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                                Fee
                            </span>
                            <FontAwesomeIcon icon={faQuestionCircle} className='text-gray-400 text-xs' />
                        </div>
                        <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedTransaction.fee}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionPreview;