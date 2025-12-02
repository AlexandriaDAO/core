import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
	MinesState,
	SerializableGame,
	SerializableGameSummary,
	SerializableClickResult,
	SerializableCashoutResult,
} from "./types";

const initialState: MinesState = {
	activeGame: null,
	gameLoading: false,
	gameHistory: [],
	historyLoading: false,
	selectedMineCount: 3,
	betAmount: "1",
	isStartingGame: false,
	isClickingTile: false,
	clickingTileIndex: null,
	isCashingOut: false,
	multiplierTable: [],
	error: null,
	isReady: false,
};

const minesSlice = createSlice({
	name: "mines",
	initialState,
	reducers: {
		setActiveGame: (state, action: PayloadAction<SerializableGame | null>) => {
			state.activeGame = action.payload;
		},
		setGameLoading: (state, action: PayloadAction<boolean>) => {
			state.gameLoading = action.payload;
		},
		updateGameAfterClick: (state, action: PayloadAction<SerializableClickResult>) => {
			if (state.activeGame) {
				const result = action.payload;
				state.activeGame.current_multiplier = result.new_multiplier;
				state.activeGame.potential_win = result.potential_win;
				state.activeGame.revealed_count = result.revealed_count;

				const tile = state.activeGame.tiles[result.tile_index];
				if (tile) {
					tile.state = result.is_mine ? { Mine: null } : { Revealed: null };
				}

				if ("Lost" in result.game_status) {
					state.activeGame.status = { Lost: null };
					if (result.server_seed.length > 0) {
						state.activeGame.server_seed = result.server_seed;
					}
					if (result.mine_positions.length > 0) {
						const mineData = result.mine_positions[0];
						if (mineData) {
							mineData.forEach((pos) => {
								if (state.activeGame?.tiles[pos]) {
									state.activeGame.tiles[pos].state = { Mine: null };
								}
							});
						}
					}
				}
			}
		},
		gameEnded: (state, action: PayloadAction<SerializableCashoutResult | null>) => {
			if (action.payload && state.activeGame) {
				state.activeGame.status = { Won: null };
				state.activeGame.server_seed = [action.payload.server_seed];
			}
		},
		clearActiveGame: (state) => {
			state.activeGame = null;
		},
		setGameHistory: (state, action: PayloadAction<SerializableGameSummary[]>) => {
			state.gameHistory = action.payload;
		},
		setHistoryLoading: (state, action: PayloadAction<boolean>) => {
			state.historyLoading = action.payload;
		},
		setSelectedMineCount: (state, action: PayloadAction<number>) => {
			state.selectedMineCount = action.payload;
		},
		setBetAmount: (state, action: PayloadAction<string>) => {
			state.betAmount = action.payload;
		},
		setIsStartingGame: (state, action: PayloadAction<boolean>) => {
			state.isStartingGame = action.payload;
		},
		setIsClickingTile: (state, action: PayloadAction<boolean>) => {
			state.isClickingTile = action.payload;
			if (!action.payload) {
				state.clickingTileIndex = null;
			}
		},
		setClickingTileIndex: (state, action: PayloadAction<number | null>) => {
			state.clickingTileIndex = action.payload;
		},
		setIsCashingOut: (state, action: PayloadAction<boolean>) => {
			state.isCashingOut = action.payload;
		},
		setMultiplierTable: (state, action: PayloadAction<number[]>) => {
			state.multiplierTable = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		clearError: (state) => {
			state.error = null;
		},
		setIsReady: (state, action: PayloadAction<boolean>) => {
			state.isReady = action.payload;
		},
		resetState: () => initialState,
	},
});

export const {
	setActiveGame,
	setGameLoading,
	updateGameAfterClick,
	gameEnded,
	clearActiveGame,
	setGameHistory,
	setHistoryLoading,
	setSelectedMineCount,
	setBetAmount,
	setIsStartingGame,
	setIsClickingTile,
	setClickingTileIndex,
	setIsCashingOut,
	setMultiplierTable,
	setError,
	clearError,
	setIsReady,
	resetState,
} = minesSlice.actions;

export default minesSlice.reducer;
