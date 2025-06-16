import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getLbryBalance from '../../features/swap/thunks/lbryIcrc/getLbryBalance';
import getAccountAlexBalance from '../../features/swap/thunks/alexIcrc/getAccountAlexBalance';
import getIcpBal from '@/features/icp-ledger/thunks/getIcpBal';
import { LoaderCircle, ChevronDown, ChevronUp, Wallet, Lock, LockOpen, RotateCw } from 'lucide-react';
import { useAlex, useIcpLedger, useIcpSwapFactory, useLbry, useNftManager } from '@/hooks/actors';

import { Link } from "@tanstack/react-router";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";
import getAlexSpendingBalance from '@/features/swap/thunks/alexIcrc/getAlexSpendingBalance';
import getIcpPrice from '@/features/icp-ledger/thunks/getIcpPrice';
import getAlexPrice from '@/features/swap/thunks/alexIcrc/getAlexPrice';
import getSpendingBalance from '@/features/swap/thunks/lbryIcrc/getSpendingBalance';

const BalanceDisplay: React.FC = () => {
    const {actor: lbryActor} = useLbry();
    const {actor: nftManagerActor} = useNftManager();
    const {actor: icpLedgerActor} = useIcpLedger();
    const {actor: alexActor} = useAlex();
    const {actor: icpSwapFactory} = useIcpSwapFactory();

    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [total, setTotal] = useState<number>(0);
    const {
        lbryBalance,
        spendingBalance,
        alexSpendingBalance,
        loading: swapLoading,
    } = useAppSelector((state) => state.swap);

    const {
        accountBalance: icpBalance,
        icpPrice,
        loading: icpLoading,
    } = useAppSelector((state) => state.icpLedger);

    const {
        alexBal: mainAlexBalance,
        alexPriceUsd,
        loading: alexLoading,
    } = useAppSelector((state) => state.alex);

    const [isExpanded, setIsExpanded] = useState(false);


    const refreshBalances = useCallback(() => {
        if (!user || !icpLedgerActor || !alexActor || !lbryActor || !nftManagerActor) return;

        dispatch(getIcpBal({actor: icpLedgerActor, account: user.principal}));

        dispatch(getAccountAlexBalance({actor: alexActor, account: user.principal}));
        dispatch(getLbryBalance({actor: lbryActor, account: user.principal}));

        dispatch(getAlexSpendingBalance({alexActor, nftManagerActor, userPrincipal: user.principal}));
        dispatch(getSpendingBalance({lbryActor, nftManagerActor, userPrincipal: user.principal}));

        dispatch(getIcpPrice());
        if (!icpSwapFactory) return;
        dispatch(getAlexPrice(icpSwapFactory))
    }, [dispatch, user, icpLedgerActor, alexActor, lbryActor, nftManagerActor, icpSwapFactory]);


    useEffect(() => {
        if (!user || !icpLedgerActor || !alexActor || !lbryActor || !nftManagerActor) return;
        dispatch(getIcpBal({actor: icpLedgerActor, account: user.principal}));

        dispatch(getAccountAlexBalance({actor: alexActor, account: user.principal}));
        dispatch(getLbryBalance({actor: lbryActor, account: user.principal}));

        dispatch(getAlexSpendingBalance({alexActor, nftManagerActor, userPrincipal: user.principal}));
        dispatch(getSpendingBalance({lbryActor, nftManagerActor, userPrincipal: user.principal}));
    }, [user, icpBalance, mainAlexBalance, lbryBalance, icpLedgerActor, alexActor, lbryActor, nftManagerActor]);


    useEffect(() => {
        dispatch(getIcpPrice());
        if (!icpSwapFactory) return;
        dispatch(getAlexPrice(icpSwapFactory))
    }, [icpSwapFactory]);


    useEffect(() => {
        const icpPriceNumber = Number(icpPrice);
        const alexPriceUsdNumber = Number(alexPriceUsd);

        if (!icpPriceNumber || icpPriceNumber <= 0 || !alexPriceUsdNumber || alexPriceUsdNumber <= 0) return;
        const totalIcpInUSD = icpPriceNumber * Number(icpBalance);
        const totalAlexInUSD = alexPriceUsdNumber * Number(mainAlexBalance);

        const total = totalIcpInUSD + totalAlexInUSD;
        setTotal(total);
    }, [icpPrice, alexPriceUsd, icpBalance, mainAlexBalance])


    const formatBalance = (balance: string | number | undefined, decimals = 2) => {
        const num = Number(balance);
        if (balance === undefined || balance === null || isNaN(num) || balance === "0") return (0).toFixed(decimals);
        return num.toFixed(decimals);
    };

    return (
        <DropdownMenu onOpenChange={setIsExpanded}>
            <DropdownMenuTrigger asChild>
                <div className="flex-shrink h-auto w-max flex justify-center items-center gap-1 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 text-white hover:text-white/90 hover:border-white rounded-full cursor-pointer duration-300 transition-all">
                    {total > 0 ? <>
                        <span className="text-gray-400">≈</span>
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
                    <RotateCw size={16} className="cursor-pointer" onClick={refreshBalances} />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <Link to='/swap/balance'>
                    <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
                        <Wallet />
                        <span className="flex-grow text-left">ICP</span>
                        {icpLoading ? <LoaderCircle size={12} className="animate-spin" /> : <span className="pl-4">{formatBalance(icpBalance)}</span>}
                    </DropdownMenuItem>
                </Link>
                <Link to='/swap/balance'>
                    <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
                        <LockOpen />
                        <span className="flex-grow text-left">ALEX</span>
                        {alexLoading ? <LoaderCircle size={12} className="animate-spin" /> : <span className="pl-4">{formatBalance(mainAlexBalance)}</span>}
                    </DropdownMenuItem>
                </Link>
                <Link to='/swap/balance'>
                    <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
                        <LockOpen />
                        <span className="flex-grow text-left">LBRY</span>
                        {swapLoading ? <LoaderCircle size={12} className="animate-spin" /> : <span className="pl-4">{formatBalance(lbryBalance)}</span>}
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuLabel>Top up Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to='/swap/balance'>
                    <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
                        <Lock />
                        <span className="flex-grow text-left">ALEX</span>
                        {swapLoading ? <LoaderCircle size={12} className="animate-spin" /> : <span className="pl-4">{formatBalance(alexSpendingBalance)}</span>}
                    </DropdownMenuItem>
                </Link>
                <Link to='/swap/balance'>
                    <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
                        <Lock />
                        <span className="flex-grow text-left">LBRY</span>
                        {swapLoading ? <LoaderCircle size={12} className="animate-spin" /> : <span className="pl-4">{formatBalance(spendingBalance)}</span>}
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default BalanceDisplay; 