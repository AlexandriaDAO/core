import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getSpendingBalance from '@/features/swap/thunks/lbryIcrc/getSpendingBalance';
import getLbryBalance from '../../features/swap/thunks/lbryIcrc/getLbryBalance';
import getAccountAlexBalance from '../../features/swap/thunks/alexIcrc/getAccountAlexBalance';
import getIcpBal from '@/features/icp-ledger/thunks/getIcpBal';
import { LoaderCircle, ChevronDown, ChevronUp, Layers, Wallet } from 'lucide-react';
import { useAlex, useIcpLedger, useLbry, useNftManager } from '@/hooks/actors';

import { NavLink } from "react-router";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";

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
        <DropdownMenu onOpenChange={setIsExpanded}>
            <DropdownMenuTrigger asChild>
                <div className="flex-shrink h-auto w-max flex justify-center items-center gap-1 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 text-white hover:text-white/90 hover:border-white rounded-full cursor-pointer duration-300 transition-all">
                    <Layers size={16} className="mr-1 text-gray-400" />
                    <span className="text-base font-normal font-roboto-condensed tracking-wider">{defaultBalanceValue}</span>
                    {user && (isExpanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />)}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="font-roboto-condensed">
                <NavLink to='/swap/balance'>
                    <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
                        <Wallet />
                        <span className="flex-grow text-left">ICP</span>
                        {icpLoading && icpBalance === "0" ? <LoaderCircle size={12} className="animate-spin" /> : <span className="pl-4">{formatBalance(icpBalance)}</span>}
                    </DropdownMenuItem>
                </NavLink>
                <NavLink to='/swap/balance'>
                    <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
                        <Wallet />
                        <span className="flex-grow text-left">ALEX</span>
                        {alexLoading && mainAlexBalance === "0" ? <LoaderCircle size={12} className="animate-spin" /> : <span className="pl-4">{formatBalance(mainAlexBalance)}</span>}
                    </DropdownMenuItem>
                </NavLink>
                <NavLink to='/swap/balance'>
                    <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
                        <Wallet />
                        <span className="flex-grow text-left">LBRY</span>
                        {swapLoading && lbryBalance === "0" ? <LoaderCircle size={12} className="animate-spin" /> : <span className="pl-4">{formatBalance(lbryBalance)}</span>}
                    </DropdownMenuItem>
                </NavLink>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default BalanceDisplay; 