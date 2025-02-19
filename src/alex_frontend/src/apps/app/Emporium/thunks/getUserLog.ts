import { getActorEmporium } from "@/features/auth/utils/authUtils";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { TransformedLog, transformLogEntry } from "../utlis";

const getUserLogs = createAsyncThunk<
  {
    logs: TransformedLog[];
    pageSize: string;
    totalPages: string;
    currentPage: string;
  },
  {
    page?: number;
    searchStr?: string;
    pageSize?: string;
    user?: string;
  },
  { rejectValue: string }
>(
  "emporium/getUserLogs",
  async (
    { page = 1, searchStr = "", user="",pageSize = "10" },
    { rejectWithValue }
  ) => {
    try {
      const actorEmporium = await getActorEmporium();
      const logs = await actorEmporium.get_caller_logs(
        [BigInt(page)],
        [BigInt(pageSize)],
        []
      );

      // Transform the logs
      const transformedLogs = logs.logs.map(([timestamp, log]) => ({
        ...transformLogEntry(log,user), // Spread the transformed
      }));

      return {
        logs: transformedLogs,
        pageSize: logs.page_size.toString(),
        totalPages: logs.total_pages.toString(),
        currentPage: logs.current_page.toString(),
      };
    } catch (error) {
      console.error("Error fetching logs:", error);
      return rejectWithValue("An error occurred while fetching logs");
    }
  }
);
export default getUserLogs;
