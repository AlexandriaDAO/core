import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "./style.css"

import { useAppSelector } from '@/store/hooks/useAppSelector';
import AccountCards from './components/balance/accountCards';
import BalanceContent from './components/balance/balanceContent';
import TopupContent from './components/topup/topupContent';
import SwapContent from './components/swap/swapContent';
import SendContent from './components/send/sendContent';
import BurnContent from './components/burn/burnContent';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getLBRYratio from './thunks/getLBRYratio';
import getAlexMintRate from './thunks/tokenomics/getAlexMintRate';
import StakeContent from './components/stake/stakeContent';
import ReceiveContent from './components/receive/receiveContent';
import RedeemContent from './components/redeem/redeemContent';
import TransactionHistory from './components/transactionHistory/transactionHistory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import getLbryFee from './thunks/lbryIcrc/getLbryFee';
import getAlexFee from './thunks/alexIcrc/getAlexFee';
import Insights from './components/insights/insights';

const SwapMain = () => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector(state => state.swap);
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 1, path: 'balance', label: 'Balance', hover: null, content: <BalanceContent /> },
        { id: 2, path: 'swap', label: 'Swap', hover: "Swap ICP for LBRY", content: <SwapContent /> },
        { id: 3, path: 'topup', label: 'Topup', hover: "Allocate LBRY that can be spent in-app", content: <TopupContent /> },
        { id: 4, path: 'send', label: 'Send', hover: null, content: <SendContent /> },
        { id: 5, path: 'receive', label: 'Receive', hover: null, content: <ReceiveContent /> },
        { id: 6, path: 'burn', label: 'Burn', hover: "Burn LBRY, get back ALEX and ICP", content: <BurnContent /> },
        { id: 7, path: 'stake', label: 'Stake', hover: null, content: <StakeContent /> },
        { id: 8, path: 'redeem', label: 'Redeem', hover: "Redeem ICP if your swap fails", content: <RedeemContent /> },
        { id: 9, path: 'history', label: 'Transaction history', hover: null, content: <TransactionHistory /> },
        { id: 10, path: 'insights', label: 'Insights', hover: null, content: <Insights /> }
    ];

    const currentPath = location.pathname.split('/').pop() || 'balance';
    const activeTab = tabs.find(tab => tab.path === currentPath)?.id || 1;

    useEffect(() => {
        dispatch(getLBRYratio());
        dispatch(getAlexMintRate());
        dispatch(getLbryFee());
        dispatch(getAlexFee());
        if (localStorage.getItem("tab")) {
            navigate('/swap/stake');
            localStorage.removeItem("tab");
        }
    }, []);

    useEffect(() => {
        if (swap.burnSuccess === true) {
            dispatch(getLBRYratio());
        }
    }, [swap]);

    return (
        <div className='tabs py-10 2xl:py-20 xl:py-16 lg:py-14 md:py-12 sm:py-10'>
            <div className='container px-5'>
                <AccountCards />
                <div className='tabs-content'>
                    <div className='tabs-content'>
                        <div className="flex mb-5 flex-wrap">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => navigate(`/swap/${tab.path}`)}
                                    className={`px-2 py-2 flex items-center ${activeTab === tab.id
                                        ? 'text-base 2xl:text-xl bg-black text-white dark:bg-white dark:text-black px-5'
                                        : 'bg-white text-black dark:bg-black dark:text-white'} transition-colors duration-300 text-base font-semibold leading-6 min-w-24 h-11 border dark:border-gray-700 border-gray-400 rounded-2xl mr-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black px-5 mb-4 z-20`}
                                >
                                    {tab.label}
                                    {tab.hover === null ? (<></>) : (<div className='relative group'>
                                        <FontAwesomeIcon icon={faQuestionCircle} className='text-[#cccccc] dark:text-gray-400 text-2xl ml-3 position-relative' />
                                        <span className='bg-[#C5CFF9] dark:bg-gray-700 text-black dark:text-white p-3 rounded-2xl absolute bottom-12 left-1/2 -translate-x-1/2 text-xs font-light w-52 z-10 invisible group-hover:visible before:content-[" "] before:block before:absolute before:border-l-[10px] before:border-l-transparent before:border-r-[10px] before:border-r-transparent before:border-b-[20px] before:border-b-[#C5CFF9] dark:before:border-b-gray-700 before:rotate-180 before:-bottom-5 before:left-1/2 before:-translate-x-1/2'>{tab.hover}</span>
                                    </div>)}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4">
                            {tabs.find(tab => tab.path === currentPath)?.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SwapMain;
