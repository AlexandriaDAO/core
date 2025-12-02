import React from "react";
import type { SerializableGame } from "../types";
import { formatLbry } from "../types";
import { cn } from "@/lib/utils";
import { Trophy, Skull, Copy, Check, X } from "lucide-react";
import { Button } from "@/lib/components/button";

interface GameResultProps {
	game: SerializableGame;
	onNewGame: () => void;
	onClose: () => void;
}

const GameResult: React.FC<GameResultProps> = ({ game, onNewGame, onClose }) => {
	const [copied, setCopied] = React.useState(false);
	const isWin = "Won" in game.status;
	const serverSeed = game.server_seed.length > 0 ? game.server_seed[0] : null;

	const handleCopySeeds = () => {
		const seedInfo = `Server Seed: ${serverSeed}\nServer Seed Hash: ${game.server_seed_hash}\nClient Seed: ${game.client_seed}`;
		navigator.clipboard.writeText(seedInfo);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70",
				"animate-in fade-in duration-300"
			)}
			onClick={onClose}
		>
			<div
				className={cn(
					"max-w-md w-full p-6 rounded-2xl relative",
					isWin ? "bg-emerald-900/90" : "bg-red-900/90"
				)}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
				>
					<X className="w-5 h-5 text-gray-400 hover:text-white" />
				</button>

				{/* Icon */}
				<div className="flex justify-center mb-4">
					{isWin ? (
						<Trophy className="w-16 h-16 text-amber-400" />
					) : (
						<Skull className="w-16 h-16 text-red-400" />
					)}
				</div>

				{/* Title */}
				<h2
					className={cn(
						"text-3xl font-bold text-center mb-2",
						isWin ? "text-emerald-300" : "text-red-300"
					)}
				>
					{isWin ? "You Won!" : "Game Over"}
				</h2>

				{/* Stats */}
				<div className="space-y-2 mb-4">
					<div className="flex justify-between text-gray-300">
						<span>Bet Amount:</span>
						<span className="font-mono">{formatLbry(game.bet_amount)} LBRY</span>
					</div>
					{isWin && (
						<>
							<div className="flex justify-between text-gray-300">
								<span>Multiplier:</span>
								<span className="font-mono">{game.current_multiplier.toFixed(2)}×</span>
							</div>
							<div className="flex justify-between text-emerald-300 font-bold">
								<span>Won:</span>
								<span className="font-mono">{formatLbry(game.potential_win)} LBRY</span>
							</div>
						</>
					)}
					<div className="flex justify-between text-gray-300">
						<span>Tiles Revealed:</span>
						<span className="font-mono">{game.revealed_count}</span>
					</div>
				</div>

				{/* Provably Fair */}
				{serverSeed && (
					<div className="mb-4 p-3 bg-black/30 rounded-lg">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-400">Provably Fair</span>
							<Button
								variant="ghost"
								scale="sm"
								onClick={handleCopySeeds}
								className="h-6 px-2"
							>
								{copied ? (
									<Check className="w-4 h-4 text-emerald-400" />
								) : (
									<Copy className="w-4 h-4" />
								)}
							</Button>
						</div>
						<div className="text-xs font-mono text-gray-400 break-all">
							<div>Server: {serverSeed.slice(0, 20)}...</div>
							<div>Hash: {game.server_seed_hash.slice(0, 20)}...</div>
						</div>
					</div>
				)}

				{/* New Game Button */}
				<Button
					onClick={onNewGame}
					className={cn(
						"w-full",
						isWin
							? "bg-emerald-600 hover:bg-emerald-700"
							: "bg-red-600 hover:bg-red-700"
					)}
				>
					Play Again
				</Button>
			</div>
		</div>
	);
};

export default GameResult;
