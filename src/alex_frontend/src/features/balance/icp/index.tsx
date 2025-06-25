import React from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { LoaderCircle, Wallet, RotateCw, DollarSign, TriangleAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { DropdownMenuItem } from "@/lib/components/dropdown-menu";
import { Link } from "@tanstack/react-router";
import fetchIcpAmount from './thunks/amount';
import fetchIcpPrice from './thunks/price';
import Withdraw from './components/Withdraw';

interface IcpBalanceProps {
  menu?: boolean;
}

const IcpBalance: React.FC<IcpBalanceProps> = ({ menu }) => {
  const dispatch = useAppDispatch();
  const { amount, amountLoading, price, priceLoading } = useAppSelector((state) => state.balance.icp);

  const handleRefresh = () => {
    dispatch(fetchIcpAmount());
    dispatch(fetchIcpPrice());
  };

  if (menu) {
    return (
      <Link to='/swap/balance'>
        <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
          <Wallet />
          <span className="flex-grow text-left">ICP</span>
          {amountLoading ? (
            <LoaderCircle size={12} className="animate-spin" />
          ) : amount >=0 ? amount.toFixed(2):(
            <TriangleAlert size={12} />
          )}
        </DropdownMenuItem>
      </Link>
    );
  }

  return (
    <div className="font-roboto-condensed flex justify-between items-center gap-4 p-2 rounded hover:bg-gray-700/30 transition-colors group/icp">
      <div className="flex-grow flex items-center gap-2">
        <div className="p-1 rounded-full bg-[#0172A] flex items-center justify-center border border-ring group-hover/icp:border-info">
          <img alt="Internet Computer" className="w-4 h-4" src="/images/ic.svg" />
        </div>
        <span className={`font-medium text-gray-300 ${amountLoading ? 'opacity-50 cursor-wait':'opacity-100'}`}>{amount>=0 ? amount + ' ICP' : 'ICP'}</span>
      </div>
      {amount>=0 && price > 0 && (
        <span className={`text-gray-200 ${amountLoading || priceLoading ? 'opacity-50 cursor-wait':'opacity-100'}`}>
          {(amount * price).toFixed(3)} USD
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DollarSign
                size="18"
                className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                onClick={() => window.open('https://coinmarketcap.com/currencies/internet-computer/', '_blank')}
              />
            </TooltipTrigger>
            <TooltipContent>
              {price > 0 ? <>ICPUSD≈{price.toFixed(2)}</> : 'View ICP Price'}
            </TooltipContent>
          </Tooltip>
          <Withdraw />
          <Tooltip>
            <TooltipTrigger asChild>
              <RotateCw size="18" className={`transition-colors text-gray-400  ${amountLoading ? 'cursor-not-allowed animate-spin': 'cursor-pointer hover:text-gray-200'}`} onClick={handleRefresh}/>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default IcpBalance;