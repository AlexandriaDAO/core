import { createAsyncThunk } from "@reduxjs/toolkit";
import type { KairosService } from "../types";
import { serializeCashoutResult } from "../types";
import {
	setIsCashingOut,
	gameEnded,
	setError,
} from "../minesSlice";

interface CashOutParams {
	gameId: string;  // String ID from serialized game
	actor: KairosService;
}

export const cashOut = createAsyncThunk(
	"mines/cashOut",
	async ({ gameId, actor }: CashOutParams, { dispatch }) => {
		dispatch(setIsCashingOut(true));
		dispatch(setError(null));

		try {
			// Convert string ID back to bigint for canister call
			const result = await actor.cash_out(BigInt(gameId));

			if ("Err" in result) {
				const error = result.Err;
				const errorMessage =
					typeof error === "object"
						? Object.keys(error)[0]
						: String(error);
				throw new Error(errorMessage);
			}

			const cashoutResult = result.Ok;
			const serializedResult = serializeCashoutResult(cashoutResult);
			dispatch(gameEnded(serializedResult));

			// Game result stays visible until user manually starts a new game

			return serializedResult;
		} catch (error: any) {
			dispatch(setError(error.message || "Failed to cash out"));
			throw error;
		} finally {
			dispatch(setIsCashingOut(false));
		}
	}
);
