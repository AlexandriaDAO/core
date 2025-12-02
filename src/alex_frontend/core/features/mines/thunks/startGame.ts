import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { lbryToE8s, serializeGame } from "../types";
import type { KairosService, NftManagerService } from "../types";
import {
	setIsStartingGame,
	setActiveGame,
	setError,
} from "../minesSlice";
import { RootState } from "@/store";

// Generate a random client seed
const generateClientSeed = (): string => {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
		""
	);
};

interface StartGameParams {
	betAmount: number;
	mineCount: number;
	actor: KairosService;
	nftManagerActor: NftManagerService;
}

export const startGame = createAsyncThunk<
	{ game_id: string; server_seed_hash: string } | null,
	StartGameParams,
	{ state: RootState }
>(
	"mines/startGame",
	async ({ betAmount, mineCount, actor, nftManagerActor }: StartGameParams, { dispatch }) => {
		dispatch(setIsStartingGame(true));
		dispatch(setError(null));

		try {
			// Get Kairos canister ID from environment
			const kairosCanisterId = process.env.CANISTER_ID_KAIROS;
			if (!kairosCanisterId) {
				throw new Error("Kairos canister ID not found in environment");
			}

			const betAmountE8s = lbryToE8s(betAmount);

			// Step 1: Transfer LBRY from user's locked balance (NFT Manager) to Kairos
			// This calls NFT Manager's spend_for_app function
			const spendResult = await nftManagerActor.spend_for_app(
				Principal.fromText(kairosCanisterId),
				betAmountE8s
			);

			if ("Err" in spendResult) {
				const errorMessage = spendResult.Err;
				throw new Error(`Failed to transfer LBRY: ${errorMessage}`);
			}

			// Step 2: Now start the game in Kairos
			const clientSeed = generateClientSeed();

			const config = {
				bet_amount: betAmountE8s,
				mine_count: mineCount,
				client_seed: clientSeed,
			};

			const result = await actor.start_game(config);

			if ("Err" in result) {
				const error = result.Err;
				const errorMessage =
					typeof error === "object"
						? Object.keys(error)[0]
						: String(error);
				throw new Error(errorMessage);
			}

			// Fetch the active game to get full state
			const gameResult = await actor.get_active_game();
			if (gameResult && gameResult.length > 0 && gameResult[0]) {
				dispatch(setActiveGame(serializeGame(gameResult[0])));
			}

			// Return serializable data only (convert BigInt to string)
			const response = result.Ok;
			return {
				game_id: response.game_id.toString(),
				server_seed_hash: response.server_seed_hash,
			};
		} catch (error: any) {
			dispatch(setError(error.message || "Failed to start game"));
			throw error;
		} finally {
			dispatch(setIsStartingGame(false));
		}
	}
);
