import React, { useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { LoaderCircle, Wallet, RotateCw, DollarSign, TriangleAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { DropdownMenuItem } from "@/lib/components/dropdown-menu";
import { Link } from "@tanstack/react-router";
import fetchUsdAmount from './thunks/amount';
import Swap from './components/Swap';
import Deposit from './components/Deposit';
import { useStripe } from '@/hooks/actors';

interface UsdBalanceProps {
  menu?: boolean;
}

const UsdBalance: React.FC<UsdBalanceProps> = ({ menu }) => {
  const dispatch = useAppDispatch();
  const {actor} = useStripe();
  const { amount, amountLoading } = useAppSelector((state) => state.balance.usd);

  const handleRefresh = useCallback(() => {
    if(!actor ) return;
    dispatch(fetchUsdAmount(actor));
  }, [actor]);

  useEffect(()=>{
    handleRefresh();
  }, [handleRefresh])

  if (menu) {
    return (
      <Link to='/swap'>
        <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
          <Wallet />
          <span className="flex-grow text-left">USD</span>
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
        <div className="rounded-full bg-[#0172A] flex items-center justify-center border border-ring group-hover/icp:border-info">
          <img alt="USD" className="w-5 h-5" src="/images/usd.svg" />
        </div>
        <span className={`font-medium text-gray-300 ${amountLoading ? 'opacity-50 cursor-wait':'opacity-100'}`}>{amount>=0 ? amount + ' USD' : 'USD'}</span>
      </div>
      {amount>=0 && (
        <span className={`text-gray-200 ${amountLoading ? 'opacity-50 cursor-wait':'opacity-100'}`}>
          {(amount).toFixed(3)} USD
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <TooltipProvider delayDuration={0}>
          <Swap />
          <Deposit />
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

export default UsdBalance;