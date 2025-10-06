import React, { useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { RotateCw } from 'lucide-react';

import {
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/lib/components/dropdown-menu";

import { setLastRefresh, setTotal } from './balanceSlice';
import IcpBalance from './icp';

import {AlexUnlockedBalance} from './alex';
import {AlexLockedBalance} from './alex';

import {LbryUnlockedBalance} from './lbry';
import {LbryLockedBalance} from './lbry';

// Import thunks from sub-slices
import fetchUsdAmount from './usd/thunks/amount';

import fetchIcpAmount from './icp/thunks/amount';
import fetchIcpPrice from '../icp-ledger/thunks/getIcpPrice';

import fetchUnlockedAlex from './alex/thunks/unlocked';
import fetchLockedAlex from './alex/thunks/locked';
import fetchAlexPrice from './alex/thunks/price';

import fetchUnlockedLbry from './lbry/thunks/unlocked';
import fetchLockedLbry from './lbry/thunks/locked';
import { useStripe } from '@/hooks/actors';
import UsdBalance from './usd';

const BalanceDetails = () => {
    const dispatch = useAppDispatch();
    const {actor} = useStripe();

    const { amount: usd } = useAppSelector((state) => state.balance.usd);
    const { amount: icp, price: icpPrice } = useAppSelector((state) => state.balance.icp);
    const { unlocked: unlockedAlex, locked: lockedAlex, price: alexPrice } = useAppSelector((state) => state.balance.alex);

    const refresh = useCallback(() => {
        if(actor) dispatch(fetchUsdAmount(actor));

        dispatch(fetchIcpAmount());
        dispatch(fetchIcpPrice());

        dispatch(fetchUnlockedAlex());
        dispatch(fetchLockedAlex());
        dispatch(fetchAlexPrice());

        dispatch(fetchUnlockedLbry());
        dispatch(fetchLockedLbry());

        dispatch(setLastRefresh());
    }, [actor]);

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

        dispatch(setTotal(Math.max(0,usd) + totalIcpInUSD + totalUnockedAlexInUSD + totalLockedAlexInUSD))
    },[icpPrice, alexPrice, usd, icp, unlockedAlex, lockedAlex, dispatch])

    return (
        <>
            <DropdownMenuLabel className="flex items-center justify-between">
                <span>Balance Details</span>
                <RotateCw size={16} className="cursor-pointer" onClick={refresh} />
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <UsdBalance menu/>

            <IcpBalance menu/>

            <AlexUnlockedBalance menu/>

            <LbryUnlockedBalance menu/>

            <DropdownMenuLabel>Top up Wallet</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <AlexLockedBalance menu/>

            <LbryLockedBalance menu/>
        </>
    );
}

export default BalanceDetails;