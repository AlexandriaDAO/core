// Re-export all types from declarations
export type {
	CashoutResult,
	ClickResult,
	Game,
	GameConfig,
	GameStatus,
	GameSummary,
	StartGameResponse,
	Tile,
	TileState,
	_SERVICE as KairosService,
} from "../../../../declarations/kairos/kairos.did";

export type { _SERVICE as NftManagerService } from "../../../../declarations/nft_manager/nft_manager.did";

// Frontend-specific types
import type {
	Game,
	GameSummary,
	GameStatus,
	TileState,
	ClickResult,
	CashoutResult,
} from "../../../../declarations/kairos/kairos.did";

// Serializable versions of types (BigInt converted to string for Redux)
export interface SerializableTile {
	is_mine: boolean;
	state: TileState;
	index: number;
}

export interface SerializableGame {
	id: string;  // BigInt -> string
	bet_amount: string;  // BigInt -> string (e8s)
	status: GameStatus;
	server_seed: string[];
	tiles: SerializableTile[];
	potential_win: string;  // BigInt -> string (e8s)
	player: string;  // Principal -> string
	client_seed: string;
	revealed_count: number;
	current_multiplier: number;
	created_at: string;  // BigInt -> string
	server_seed_hash: string;
	mine_count: number;
	ended_at: string[];  // BigInt -> string
}

export interface SerializableClickResult {
	is_mine: boolean;
	server_seed: string[];
	potential_win: string;  // BigInt -> string (e8s)
	revealed_count: number;
	game_id: string;
	game_status: GameStatus;
	new_multiplier: number;
	mine_positions: number[][];
	tile_index: number;
}

export interface SerializableCashoutResult {
	bet_amount: string;  // BigInt -> string (e8s)
	server_seed: string;
	final_multiplier: number;
	revealed_count: number;
	game_id: string;
	win_amount: string;  // BigInt -> string (e8s)
	mine_positions: number[];
}

export interface SerializableGameSummary {
	id: string;
	bet_amount: string;  // BigInt -> string (e8s)
	status: GameStatus;
	final_multiplier: number;
	revealed_count: number;
	created_at: string;
	mine_count: number;
	win_amount: string;  // BigInt -> string (e8s)
	ended_at: string[];
}

// Converter functions
export const serializeGame = (game: Game): SerializableGame => ({
	id: game.id.toString(),
	bet_amount: game.bet_amount.toString(),
	status: game.status,
	server_seed: game.server_seed.length > 0 ? [game.server_seed[0]!] : [],
	tiles: game.tiles.map(tile => ({
		is_mine: tile.is_mine,
		state: tile.state,
		index: tile.index,
	})),
	potential_win: game.potential_win.toString(),
	player: game.player.toString(),
	client_seed: game.client_seed,
	revealed_count: game.revealed_count,
	current_multiplier: game.current_multiplier,
	created_at: game.created_at.toString(),
	server_seed_hash: game.server_seed_hash,
	mine_count: game.mine_count,
	ended_at: game.ended_at.length > 0 ? [game.ended_at[0]!.toString()] : [],
});

export const serializeClickResult = (result: ClickResult): SerializableClickResult => ({
	is_mine: result.is_mine,
	server_seed: result.server_seed.length > 0 ? [result.server_seed[0]!] : [],
	potential_win: result.potential_win.toString(),
	revealed_count: result.revealed_count,
	game_id: result.game_id.toString(),
	game_status: result.game_status,
	new_multiplier: result.new_multiplier,
	mine_positions: result.mine_positions.length > 0
		? [Array.from(result.mine_positions[0] as Uint8Array | number[])]
		: [],
	tile_index: result.tile_index,
});

export const serializeCashoutResult = (result: CashoutResult): SerializableCashoutResult => ({
	bet_amount: result.bet_amount.toString(),
	server_seed: result.server_seed,
	final_multiplier: result.final_multiplier,
	revealed_count: result.revealed_count,
	game_id: result.game_id.toString(),
	win_amount: result.win_amount.toString(),
	mine_positions: Array.from(result.mine_positions as Uint8Array | number[]),
});

export const serializeGameSummary = (summary: GameSummary): SerializableGameSummary => ({
	id: summary.id.toString(),
	bet_amount: summary.bet_amount.toString(),
	status: summary.status,
	final_multiplier: summary.final_multiplier,
	revealed_count: summary.revealed_count,
	created_at: summary.created_at.toString(),
	mine_count: summary.mine_count,
	win_amount: summary.win_amount.toString(),
	ended_at: summary.ended_at.length > 0 ? [summary.ended_at[0]!.toString()] : [],
});

export interface MinesState {
	// Active game (serializable)
	activeGame: SerializableGame | null;
	gameLoading: boolean;

	// Game history (serializable)
	gameHistory: SerializableGameSummary[];
	historyLoading: boolean;

	// UI state
	selectedMineCount: number;
	betAmount: string;
	isStartingGame: boolean;
	isClickingTile: boolean;
	clickingTileIndex: number | null;
	isCashingOut: boolean;

	// Multiplier preview
	multiplierTable: number[];

	// Errors
	error: string | null;

	// Canister ready state
	isReady: boolean;
}

// Constants
export const MIN_MINES = 1;
export const MAX_MINES = 15;
export const GRID_SIZE = 16;
export const MIN_BET = 0.01;
export const MAX_BET = 1000;
export const TOKEN_DECIMALS = 8;

// Helpers
export const lbryToE8s = (lbry: number): bigint => {
	return BigInt(Math.floor(lbry * 10 ** TOKEN_DECIMALS));
};

export const e8sToLbry = (e8s: bigint | string): number => {
	const value = typeof e8s === "string" ? BigInt(e8s) : e8s;
	return Number(value) / 10 ** TOKEN_DECIMALS;
};

export const formatLbry = (e8s: bigint | string, decimals: number = 2): string => {
	return e8sToLbry(e8s).toFixed(decimals);
};

// Helper to check GameStatus variants
export const isGameStatus = (status: { Won: null } | { Lost: null } | { Active: null }, check: "Won" | "Lost" | "Active"): boolean => {
	return check in status;
};

// Helper to check TileState variants
export const isTileState = (state: { Mine: null } | { Revealed: null } | { Hidden: null }, check: "Mine" | "Revealed" | "Hidden"): boolean => {
	return check in state;
};
