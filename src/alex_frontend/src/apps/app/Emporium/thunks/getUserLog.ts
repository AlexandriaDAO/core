import { createAsyncThunk } from "@reduxjs/toolkit";
import { TransformedLog, transformLogEntry } from "../utlis";
import { _SERVICE } from "../../../../../../declarations/emporium/emporium.did";
import { ActorSubclass } from "@dfinity/agent";

const getUserLogs = createAsyncThunk<
  {
    logs: TransformedLog[];
    pageSize: string;
    totalPages: string;
    currentPage: string;
  },
  {
    actorEmporium: ActorSubclass<_SERVICE>
    page?: number;
    searchStr?: string;
    pageSize?: string;
    user?: string;
  },
  { rejectValue: string }
>(
  "emporium/getUserLogs",
  async (
    { actorEmporium, page = 1, searchStr = "", user="",pageSize = "10" },
    { rejectWithValue }
  ) => {
    try {
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
