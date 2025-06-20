import React from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { LoaderCircle, Lock, RotateCw, ArrowUpFromLine, ArrowDownToLine, TriangleAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { DropdownMenuItem } from "@/lib/components/dropdown-menu";
import { Link } from "@tanstack/react-router";
import fetchLockedAlex from './thunks/locked';

interface AlexLockedBalanceProps {
  menu?: boolean;
}

const AlexLockedBalance: React.FC<AlexLockedBalanceProps> = ({ menu }) => {
  const dispatch = useAppDispatch();
  const { locked, lockedLoading, price: alexPrice } = useAppSelector((state) => state.balance.alex);

  const handleRefresh = () => {
    dispatch(fetchLockedAlex());
  };

  if (menu) {
    return (
      <Link to='/swap/balance'>
        <DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
          <Lock />
          <span className="flex-grow text-left">ALEX</span>
          {lockedLoading ? (
            <LoaderCircle size={12} className="animate-spin" />
          ) : (
            <span className="font-mono text-xs">
              {locked} ALEX
            </span>
          )}

					{lockedLoading ? (
						<LoaderCircle size={12} className="animate-spin" />
					) : locked >=0 ? locked.toFixed(3):(
						<TriangleAlert size={12} />
					)}
        </DropdownMenuItem>
      </Link>
    );
  }

  return (
    <div className="font-roboto-condensed flex justify-between items-center gap-4 p-2 rounded hover:bg-gray-700/30 transition-colors group/alex">
      <div className="flex-grow flex items-center gap-2">
        <Lock size={16} className="text-gray-400" />
        {locked>=0 && <span className={`font-medium text-gray-300 ${lockedLoading ? 'opacity-50':'opacity-100'}`}>{locked} ALEX</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <ArrowDownToLine size={18} className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Deposit</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ArrowUpFromLine size={18} className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Withdraw</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <RotateCw size={18} className={`transition-colors text-gray-400  ${lockedLoading ? 'cursor-not-allowed animate-spin': 'cursor-pointer hover:text-gray-200'}`} onClick={handleRefresh}/>
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

export default AlexLockedBalance;