import { getActorEmporium } from "@/features/auth/utils/authUtils";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { TransformedLog, transformLogEntry } from "../utlis";

const getEmporiumMarketLogs = createAsyncThunk<
  {
    logs: TransformedLog[], pageSize: string;
    totalPages: string;
    currentPage: string;
  },
  {
    page?: number;
    searchStr?: string;
    pageSize?: string;
  },
  { rejectValue: string }
>(
  "emporium/getEmporiumMarketLogs",
  async (
    { page = 1, searchStr = "", pageSize = "10" },
    { rejectWithValue }
  ) => {
    try {
      const actorEmporium = await getActorEmporium();
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
