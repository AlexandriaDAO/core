import { createAsyncThunk } from "@reduxjs/toolkit";
import { TransformedLog, transformLogEntry } from "../utlis";
import { _SERVICE } from "../../../../../../declarations/emporium/emporium.did";
import { ActorSubclass } from "@dfinity/agent";

const getEmporiumMarketLogs = createAsyncThunk<
  {
    logs: TransformedLog[], pageSize: string;
    totalPages: string;
    currentPage: string;
  },
  {
    actorEmporium: ActorSubclass<_SERVICE>,
    page?: number;
    searchStr?: string;
    pageSize?: string;
  },
  { rejectValue: string }
>(
  "emporium/getEmporiumMarketLogs",
  async (
    { actorEmporium, page = 1, searchStr = "", pageSize = "10" },
    { rejectWithValue }
  ) => {
    try {
      const logs = await actorEmporium.get_logs(
        [BigInt(page)],
        [BigInt(pageSize)], []

      );

      // Transform the logs
      const transformedLogs = logs.logs.map(([timestamp, log]) => ({
        ...transformLogEntry(log,""), // Spread the transformed
      }));

      return { logs: transformedLogs, pageSize: logs.page_size.toString(), totalPages: logs.total_pages.toString(), currentPage: logs.current_page.toString() };
    } catch (error) {
      console.error("Error fetching logs:", error);
      return rejectWithValue("An error occurred while fetching logs");
    }
  }
);
export default getEmporiumMarketLogs;
