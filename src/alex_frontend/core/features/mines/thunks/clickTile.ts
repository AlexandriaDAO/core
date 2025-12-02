import { createAsyncThunk } from "@reduxjs/toolkit";
import type { KairosService } from "../types";
import { serializeClickResult } from "../types";
import {
	setIsClickingTile,
	setClickingTileIndex,
	updateGameAfterClick,
	setError,
} from "../minesSlice";

interface ClickTileParams {
	gameId: string;  // String ID from serialized game
	tileIndex: number;
	actor: KairosService;
}

export const clickTile = createAsyncThunk(
	"mines/clickTile",
	async ({ gameId, tileIndex, actor }: ClickTileParams, { dispatch }) => {
		dispatch(setIsClickingTile(true));
		dispatch(setClickingTileIndex(tileIndex));
		dispatch(setError(null));

		try {
			// Convert string ID back to bigint for canister call
			const result = await actor.click_tile(BigInt(gameId), tileIndex);

			if ("Err" in result) {
				const error = result.Err;
				const errorMessage =
					typeof error === "object"
						? Object.keys(error)[0]
						: String(error);
				throw new Error(errorMessage);
			}

			const clickResult = result.Ok;
			const serializedResult = serializeClickResult(clickResult);
			dispatch(updateGameAfterClick(serializedResult));

			// Game result stays visible until user manually starts a new game

			return serializedResult;
		} catch (error: any) {
			dispatch(setError(error.message || "Failed to click tile"));
			throw error;
		} finally {
			dispatch(setIsClickingTile(false));
		}
	}
);
