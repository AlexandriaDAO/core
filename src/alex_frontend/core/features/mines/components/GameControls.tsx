import React from "react";
import { Button } from "@/lib/components/button";
import { Loader2, RotateCcw, Play, Wallet } from "lucide-react";

interface GameControlsProps {
	hasActiveGame: boolean;
	isGameEnded: boolean;
	canCashOut: boolean;
	isStarting: boolean;
	isCashingOut: boolean;
	onStartGame: () => void;
	onCashOut: () => void;
	onNewGame: () => void;
	potentialWin: string;
	multiplier: number;
}

const GameControls: React.FC<GameControlsProps> = ({
	hasActiveGame,
	isGameEnded,
	canCashOut,
	isStarting,
	isCashingOut,
	onStartGame,
	onCashOut,
	onNewGame,
	potentialWin,
	multiplier,
}) => {
	// Show Start Game button when no active game
	if (!hasActiveGame) {
		return (
			<Button
				onClick={onStartGame}
				disabled={isStarting}
				className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:text-white shadow-lg shadow-emerald-600/25"
			>
				{isStarting ? (
					<>
						<Loader2 className="mr-2 h-5 w-5 animate-spin" />
						Starting...
					</>
				) : (
					<>
						<Play className="mr-2 h-5 w-5" />
						Start Game
					</>
				)}
			</Button>
		);
	}

	// Show New Game button when game has ended
	if (isGameEnded) {
		return (
			<Button
				onClick={onNewGame}
				className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white dark:text-white shadow-lg shadow-emerald-600/25"
			>
				<RotateCcw className="mr-2 h-5 w-5" />
				New Game
			</Button>
		);
	}

	// Show Cash Out button during active game
	return (
		<Button
			onClick={onCashOut}
			disabled={!canCashOut || isCashingOut}
			className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white dark:text-white shadow-lg shadow-amber-500/25 disabled:opacity-50"
		>
			{isCashingOut ? (
				<>
					<Loader2 className="mr-2 h-5 w-5 animate-spin" />
					Cashing out...
				</>
			) : (
				<>
					<Wallet className="mr-2 h-5 w-5" />
					Cash Out ({multiplier.toFixed(2)}×)
					<span className="ml-2 font-normal opacity-90">{potentialWin} LBRY</span>
				</>
			)}
		</Button>
	);
};

export default GameControls;
