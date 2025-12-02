import { createAsyncThunk } from "@reduxjs/toolkit";
import type { KairosService } from "../types";
import { serializeGame } from "../types";
import { setActiveGame, setGameLoading, setError } from "../minesSlice";

interface FetchActiveGameParams {
	actor: KairosService;
}

export const fetchActiveGame = createAsyncThunk(
	"mines/fetchActiveGame",
	async ({ actor }: FetchActiveGameParams, { dispatch }) => {
		dispatch(setGameLoading(true));

		try {
			const result = await actor.get_active_game();
			// Result is Option<Game>, so it's an array with 0 or 1 element
			if (result && result.length > 0 && result[0]) {
				const serializedGame = serializeGame(result[0]);
				dispatch(setActiveGame(serializedGame));
				return serializedGame;
			} else {
				dispatch(setActiveGame(null));
				return null;
			}
		} catch (error: any) {
			dispatch(setError(error.message || "Failed to fetch active game"));
			throw error;
		} finally {
			dispatch(setGameLoading(false));
		}
	}
);
