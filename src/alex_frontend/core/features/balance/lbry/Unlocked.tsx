import React from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { LoaderCircle, LockOpen, RotateCw, ArrowUpFromLine, DollarSign, TriangleAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { DropdownMenuItem } from "@/lib/components/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import fetchUnlockedLbry from './thunks/unlocked';
import Withdraw from './components/Withdraw';

interface LbryUnlockedBalanceProps {
  menu?: boolean;
}

const LbryUnlockedBalance: React.FC<LbryUnlockedBalanceProps> = ({ menu }) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { unlocked, unlockedLoading } = useAppSelector((state) => state.balance.lbry);

	const handleRefresh = () => {
		dispatch(fetchUnlockedLbry());
	};

	if (menu) {
		return (
			<Link to='/swap'>
				<DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
					<LockOpen />
					<span className="flex-grow text-left">LBRY</span>
					{unlockedLoading ? (
						<LoaderCircle size={12} className="animate-spin" />
					) : unlocked >=0 ? unlocked.toFixed(3):(
						<TriangleAlert size={12} />
					)}
				</DropdownMenuItem>
			</Link>
		);
	}

	return (
		<div className="font-roboto-condensed flex justify-between items-center gap-4 p-2 rounded hover:bg-gray-700/30 transition-colors group/lbry">
			<div className="flex-grow flex items-center gap-2">
				<img alt="LBRY logo" src="images/lbry-logo.svg" className="w-6 h-6 border border-ring group-hover/lbry:border-info rounded-full"/>
				{unlocked>=0 && <span className={`font-medium text-gray-300 ${unlockedLoading ? 'opacity-50 cursor-wait':'opacity-100'}`}>{unlocked.toFixed(2)} LBRY</span>}
			</div>
			<div className="flex items-center gap-1.5">
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger asChild>
							<DollarSign 
								size={18} 
								className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" 
								onClick={() => navigate({ to: '/swap' })}
							/>
						</TooltipTrigger>
						<TooltipContent>
							<p>Swap</p>
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

export default LbryUnlockedBalance;