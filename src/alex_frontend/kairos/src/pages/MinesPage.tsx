import React, { useEffect, useCallback, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import {
	MinesGrid,
	BetControls,
	GameControls,
	MultiplierDisplay,
	BalanceDisplay,
	GameResult,
} from "@/features/mines/components";
import {
	setSelectedMineCount,
	setBetAmount,
	clearActiveGame,
	setMultiplierTable,
	setError,
} from "@/features/mines/minesSlice";
import {
	startGame,
	clickTile,
	cashOut,
	fetchActiveGame,
} from "@/features/mines/thunks";
import locked from "@/features/balance/lbry/thunks/locked";
import { formatLbry, MIN_BET, MAX_BET } from "@/features/mines/types";
import { Alert, AlertDescription } from "@/lib/components/alert";
import { AlertCircle, Loader2, BookOpen, Shield } from "lucide-react";
import { useKairos, useNftManager } from "@/hooks/actors";
import { Link } from "@tanstack/react-router";

const MinesPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const {
		activeGame,
		selectedMineCount,
		betAmount,
		isStartingGame,
		isClickingTile,
		clickingTileIndex,
		isCashingOut,
		multiplierTable,
		error,
	} = useAppSelector((state) => state.mines);

	// Get locked LBRY balance from the balance slice
	const { locked: lockedBalance, lockedLoading } = useAppSelector(
		(state) => state.balance.lbry
	);

	const { actor } = useKairos();
	const { actor: nftManagerActor } = useNftManager();

	// Local state for result modal visibility
	const [showResultModal, setShowResultModal] = useState(true);

	// Fetch locked LBRY balance and active game on load
	useEffect(() => {
		dispatch(locked());
	}, [dispatch]);

	// Fetch active game when actor is ready
	useEffect(() => {
		if (actor) {
			dispatch(fetchActiveGame({ actor }));
		}
	}, [actor, dispatch]);

	const handleRefreshBalance = useCallback(() => {
		dispatch(locked());
	}, [dispatch]);

	// Update multiplier table when mine count changes
	useEffect(() => {
		const safeClicks = 16 - selectedMineCount;
		const table: number[] = [];
		let probability = 1.0;

		for (let i = 0; i < safeClicks; i++) {
			const remainingSafe = 16 - selectedMineCount - i;
			const remainingTotal = 16 - i;
			probability *= remainingSafe / remainingTotal;

			const fairMult = 1 / probability;
			const actualMult = fairMult * (1 - 0.025); // 2.5% house edge
			table.push(Math.round(actualMult * 10000) / 10000);
		}

		dispatch(setMultiplierTable(table));
	}, [selectedMineCount, dispatch]);

	const handleStartGame = useCallback(() => {
		const bet = parseFloat(betAmount);
		if (isNaN(bet) || bet < MIN_BET || bet > MAX_BET) {
			dispatch(
				setError(`Bet must be between ${MIN_BET} and ${MAX_BET} LBRY`)
			);
			return;
		}

		if (!actor) {
			dispatch(setError("Game is loading. Please wait..."));
			return;
		}

		if (!nftManagerActor) {
			dispatch(setError("NFT Manager is loading. Please wait..."));
			return;
		}

		dispatch(
			startGame({
				betAmount: bet,
				mineCount: selectedMineCount,
				actor,
				nftManagerActor,
			})
		);
	}, [betAmount, selectedMineCount, actor, nftManagerActor, dispatch]);

	const handleTileClick = useCallback(
		(index: number) => {
			if (!activeGame || !actor) return;

			dispatch(
				clickTile({
					gameId: activeGame.id,
					tileIndex: index,
					actor,
				})
			);
		},
		[activeGame, actor, dispatch]
	);

	const handleCashOut = useCallback(() => {
		if (!activeGame || !actor) return;

		dispatch(
			cashOut({
				gameId: activeGame.id,
				actor,
			})
		);
	}, [activeGame, actor, dispatch]);

	const handleNewGame = useCallback(() => {
		dispatch(clearActiveGame());
		setShowResultModal(true); // Reset for next game
	}, [dispatch]);

	const handleCloseResultModal = useCallback(() => {
		setShowResultModal(false);
	}, []);

	const isGameEnded =
		activeGame &&
		("Won" in activeGame.status || "Lost" in activeGame.status);

	const showResult = isGameEnded && showResultModal;

	const canCashOut =
		activeGame &&
		"Active" in activeGame.status &&
		activeGame.revealed_count > 0;

	// Show loading state while actors are initializing
	if (!actor || !nftManagerActor) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center font-roboto-condensed">
					<Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
					<p className="text-muted-foreground">Loading game...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="font-roboto-condensed">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-emerald-400 mb-2 tracking-tight">
						Mines
					</h1>
					<p className="text-muted-foreground text-lg">
						Reveal tiles to increase your multiplier. Avoid the
						mines!
					</p>
				</div>

				{/* Error Alert */}
				{error && (
					<Alert variant="destructive" className="mb-6">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Main Layout */}
				<div className="grid lg:grid-cols-[280px_1fr_280px] md:grid-cols-3 gap-6">
					{/* Left Column - Balance & Controls */}
					<div className="space-y-4">
						<BalanceDisplay
							lockedBalance={lockedBalance}
							loading={lockedLoading}
							onRefresh={handleRefreshBalance}
						/>

						{!activeGame && (
							<BetControls
								betAmount={betAmount}
								mineCount={selectedMineCount}
								onBetAmountChange={(value) =>
									dispatch(setBetAmount(value))
								}
								onMineCountChange={(value) =>
									dispatch(setSelectedMineCount(value))
								}
								disabled={isStartingGame}
							/>
						)}

						<GameControls
							hasActiveGame={!!activeGame}
							isGameEnded={!!isGameEnded}
							canCashOut={canCashOut || false}
							isStarting={isStartingGame}
							isCashingOut={isCashingOut}
							onStartGame={handleStartGame}
							onCashOut={handleCashOut}
							onNewGame={handleNewGame}
							potentialWin={
								activeGame
									? formatLbry(activeGame.potential_win)
									: "0"
							}
							multiplier={activeGame?.current_multiplier || 1}
						/>
					</div>

					{/* Center Column - Game Grid */}
					<div className="flex items-start justify-center">
						{activeGame ? (
							<MinesGrid
								game={activeGame}
								onTileClick={handleTileClick}
								disabled={isClickingTile || isCashingOut}
								loadingTileIndex={clickingTileIndex}
							/>
						) : (
							<div className="aspect-square w-full flex items-center justify-center bg-card border border-border rounded-xl">
								<p className="text-muted-foreground">
									Start a game to play
								</p>
							</div>
						)}
					</div>

					{/* Right Column - Multiplier Display */}
					<div className="space-y-4">
						<MultiplierDisplay
							currentMultiplier={
								activeGame?.current_multiplier || 1
							}
							revealedCount={activeGame?.revealed_count || 0}
							mineCount={
								activeGame?.mine_count || selectedMineCount
							}
							multiplierTable={multiplierTable}
						/>

						{/* Game Info */}
						{activeGame && (
							<div className="p-4 bg-card border border-border rounded-xl">
								<div className="text-muted-foreground text-sm font-medium mb-3">
									Game Info
								</div>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Bet:
										</span>
										<span className="font-mono text-foreground">
											{formatLbry(activeGame.bet_amount)}{" "}
											LBRY
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Mines:
										</span>
										<span className="font-mono text-foreground">
											{activeGame.mine_count}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground">
											Seed Hash:
										</span>
										<span
											className="font-mono text-xs text-foreground truncate max-w-[100px]"
											title={activeGame.server_seed_hash}
										>
											{activeGame.server_seed_hash.slice(
												0,
												10
											)}
											...
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Quick Links */}
				<div className="mt-8 flex justify-center gap-4">
					<Link
						to="/rules"
						className="flex items-center gap-2 text-muted-foreground hover:text-emerald-400 transition-colors"
					>
						<BookOpen className="w-4 h-4" />
						<span>Game Rules</span>
					</Link>
					<span className="text-border">|</span>
					<Link
						to="/fairplay"
						className="flex items-center gap-2 text-muted-foreground hover:text-emerald-400 transition-colors"
					>
						<Shield className="w-4 h-4" />
						<span>Provably Fair</span>
					</Link>
				</div>

				{/* Game Result Overlay */}
				{showResult && activeGame && (
					<GameResult
						game={activeGame}
						onNewGame={handleNewGame}
						onClose={handleCloseResultModal}
					/>
				)}
			</div>
		</div>
	);
};

export default MinesPage;
