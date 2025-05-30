import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getSpendingBalance from '@/features/swap/thunks/lbryIcrc/getSpendingBalance';
import getLbryBalance from '../../features/swap/thunks/lbryIcrc/getLbryBalance';
import getAccountAlexBalance from '../../features/swap/thunks/alexIcrc/getAccountAlexBalance';
import getIcpBal from '@/features/icp-ledger/thunks/getIcpBal';
import { LoaderCircle, ChevronDown, ChevronUp, Layers, Wallet } from 'lucide-react';
import { useAlex, useIcpLedger, useLbry, useNftManager } from '@/hooks/actors';

const BalanceDisplay: React.FC = () => {
    const {actor: lbryActor} = useLbry();
    const {actor: nftManagerActor} = useNftManager();
    const {actor: icpLedgerActor} = useIcpLedger();
    const {actor: alexActor} = useAlex();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const {
        spendingBalance, 
        lbryBalance,      
        loading: swapLoading,
    } = useAppSelector((state) => state.swap);
    const {
        accountBalance: icpBalance, 
        loading: icpLoading,
    } = useAppSelector((state) => state.icpLedger);
    const {
        alexBal: mainAlexBalance,
        loading: alexLoading,
    } = useAppSelector((state) => state.alex);

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!user || !lbryActor || !nftManagerActor) return;
        if (spendingBalance === "0") {
            dispatch(getSpendingBalance({lbryActor, nftManagerActor, userPrincipal: user.principal}));
        }
    }, [dispatch, user, spendingBalance, lbryActor, nftManagerActor]);

    useEffect(() => {
        if (!user || !icpLedgerActor || !alexActor || !lbryActor) return;
        if (isExpanded) {
            if (icpBalance === "0") {
                dispatch(getIcpBal({actor: icpLedgerActor, account: user.principal}));
            }
            if (mainAlexBalance === "0") {
                dispatch(getAccountAlexBalance({actor: alexActor, account: user.principal}));
            }
            if (lbryBalance === "0") {
                dispatch(getLbryBalance({actor: lbryActor, account: user.principal}));
            }
        }
    }, [dispatch, user, isExpanded, icpBalance, mainAlexBalance, lbryBalance]);

    if (!user) {
        return null;
    }

    const formatBalance = (balance: string | number | undefined, decimals = 2) => {
        const num = Number(balance);
        if (balance === undefined || balance === null || isNaN(num) || balance === "0") return (0).toFixed(decimals);
        return num.toFixed(decimals);
    };
    
    const defaultBalanceValue = swapLoading && spendingBalance === "0"
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
                            {icpLoading && icpBalance === "0" ? <LoaderCircle size={12} className="animate-spin" /> : <span>{formatBalance(icpBalance)}</span>}
                        </p>
                        <p className="flex justify-between items-center">
                            <span className="flex items-center"><Wallet size={14} className="mr-2 text-gray-400" />ALEX:</span>
                            {alexLoading && mainAlexBalance === "0" ? <LoaderCircle size={12} className="animate-spin" /> : <span>{formatBalance(mainAlexBalance)}</span>}
                        </p>
                        <p className="flex justify-between items-center">
                            <span className="flex items-center"><Wallet size={14} className="mr-2 text-gray-400" />LBRY:</span>
                            {swapLoading && lbryBalance === "0" ? <LoaderCircle size={12} className="animate-spin" /> : <span>{formatBalance(lbryBalance)}</span>}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalanceDisplay; 