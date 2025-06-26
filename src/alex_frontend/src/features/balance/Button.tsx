import React, { useState, useEffect, useCallback, lazy } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { ChevronDown, ChevronUp, RotateCw } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";

import { setLastRefresh, setTotal } from './balanceSlice';
import IcpBalance from './icp';

import {AlexUnlockedBalance} from './alex';
import {AlexLockedBalance} from './alex';

import {LbryUnlockedBalance} from './lbry';
import {LbryLockedBalance} from './lbry';

// Import thunks from sub-slices
import fetchIcpAmount from './icp/thunks/amount';
import fetchIcpPrice from '../icp-ledger/thunks/getIcpPrice';

import fetchUnlockedAlex from './alex/thunks/unlocked';
import fetchLockedAlex from './alex/thunks/locked';
import fetchAlexPrice from './alex/thunks/price';

import fetchUnlockedLbry from './lbry/thunks/unlocked';
import fetchLockedLbry from './lbry/thunks/locked';

const BalanceButton = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    // Use balance slice state from new structure
    const { lastRefresh, total } = useAppSelector((state) => state.balance);
    const { amount: icp, price: icpPrice, amountError, amountLoading, priceError, priceLoading } = useAppSelector((state) => state.balance.icp);
    const { unlocked: unlockedAlex, locked: lockedAlex, price: alexPrice } = useAppSelector((state) => state.balance.alex);

    const [isExpanded, setIsExpanded] = useState(false);


    const refresh = useCallback(() => {
        dispatch(fetchIcpAmount());
        dispatch(fetchIcpPrice());

        dispatch(fetchUnlockedAlex());
        dispatch(fetchLockedAlex());
        dispatch(fetchAlexPrice());

        dispatch(fetchUnlockedLbry());
        dispatch(fetchLockedLbry());

        dispatch(setLastRefresh());
    }, []);

    useEffect(()=>{
        refresh();
    },[])

    useEffect(()=>{
        if(icpPrice <= 0 || alexPrice <= 0){
            dispatch(setTotal(-1));
            return;
        }

        const totalIcpInUSD = icpPrice * icp;

        const totalUnockedAlexInUSD = alexPrice * unlockedAlex;

        const totalLockedAlexInUSD = alexPrice * lockedAlex;

        dispatch(setTotal(totalIcpInUSD + totalUnockedAlexInUSD + totalLockedAlexInUSD))
    },[icpPrice, alexPrice, icp, unlockedAlex, lockedAlex])


    // // Initial load effect
    // useEffect(() => {
    //     // Only load if we haven't loaded recently (avoid unnecessary loads)
    //     const shouldLoad = !lastRefresh || (Date.now() - lastRefresh) > 60000; // 1 minute threshold

    //     if (shouldLoad) {
    //         refreshBalances();
    //     }
    // }, [refreshBalances]);

    // Price loading effect
    // useEffect(() => {
    //     dispatch(fetchIcpPrice());
    //     dispatch(fetchAlexPrice());
    // }, []);


    // const formatBalance = (balance: string | number | undefined, decimals = 2) => {
    //     const num = Number(balance);
    //     if (balance === undefined || balance === null || isNaN(num) || balance === "0") return (0).toFixed(decimals);
    //     return num.toFixed(decimals);
    // };

    return (
        <DropdownMenu onOpenChange={setIsExpanded}>
            <DropdownMenuTrigger asChild>
                <div className="flex-shrink h-auto w-max flex justify-center items-center gap-1 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 text-white hover:text-white/90 hover:border-white rounded-full cursor-pointer duration-300 transition-all">
                    {total > 0 ? <>
                        <span className="text-base font-normal font-roboto-condensed tracking-wider">${total.toFixed(2)}</span>
                    </> : (
                        <span className="text-base font-normal font-roboto-condensed tracking-wider">Balance</span>
                    )}
                    {user && (isExpanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />)}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="font-roboto-condensed">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Balance</span>
                    <RotateCw size={16} className="cursor-pointer" onClick={refresh} />
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <IcpBalance menu/>

                <AlexUnlockedBalance menu/>

                <LbryUnlockedBalance menu/>

                <DropdownMenuLabel>Top up Wallet</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <AlexLockedBalance menu/>

                <LbryLockedBalance menu/>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default BalanceButton;