import React from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { LoaderCircle, Lock, RotateCw, TriangleAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { DropdownMenuItem } from "@/lib/components/dropdown-menu";
import { Link } from "@tanstack/react-router";
import fetchLockedLbry from './thunks/locked';
import Transfer from './components/Transfer';
import TransferAll from './components/TransferAll';

interface LbryLockedBalanceProps {
  menu?: boolean;
}

const LbryLockedBalance: React.FC<LbryLockedBalanceProps> = ({ menu }) => {
	const dispatch = useAppDispatch();
	const { locked, lockedLoading } = useAppSelector((state) => state.balance.lbry);

	const formatBalance = (balance: string | number | undefined, decimals = 2) => {
		const num = Number(balance);
		if (balance === undefined || balance === null || isNaN(num) || balance === "0") return (0).toFixed(decimals);
		return num.toFixed(decimals);
	};

	const handleRefresh = () => {
		dispatch(fetchLockedLbry());
	};

	if (menu) {
		return (
			<Link to='/swap'>
				<DropdownMenuItem className="cursor-pointer flex justify-between items-center gap-2">
					<Lock />
					<span className="flex-grow text-left">LBRY</span>

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
		<div className="font-roboto-condensed flex justify-between items-center gap-4 p-2 rounded hover:bg-gray-700/30 transition-colors group/lbry">
			<div className="flex-grow flex items-center gap-2">
				<Lock size={16} className="text-gray-400" />
				{locked>=0 &&<span className={`font-medium text-gray-300 ${lockedLoading ? 'opacity-50':'opacity-100'}`}>{formatBalance(locked)} LBRY</span>}
			</div>
			<div className="flex items-center gap-1.5">
				<TooltipProvider delayDuration={0}>
					<Transfer />
					<TransferAll />
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

export default LbryLockedBalance;