

import React, { useEffect } from 'react';
import AlexChart from './alexChart';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getAllLogs from '../../thunks/insights/getAllLogs';

const Insights: React.FC = () => {
    const dispatch = useAppDispatch();
    useEffect(()=>{
        dispatch(getAllLogs());
    },[])
    return (
        <>
            <div className="container px-3 mb-20">
                <h2 className="text-3xl font-bold mb-2">Insights</h2>
                <p className="text-lg font-normal pr-5 text-[#525252] w-9/12">Explore key platform metrics through detailed visual representations, including token performance, holder statistics, supply dynamics, and NFT minting trends.</p>
            </div>
            <div className='container px-3'>
                <div className='flex md:flex-row flex-col'>

                    <AlexChart />


                </div>
            </div>
        </>
    );
};

export default Insights;
