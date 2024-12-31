import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';  // Assuming you have a RootState type in your store
import type { ECBasicOption } from 'echarts/types/dist/shared';
import * as echarts from 'echarts';

const AlexChart = () => {
    const chartRef1 = useRef<HTMLDivElement | null>(null);

    const chartData = useSelector((state: RootState) => state.swap.logsData);

    useEffect(() => {
        if (chartRef1.current && chartData.chartData.length) {
            const myChart1 = echarts.init(chartRef1.current);

            const option1: ECBasicOption = {
                title: {
                    text: '',
                    left: 'left',
                    textStyle: {
                        color: '#333',
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: chartData.chartData.map((data) => data.time) // Using 'time' from chartData
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: chartData.chartData.map((data) => data.alex), // Using 'alex' from chartData
                        type: 'line',
                        smooth: true,
                        itemStyle: {
                            color: '#5470C6'
                        }
                    }
                ]
            };

            myChart1.setOption(option1);

            const handleResize = () => {
                myChart1.resize();
            };
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                myChart1.dispose();
            };
        }
    }, [chartData]);

    return (
        <div className='w-full bg-[#FFF] me-3 rounded-3xl border border-[#F0F0F0]'>
            <div className='p-6 flex md:flex-row flex-col w-full border-b-2 items-center '>
                {/* <h3 className='text-xl font-medium w-full'>Alex Token</h3> */}
                {/* <select
                    className="block px-4 py-2 text-base text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                > */}
                    {/* <option value="">Monthly</option> */}
                    {/* <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option> */}
                {/* </select> */}
            </div>
            <div className='p-6 pb-0'>
                <h3 className='text-xl font-semibold w-full mb-2'>Alex Token Supply </h3>
                <p className='text-lg font-normal pr-5 text-[#525252] w-9/12'>Displaying Alex Token performance over the past </p>
            </div>
            <div className='px-4'>
                <div
                    ref={chartRef1}
                    style={{
                        height: 400,
                        width: '100%',
                        background: '#fff',
                        borderRadius: '8px'
                    }}
                />
                {/* <div style={{ textAlign: 'left', color: '#333', fontSize: '14px', fontWeight: 'bold', padding: "10px 0 20px" }}>
                    Trending up by 5.2% this month
                    <div className=' text-sm font-normal text-[#525252] mt-2'>
                        January - June 2024
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default AlexChart;
