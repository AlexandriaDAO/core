import React, { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { LoaderCircle, LockOpen, RotateCw, ArrowUpFromLine, DollarSign, TriangleAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { DropdownMenuItem } from "@/lib/components/dropdown-menu";
import { Link } from "@tanstack/react-router";
import fetchUnlockedAlex from './thunks/unlocked';
import fetchAlexPrice from './thunks/price';
import Withdraw from './components/Withdraw';

interface AlexUnlockedBalanceProps {
  menu?: boolean;
}

const AlexUnlockedBalance: React.FC<AlexUnlockedBalanceProps> = ({ menu }) => {
  const dispatch = useAppDispatch();
  const { unlocked, unlockedLoading, price, priceLoading } = useAppSelector((state) => state.balance.alex);

  const handleRefresh = useCallback(() => {
    dispatch(fetchUnlockedAlex());
    dispatch(fetchAlexPrice());
  }, []);

  if (menu) {
    return (
      <Link to='/swap/balance'>
        <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
          <LockOpen />
          <span className="flex-grow text-left">ALEX</span>
          {unlockedLoading ? (
            <LoaderCircle size={12} className="animate-spin" />
          ) : unlocked >=0 ? unlocked.toFixed(2) : (
            <TriangleAlert size={12} />
          )}
        </DropdownMenuItem>
      </Link>
    );
  }

  return (
    <div className="font-roboto-condensed flex justify-between items-center gap-4 p-2 rounded hover:bg-gray-700/30 transition-colors group/alex">
      <div className="flex-grow flex items-center gap-2">
        <img alt="ALEX logo" src="images/alex-logo.svg" className="w-6 h-6 border border-ring group-hover/alex:border-info rounded-full"/>
        {unlocked>=0 && <span className={`font-medium text-gray-300 ${unlockedLoading ? 'opacity-50 cursor-wait':'opacity-100'}`}>{unlocked} ALEX</span>}
      </div>
      {unlocked>=0 && price > 0 &&(
        <span className={`text-gray-200 ${unlockedLoading || priceLoading ? 'opacity-50 cursor-wait':'opacity-100'}`}>
          {(unlocked * price).toFixed(2)} USD
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DollarSign
                size={18}
                className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                // onClick={() => window.open('https://app.icpswap.com/swap?input=ryjl3-tyaaa-aaaaa-aaaba-cai&output=ysy5f-2qaaa-aaaap-qkmmq-cai', '_blank')}
                onClick={() => window.open('https://www.geckoterminal.com/icp/pools/kb4fz-oiaaa-aaaag-qnema-cai', '_blank')}
              />
            </TooltipTrigger>
            <TooltipContent>
              {unlocked > 0 ? <>ALEXUSD≈{price.toFixed(3)}</> : 'View ALEX Price'}
            </TooltipContent>
          </Tooltip>
          <Withdraw />
          <Tooltip>
            <TooltipTrigger asChild>
              <RotateCw size={18} className={`transition-colors text-gray-400  ${unlockedLoading ? 'cursor-not-allowed animate-spin': 'cursor-pointer hover:text-gray-200'}`} onClick={handleRefresh}/>
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

export default AlexUnlockedBalance;