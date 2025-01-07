import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';  // Assuming you have a RootState type in your store
import type { ECBasicOption } from 'echarts/types/dist/shared';
import * as echarts from 'echarts';
interface ChartProps{
    dataXaxis:any,
    dataYaxis:any,
    lineColor:string,
    gardientColor:string,
    name:string
}
const LineChart:React.FC<ChartProps> = ({dataXaxis,dataYaxis,name,lineColor,gardientColor}) => {
    const chartRef1 = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        if (chartRef1.current && dataYaxis.length) {
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
                    data: dataXaxis // Using 'time' from chartData
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: dataYaxis, // Using 'alex' from chartData
                        type: 'line',
                        smooth: true,
                        itemStyle: {
                            color: lineColor
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                              {
                                offset: 0,
                                color: gardientColor//'#1A94424D'
                              },
                              {
                                offset: 1,
                                color: 'rgba(255, 255, 255, 0.3)'
                              }
                            ])
                          },
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
    }, [dataYaxis]);

    return (
        <div className='w-full bg-[#FFF] me-3 rounded-3xl border border-[#F0F0F0]'>
            <div className='p-6 flex md:flex-row flex-col w-full border-b-2 items-center '>
                <h3 className='text-xl font-medium w-full'>{name}</h3>
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
                {/* <h3 className='text-xl font-semibold w-full mb-2'>{name} </h3> */}
                <p className='lg:text-lg md:text-base sm:text-sm xs:text-xs font-normal md:pr-5 xs:pr-0 text-[#525252] md:w-9/12 xs:w-full'>Displaying {name} performance over the past </p>
            </div>
            <div className='lg:px-4 overflow-auto'>
            <div
                    style={{
                    overflowX: 'auto', // Enables horizontal scrolling
                    whiteSpace: 'nowrap', // Prevents wrapping of child elements
                    }}
                   />
                <div
                    ref={chartRef1}
                    style={{
                        height: 400,
                        width: '400px',
                        background: '#fff',
                        borderRadius: '8px',
                        padding:'0 8px',
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

export default LineChart;
