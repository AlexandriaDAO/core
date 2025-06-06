import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import getSpendingBalance from '@/features/swap/thunks/lbryIcrc/getSpendingBalance';
import { Link } from 'react-router-dom';
import { useLbry, useNftManager } from '@/hooks/actors';
import { AlertCircle } from 'lucide-react';
import { Alert } from '@/components/Alert';

export function TopupBalanceWarning() {
    const {actor: lbryActor} = useLbry();
    const {actor: nftManagerActor} = useNftManager();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useAppSelector(state => state.auth);
    const { spendingBalance, loading } = useSelector((state: RootState) => state.swap);

    useEffect(() => {
        if (!user || !lbryActor || !nftManagerActor) return;

        dispatch(getSpendingBalance({lbryActor, nftManagerActor, userPrincipal: user.principal}));
    }, [dispatch, user, lbryActor, nftManagerActor]);

    if (loading || !user) return null;

    const hasInsufficientBalance = Number(spendingBalance) < 10;

    if (!hasInsufficientBalance) return null;

    return (
        // <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        //     <div className="flex">
        //         <div className="flex-shrink-0">
        //             <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
        //                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        //             </svg>
        //         </div>
        //         <div className="ml-3 text-sm text-yellow-700 flex flex-col gap-1">
        //             <span>
        //                 You need some LBRY in your topup wallet to access main features.
        //             </span>
        //             <span>
        //                 Your current balance is {spendingBalance} LBRY.
        //             </span>
        //             <Link to="/swap/topup" className="font-medium underline hover:text-yellow-600">
        //                 Top up your wallet here
        //             </Link>
        //         </div>
        //     </div>
        // </div>
        <Alert variant="warning" title="Insufficient Balance" icon={AlertCircle}>
            <span>
                You need some LBRY in your topup wallet to access main features.
            </span>
            <div className="flex justify-start items-center gap-1">
                <span>
                    Your current balance is {spendingBalance} LBRY.
                </span>
                <Link to="/swap/topup" className="font-medium underline hover:text-yellow-600">
                    Top up your wallet here
                </Link>
            </div>
        </Alert>
    );
} 