import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { ECBasicOption } from 'echarts/types/dist/shared';
import { useTheme } from '../../../../providers/ThemeProvider';

interface ChartProps {
    dataXaxis: any;
    dataYaxis: any;
    lineColor: string;
    gardientColor: string;
    name: string;
}

const LineChart: React.FC<ChartProps> = ({
    dataXaxis,
    dataYaxis,
    name,
    lineColor,
    gardientColor
}) => {
    const chartRef1 = useRef<HTMLDivElement | null>(null);
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    useEffect(() => {
        if (chartRef1.current && dataYaxis.length) {
            const myChart1 = echarts.init(chartRef1.current, isDarkMode ? 'dark' : undefined);

            const option1: ECBasicOption = {
                title: {
                    text: '',
                    left: 'left',
                    textStyle: {
                        color: isDarkMode ? '#fff' : '#333',
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: dataXaxis,
                    axisLabel: {
                        color: isDarkMode ? '#ccc' : '#666'
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        color: isDarkMode ? '#ccc' : '#666'
                    }
                },
                dataZoom: [
                    {
                        type: 'inside',
                        start: 0,
                        end: 100
                    },
                    {
                        type: 'slider',
                        start: 0,
                        end: 100
                    }
                ],
                series: [
                    {
                        data: dataYaxis,
                        type: 'line',
                        smooth: true,
                        itemStyle: {
                            color: lineColor
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: gardientColor },
                                { 
                                    offset: 1, 
                                    color: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)' 
                                }
                            ])
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
    }, [dataYaxis, isDarkMode]);

    return (
        <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-[#FFF]'} rounded-3xl border ${isDarkMode ? 'border-gray-700' : 'border-[#F0F0F0]'}`}>
            <div className="p-6 flex md:flex-row flex-col w-full border-b-2 items-center">
                <h3 className={`text-xl font-medium w-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
            </div>
            <div className="p-6 pb-0">
                <p className={`lg:text-lg md:text-base sm:text-sm xs:text-xs font-normal md:pr-5 xs:pr-0 ${isDarkMode ? 'text-gray-300' : 'text-[#525252]'} md:w-9/12 xs:w-full`}>
                    Displaying {name} performance over the past
                </p>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                }}
            >
                <div
                    ref={chartRef1}
                    className={`h-[400px] w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}
                />
            </div>
        </div>
    );
};

export default LineChart;