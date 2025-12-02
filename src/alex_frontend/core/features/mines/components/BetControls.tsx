import React from "react";
import { MIN_MINES, MAX_MINES, MIN_BET, MAX_BET } from "../types";
import { Label } from "@/lib/components/label";
import { Input } from "@/lib/components/input";
import { Slider } from "@/lib/components/slider";
import { Button } from "@/lib/components/button";
import { Bomb, Coins } from "lucide-react";

interface BetControlsProps {
	betAmount: string;
	mineCount: number;
	onBetAmountChange: (value: string) => void;
	onMineCountChange: (value: number) => void;
	disabled: boolean;
}

const BetControls: React.FC<BetControlsProps> = ({
	betAmount,
	mineCount,
	onBetAmountChange,
	onMineCountChange,
	disabled,
}) => {
	const handleHalf = () => {
		const current = parseFloat(betAmount) || 0;
		const newValue = Math.max(MIN_BET, current / 2);
		onBetAmountChange(newValue.toString());
	};

	const handleDouble = () => {
		const current = parseFloat(betAmount) || 0;
		const newValue = Math.min(MAX_BET, current * 2);
		onBetAmountChange(newValue.toString());
	};

	const handleMin = () => {
		onBetAmountChange(MIN_BET.toString());
	};

	const handleMax = () => {
		onBetAmountChange(MAX_BET.toString());
	};

	return (
		<div className="space-y-5 p-5 bg-card border border-border rounded-xl shadow-sm">
			{/* Bet Amount */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<Coins className="w-4 h-4 text-emerald-500" />
					<Label htmlFor="betAmount" className="text-foreground font-medium text-sm">
						Bet Amount
					</Label>
					<span className="text-muted-foreground text-xs ml-auto">LBRY</span>
				</div>
				<div className="relative">
					<Input
						id="betAmount"
						type="number"
						value={betAmount}
						onChange={(e) => onBetAmountChange(e.target.value)}
						min={MIN_BET}
						max={MAX_BET}
						step="0.01"
						disabled={disabled}
						className="font-mono text-lg h-12 pr-4 bg-background border-border focus:border-emerald-500 focus:ring-emerald-500/20"
					/>
				</div>
				<div className="grid grid-cols-4 gap-2">
					<Button
						variant="outline"
						scale="sm"
						onClick={handleMin}
						disabled={disabled}
						className="text-xs font-medium hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400"
					>
						Min
					</Button>
					<Button
						variant="outline"
						scale="sm"
						onClick={handleHalf}
						disabled={disabled}
						className="text-xs font-medium hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400"
					>
						½
					</Button>
					<Button
						variant="outline"
						scale="sm"
						onClick={handleDouble}
						disabled={disabled}
						className="text-xs font-medium hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400"
					>
						2×
					</Button>
					<Button
						variant="outline"
						scale="sm"
						onClick={handleMax}
						disabled={disabled}
						className="text-xs font-medium hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400"
					>
						Max
					</Button>
				</div>
			</div>

			{/* Divider */}
			<div className="border-t border-border" />

			{/* Mine Count */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Bomb className="w-4 h-4 text-red-500" />
						<Label className="text-foreground font-medium text-sm">Mines</Label>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-2xl font-bold text-foreground font-mono">{mineCount}</span>
						<span className="text-xs text-muted-foreground">/ 15</span>
					</div>
				</div>
				<Slider
					value={[mineCount]}
					onValueChange={(values) => onMineCountChange(values[0])}
					min={MIN_MINES}
					max={MAX_MINES}
					step={1}
					disabled={disabled}
					className="py-2"
				/>
				<div className="flex justify-between text-xs">
					<span className="text-emerald-600 dark:text-emerald-400 font-medium">Low Risk</span>
					<span className="text-red-500 font-medium">High Risk</span>
				</div>
			</div>

			{/* Risk Indicator */}
			<div className="p-3 rounded-lg bg-muted/50 border border-border">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Risk Level:</span>
					<span className={`font-medium ${
						mineCount <= 3 ? "text-emerald-600 dark:text-emerald-400" :
						mineCount <= 7 ? "text-yellow-600 dark:text-yellow-400" :
						mineCount <= 11 ? "text-orange-600 dark:text-orange-400" :
						"text-red-600 dark:text-red-400"
					}`}>
						{mineCount <= 3 ? "Low" :
						 mineCount <= 7 ? "Medium" :
						 mineCount <= 11 ? "High" :
						 "Extreme"}
					</span>
				</div>
				<div className="flex items-center justify-between text-sm mt-1">
					<span className="text-muted-foreground">Safe Tiles:</span>
					<span className="font-mono text-foreground">{16 - mineCount}</span>
				</div>
			</div>
		</div>
	);
};

export default BetControls;
