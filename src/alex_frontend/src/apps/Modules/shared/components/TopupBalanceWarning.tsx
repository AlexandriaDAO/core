import React, { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import getSpendingBalance from '@/features/swap/thunks/lbryIcrc/getSpendingBalance';
import { Link } from '@tanstack/react-router';
import { useLbry, useNftManager } from '@/hooks/actors';
import { AlertCircle } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { useAppDispatch } from '../hooks';

export function TopupBalanceWarning() {
    const {actor: lbryActor} = useLbry();
    const {actor: nftManagerActor} = useNftManager();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [balance, setBalance] = useState<string>("0");

    const fetchBalance = useCallback(async () => {
        if (!user || !lbryActor || !nftManagerActor) return;
        try {
            const spendingBalance = await dispatch(getSpendingBalance({lbryActor, nftManagerActor, userPrincipal: user.principal})).unwrap();
            setBalance(spendingBalance);
        } catch (error) {
            setError(error as string);
        } finally {
            setLoading(false);
        }
    }, [user, lbryActor, nftManagerActor]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    if(loading || !user || !lbryActor || !nftManagerActor || Number(balance) > 10) return null;

    if(error) return (
        <Alert variant="danger" className='w-10/12 mx-auto' title="Error" icon={AlertCircle}>
            <span>
                {error}
            </span>
        </Alert>
    );
    return (
        <Alert variant="warning" className='w-full' title="Insufficient Balance" icon={AlertCircle}>
            <span>
                You need some LBRY in your topup wallet to access main features.
            </span>
            <div className="flex justify-start items-center gap-1">
                <span>
                    Your current balance is {balance} LBRY.
                </span>
                <Link to="/swap/topup" className="font-medium underline hover:text-yellow-600">
                    Top up your wallet here
                </Link>
            </div>
        </Alert>
    );
} 