import React from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import LineChart from '@/features/insights/components/LineChart';
import { Alert } from '@/components/Alert';
import { HelpCircle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/lib/components/tooltip';

const InsightsPage: React.FC = () => {
  const { data, loading, error } = useAppSelector((state) => state.insights);

  if (loading) {
    return (
      <div className='p-6 flex-grow flex items-center justify-center bg-card rounded-bordertb shadow'>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Loading insights data...</span>
        </div>
      </div>
    );
  }

  if(error) return (
    <div className='p-6 flex-grow flex items-center justify-center bg-card rounded-bordertb shadow'>
      <div className="max-w-2xl flex-grow container flex justify-center items-start">
          <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
      </div>
    </div>
  )

  if(!data || data.length <= 0) return (
    <div className='p-6 flex-grow flex items-center justify-center bg-card rounded-bordertb shadow'>
      <div className="max-w-2xl flex-grow container flex justify-center items-start">
          <Alert variant="default" title="Empty" className="w-full">No data to show..</Alert>
      </div>
    </div>
  )

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      <LineChart name='ALEX Supply' dataXaxis={data.map((item) => item.time)} dataYaxis={data.map((item) => item.alex)} lineColor={'#5470C6'} gardientColor={'#75A0FD4D'} />
      <LineChart name='LBRY Supply' dataXaxis={data.map((item) => item.time)} dataYaxis={data.map((item) => item.lbry)} lineColor={'#1A9442'} gardientColor={'#1A94424D'} />
      <LineChart name='LBRY Burned' dataXaxis={data.map((item) => item.time)} dataYaxis={data.map((item) => item.totalLbryBurn)} lineColor={'#B325EB'} gardientColor={'#B325EB4D'} />
      <LineChart name='ALEX / LBRY' dataXaxis={data.map((item) => item.time)} dataYaxis={data.map((item) => item.alexRate)} lineColor={'#00ccff'} gardientColor={' #b3f0ff'} />
      <LineChart name='Staked ALEX' dataXaxis={data.map((item) => item.time)} dataYaxis={data.map((item) => item.totalAlexStaked)} lineColor={'#ffcc00'} gardientColor={'#fff5cc'} />
      <LineChart name='Total Stakers' dataXaxis={data.map((item) => item.time)} dataYaxis={data.map((item) => item.stakerCount)} lineColor={'#669900'} gardientColor={'#ddff99'} />
      <LineChart name='Minted NFTs' dataXaxis={data.map((item) => item.time)} dataYaxis={data.map((item) => item.nft)} lineColor={'#F0932F'} gardientColor={'#F0932F4D'} />
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <HelpCircle size={16} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Historical APY calculated using current market prices.<br />
                  Shows reward rate trends over time in today's USD values.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <LineChart name='Staking APY (%)' dataXaxis={data.map((item) => item.time)} dataYaxis={data.map((item) => item.rewardRate)} lineColor={'#FF1493'} gardientColor={'#FFB6C14D'} />
      </div>
    </div>
  );
};

export default InsightsPage;