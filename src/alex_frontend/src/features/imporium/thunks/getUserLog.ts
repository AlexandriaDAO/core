import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import { TransformedLog } from "../types";
import { transformLogEntry } from "../utils";
import { RootState } from "@/store";
import { _SERVICE } from "../../../../../declarations/emporium/emporium.did";

const getUserLogs = createAsyncThunk<
	{
		logs: TransformedLog[];
		pageSize: number;
		totalPages: number;
		currentPage: number;
	},
	{
		actor: ActorSubclass<_SERVICE>
		page?: number;
		pageSize?: number;
	},
	{ rejectValue: string, state: RootState }
>(
	"imporium/getUserLogs",
	async (
		{ actor, page = 1, pageSize = 10 },
		{ rejectWithValue, getState }
	) => {
		try {

			const {user} = getState().auth;

			if(!user) return rejectWithValue('User is unauthenticated');

			const response = await actor.get_caller_logs(
				[BigInt(page)],
				[BigInt(pageSize)],
				[]
			);

			// Transform the logs
			const transformedLogs = response.logs.map(([timestamp, log]) => transformLogEntry(log, user.principal));

			return {
				logs: transformedLogs,
				pageSize: Number(response.page_size),
				totalPages: Number(response.total_pages),
				currentPage: Number(response.current_page),
			};
		} catch (error) {
			console.error("Error fetching logs:", error);
			return rejectWithValue("An error occurred while fetching logs");
		}
	}
);
export default getUserLogs;
