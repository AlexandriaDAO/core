import React, { useEffect } from 'react';
import { useState } from 'react';
import useSession from '@/hooks/useSession';

import "./style.css"

import { useAppSelector } from '@/store/hooks/useAppSelector';

import AccountCards from './components/balance/accountCards';
import BalanceContent from './components/balance/balanceContent';
import SwapContent from './components/swap/swapContent';
import SendContent from './components/send/sendContent';
import BurnContent from './components/burn/burnContent';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getLBRYratio from './thunks/getLBRYratio';
import getMaxLbryBurn from './thunks/getMaxLbryBurn';
import getAlexMintRate from './thunks/tokenomics/getAlexMintRate';
import StakeContent from './components/stake/stakeContent';
import ReceiveContent from './components/receive/receiveContent';

const SwapMain = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector(state => state.auth);
    const swap = useAppSelector(state => state.swap);

    const { actorSwap, actorIcpLedger, actorTokenomics, actorLbry, actorAlex } = useSession();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
   
    const tabs = [
        { id: 1, label: 'Balance', content: <BalanceContent actorAlex={actorAlex} isAuthenticated={isAuthenticated} actorLbry={actorLbry} /> },
        { id: 2, label: 'Swap', content: <SwapContent actorSwap={actorSwap} actorIcpLedger={actorIcpLedger} isAuthenticated={isAuthenticated}  /> },
        { id: 3, label: 'Send', content: <SendContent actorIcpLedger={actorIcpLedger} actorLbry={actorLbry} actorAlex={actorAlex} isAuthenticated={false} /> },
        { id: 4, label: 'Receive', content: <ReceiveContent isAuthenticated={isAuthenticated}  /> },
        { id: 5, label: 'Burn', content: <BurnContent actorSwap={actorSwap} isAuthenticated={isAuthenticated} actorLbry={actorLbry} /> },
        { id: 6, label: 'Stake', content: <StakeContent actorAlex={actorAlex} actorSwap={actorSwap} isAuthenticated={isAuthenticated}  /> },
        // { id: 7, label: 'Transaction history', content: < BalanceContent actorAlex={actorAlex} isAuthenticated={isAuthenticated} actorLbry={actorLbry} /> }
    ];

  


    useEffect(() => {
        const checkIsAuth = async () => {
            if (auth.user === "") {
                setIsAuthenticated(false);
            }
            else {
                setIsAuthenticated(true);
            }
        }
        checkIsAuth();
    }, [auth])

    useEffect(() => {

        dispatch(getLBRYratio({ actor: actorSwap }));
        dispatch(getMaxLbryBurn({ actor: actorSwap }));
        dispatch(getAlexMintRate({ actor: actorTokenomics }))
    }, [])
    useEffect(() => {
        if (swap.burnSuccess === true || swap.swapSuccess === true) {
            dispatch(getLBRYratio({ actor: actorSwap }));
            dispatch(getMaxLbryBurn({ actor: actorSwap }));
            dispatch(getAlexMintRate({ actor: actorTokenomics }))
        }
    }, [swap])
    return (
        <div className='tabs py-10 2xl:py-20 xl:py-16 lg:py-14 md:py-12 sm:py-10'>
            <div className='container px-3'>
                <AccountCards actorIcpLedger={actorIcpLedger} actorSwap={actorSwap} isAuthenticated={isAuthenticated} />
                <div className='tabs-content'>
                    <div className='tabs-content'>
                        <div className="flex border-b mb-5 flex-wrap">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-2 py-2 ${activeTab === tab.id
                                        ? 'text-base 2xl:text-xl font-semibold text-multycolor border-b-2 border-multycolor'
                                        : 'text-gray-500 hover:text-gray-500'} transition-colors duration-300 text-base font-semibold leading-6`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4">
                            {tabs.find(tab => tab.id === activeTab)?.content}
                        </div>
                    </div>


                </div>
            </div>
        </div >
    );
}

export default SwapMain;
