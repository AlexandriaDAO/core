import React from "react";
import { Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/lib/components/button";

interface BalanceDisplayProps {
	lockedBalance: number;
	loading: boolean;
	onRefresh: () => void;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
	lockedBalance,
	loading,
	onRefresh,
}) => {
	const formatBalance = (balance: number): string => {
		if (balance < 0) return "—";
		return balance.toFixed(2);
	};

	return (
		<div className="p-4 bg-card border border-border rounded-xl">
			{/* Header with refresh */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2 text-muted-foreground">
					<Wallet className="w-4 h-4" />
					<span className="text-sm font-medium">Spending Balance</span>
				</div>
				<Button
					variant="ghost"
					scale="sm"
					onClick={onRefresh}
					disabled={loading}
					className="h-7 w-7 p-0"
				>
					<RefreshCw
						className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
					/>
				</Button>
			</div>

			{/* Balance Display */}
			<div className="flex items-baseline gap-2">
				{loading ? (
					<div className="h-8 bg-muted rounded w-24 animate-pulse"></div>
				) : (
					<>
						<span className="text-3xl font-bold text-emerald-500 font-mono tracking-tight">
							{formatBalance(lockedBalance)}
						</span>
						<span className="text-muted-foreground text-sm">LBRY</span>
					</>
				)}
			</div>

			{/* Helper text */}
			{lockedBalance >= 0 && lockedBalance < 1 && !loading && (
				<p className="text-xs text-muted-foreground mt-2">
					Top up your spending balance in the Exchange to play
				</p>
			)}
		</div>
	);
};

export default BalanceDisplay;
