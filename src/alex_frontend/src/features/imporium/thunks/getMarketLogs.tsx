import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/emporium/emporium.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { TransformedLog } from "../types";
import { transformLogEntry } from "../utils";

const getMarketLogs = createAsyncThunk<
	{
		logs: TransformedLog[];
		pageSize: number;
		totalPages: number;
		currentPage: number;
	},
	{
		actor: ActorSubclass<_SERVICE>;
		page?: number;
		pageSize?: number;
	},
	{ rejectValue: string }
>(
	"imporium/getMarketLogs",
	async ({ actor, page = 1, pageSize = 10 }, { rejectWithValue }) => {
		try {
			const response = await actor.get_logs(
				[BigInt(page)],
				[BigInt(pageSize)],
				[]
			);

			// Transform the logs
			const transformedLogs = response.logs.map(([timestamp, log]) => transformLogEntry(log, ""));

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
export default getMarketLogs;
