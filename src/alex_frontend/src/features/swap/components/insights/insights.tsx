

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getAllLogs from '../../thunks/insights/getAllLogs';
import LbryBurnChart from './chart';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import LineChart from './chart';

const Insights: React.FC = () => {
    const dispatch = useAppDispatch();
    const chartData = useAppSelector((state) => state.swap.logsData);

    useEffect(() => {
        dispatch(getAllLogs());
    }, [])
    return (
        <>
            <div className="container px-3 lg:mb-20 md:mb-16 sm:mb-14 xs:mb-4">
                <h2 className="text-3xl font-bold mb-2">Insights</h2>
                <p className="lg:text-lg md:text-base xs:text-sm font-normal md:pr-5 xs:pr-0 text-[#525252] md:w-9/12 xs:w-full">Explore key platform metrics through detailed visual representations, including token performance, holder statistics, supply dynamics, and NFT minting trends.</p>
            </div>
            <div className='container px-3'>
                <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 gap-4'>
                    <LineChart name='ALEX Supply' dataXaxis={chartData.chartData.map((data) => data.time)} dataYaxis={chartData.chartData.map((data) => data.alex)} lineColor={'#5470C6'} gardientColor={'#75A0FD4D'} />
                    <LineChart name='LBRY Supply' dataXaxis={chartData.chartData.map((data) => data.time)} dataYaxis={chartData.chartData.map((data) => data.lbry)} lineColor={'#1A9442'} gardientColor={'#1A94424D'} />
                    <LineChart name='LBRY Burned' dataXaxis={chartData.chartData.map((data) => data.time)} dataYaxis={chartData.chartData.map((data) => data.totalLbryBurn)} lineColor={'#B325EB'} gardientColor={'#B325EB4D'} />
                    <LineChart name='ALEX / LBRY' dataXaxis={chartData.chartData.map((data) => data.time)} dataYaxis={chartData.chartData.map((data) => data.alexRate)} lineColor={'#00ccff'} gardientColor={' #b3f0ff'} />
                    <LineChart name='Staked ALEX' dataXaxis={chartData.chartData.map((data) => data.time)} dataYaxis={chartData.chartData.map((data) => data.totalAlexStaked)} lineColor={'#ffcc00'} gardientColor={'#fff5cc'} />
                    <LineChart name='Total Stakers' dataXaxis={chartData.chartData.map((data) => data.time)} dataYaxis={chartData.chartData.map((data) => data.stakerCount)} lineColor={'#669900'} gardientColor={'#ddff99'} />
                    <LineChart name='Minted NFTs' dataXaxis={chartData.chartData.map((data) => data.time)} dataYaxis={chartData.chartData.map((data) => data.nft)} lineColor={'#F0932F'} gardientColor={'#F0932F4D'} />



                </div>
            </div>
        </>
    );
};

export default Insights;
