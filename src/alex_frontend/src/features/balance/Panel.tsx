import React, { useEffect, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { RotateCw } from 'lucide-react';
import { Button } from "@/lib/components/button";

import { setLastRefresh, setTotal } from './balanceSlice';
import IcpBalance from './icp';
import { AlexUnlockedBalance } from './alex';
import { AlexLockedBalance } from './alex';
import { LbryUnlockedBalance } from './lbry';
import { LbryLockedBalance } from './lbry';

// Import thunks from sub-slices
import fetchIcpAmount from './icp/thunks/amount';
import fetchIcpPrice from './icp/thunks/price';
import fetchUnlockedAlex from './alex/thunks/unlocked';
import fetchLockedAlex from './alex/thunks/locked';
import fetchAlexPrice from './alex/thunks/price';
import fetchUnlockedLbry from './lbry/thunks/unlocked';
import fetchLockedLbry from './lbry/thunks/locked';
import { AlexActor, IcpLedgerActor } from '@/actors';

const BalancePanel = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    // Use balance slice state from new structure
    const { lastRefresh, total } = useAppSelector((state) => state.balance);
    const { amount: icp, price: icpPrice, amountError, amountLoading, priceError, priceLoading } = useAppSelector((state) => state.balance.icp);
    const { unlocked: unlockedAlex, locked: lockedAlex, price: alexPrice } = useAppSelector((state) => state.balance.alex);

    const refresh = useCallback(() => {
        dispatch(fetchIcpAmount());
        dispatch(fetchIcpPrice());
        dispatch(fetchUnlockedAlex());
        dispatch(fetchLockedAlex());
        dispatch(fetchAlexPrice());
        dispatch(fetchUnlockedLbry());
        dispatch(fetchLockedLbry());
        dispatch(setLastRefresh());
    }, [dispatch]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (icpPrice <= 0 || alexPrice <= 0) {
            dispatch(setTotal(-1));
            return;
        }

        const totalIcpInUSD = icpPrice * icp;
        const totalUnlockedAlexInUSD = alexPrice * unlockedAlex;
        const totalLockedAlexInUSD = alexPrice * lockedAlex;

        const totalUSDValue = totalIcpInUSD + totalUnlockedAlexInUSD + totalLockedAlexInUSD;

        dispatch(setTotal(totalUSDValue));
    }, [icpPrice, alexPrice, icp, unlockedAlex, lockedAlex, dispatch]);

    if (!user) return null;

    return (
        <IcpLedgerActor>
            <AlexActor>
                <div className="h-full flex flex-col justify-between font-roboto-condensed">
                    {/* <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">$</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xl font-bold text-white">
                                    {total > 0 ? `$${total.toFixed(2)}` : 'Balance'}
                                </span>
                                <span className="text-sm text-gray-400 font-light">
                                    Total Portfolio Value
                                </span>
                            </div>
                        </div>
                        <Button
                            onClick={refresh}
                            variant="link"
                            scale="sm"
                            className="flex items-center gap-1.5 text-xs"
                        >
                            <span>Refresh</span>
                            <RotateCw size={12} />
                        </Button>
                    </div> */}

                        <div className="group">
                            <div className="flex items-center justify-between">
                                {total > 0 ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-300">Total Portfolio Value</span>
                                        <span className="text-sm font-bold text-green-400">
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-sm font-medium text-gray-300">Available Balances</span>
                                )}
                                <Button
                                    onClick={refresh}
                                    variant="muted"
                                    scale="sm"
                                    className='hover:text-gray-300'
                                >
                                    <span>Refresh</span>
                                    <RotateCw size={12} />
                                </Button>
                            </div>
                            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 space-y-2">
                                <IcpBalance />
                                <AlexUnlockedBalance />
                                <LbryUnlockedBalance />
                            </div>
                        </div>

                        <div className="group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-300">Topup wallet</span>
                            </div>
                            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 space-y-2">
                                <AlexLockedBalance />
                                <LbryLockedBalance />
                            </div>
                        </div>

                </div>
            </AlexActor>
        </IcpLedgerActor>
    );
};

export default BalancePanel;