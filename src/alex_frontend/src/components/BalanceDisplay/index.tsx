import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getSpendingBalance from '@/features/swap/thunks/lbryIcrc/getSpendingBalance';
import getLbryBalance from '@/features/swap/thunks/lbryIcrc/getLbryBalance';
import getAccountAlexBalance from '@/features/swap/thunks/alexIcrc/getAccountAlexBalance';
import getIcpBal from '@/features/icp-ledger/thunks/getIcpBal';
import { LoaderCircle, ChevronDown, ChevronUp, Layers, Wallet } from 'lucide-react';

const BalanceDisplay: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const {
        spendingBalance, // LBRY spending
        lbryBalance,      // Main LBRY
        loading: swapLoading,
    } = useAppSelector((state) => state.swap);
    const {
        accountBalance: icpBalance, // ICP balance
        loading: icpLoading,
    } = useAppSelector((state) => state.icpLedger);

    // Using local state for ALEX balance display until selector is known
    const [actualAlexBalance, setActualAlexBalance] = useState<string | number | undefined>(undefined);

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (user?.principal) {
            if (spendingBalance === undefined) {
                dispatch(getSpendingBalance(user.principal));
            }
            if (lbryBalance === undefined) {
                dispatch(getLbryBalance(user.principal));
            }
            dispatch(getAccountAlexBalance(user.principal));
            if (icpBalance === undefined) {
                dispatch(getIcpBal(user.principal));
            }
        }
    }, [dispatch, user, spendingBalance, lbryBalance, icpBalance]);

    if (!user) {
        return null;
    }

    const formatBalance = (balance: string | number | undefined, decimals = 2) => {
        const num = Number(balance);
        if (balance === undefined || balance === null || isNaN(num)) return (0).toFixed(decimals);
        return num.toFixed(decimals);
    };
    
    const defaultBalanceValue = spendingBalance === undefined || swapLoading 
        ? <LoaderCircle size={16} className="animate-spin inline-block" /> 
        : formatBalance(spendingBalance);

    return (
        <div className="balance-display text-white ml-3 relative">
            <div className="flex items-center cursor-pointer h-full" onClick={() => setIsExpanded(!isExpanded)}>
                <Layers size={16} className="mr-1 text-gray-400" />
                <span className="text-sm font-medium">{defaultBalanceValue}</span>
                {user && (isExpanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />)}
            </div>
            {isExpanded && user && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-gray-800 rounded-md shadow-lg border border-gray-700 w-52 z-[100]">
                    <div className="text-sm space-y-2">
                        <p className="flex justify-between items-center">
                            <span className="flex items-center"><Wallet size={14} className="mr-2 text-gray-400" />ICP:</span>
                            {icpBalance === undefined || icpLoading ? <LoaderCircle size={12} className="animate-spin" /> : <span>{formatBalance(icpBalance)}</span>}
                        </p>
                        <p className="flex justify-between items-center">
                            <span className="flex items-center"><Wallet size={14} className="mr-2 text-gray-400" />ALEX:</span>
                            {swapLoading && actualAlexBalance === undefined ? <LoaderCircle size={12} className="animate-spin" /> : <span>{formatBalance(actualAlexBalance)}</span>}
                        </p>
                        <p className="flex justify-between items-center">
                            <span className="flex items-center"><Wallet size={14} className="mr-2 text-gray-400" />LBRY:</span>
                            {lbryBalance === undefined || swapLoading ? <LoaderCircle size={12} className="animate-spin" /> : <span>{formatBalance(lbryBalance)}</span>}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalanceDisplay; 