import { getActorEmporium } from "@/features/auth/utils/authUtils";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { LogEntry } from "../../../../../../declarations/emporium/emporium.did";

// Define specific action types
type LogActionType =
  | "PriceUpdate"
  | "Sold"
  | "ReimbursedToBuyer"
  | "Listed"
  | "Removed";

interface PriceUpdateAction {
  type: "PriceUpdate";
  oldPrice: string;
  newPrice: string;
}

interface BaseAction {
  type: Exclude<LogActionType, "PriceUpdate">;
}

export type LogAction = PriceUpdateAction | BaseAction;

interface TransformedLogEntry {
  timestamp: string;
  token_id: string;
  buyer: string | null;
  seller: string;
  action: LogAction;
}

export interface TransformedLog {
  // timestamp: string;
  // log: TransformedLogEntry;
  timestamp: string;
  token_id: string;
  buyer: string | null;
  seller: string;
  action: LogAction;
}

// Transform function with proper type checking
const transformLogEntry = (log: LogEntry): TransformedLogEntry => {
  const action: LogAction = (() => {
    if ("PriceUpdate" in log.action) {
      return {
        type: "PriceUpdate",
        oldPrice: log.action.PriceUpdate.old_price.toString(),
        newPrice: log.action.PriceUpdate.new_price.toString(),
      };
    }
    if ("Sold" in log.action) return { type: "Sold" };
    if ("ReimbursedToBuyer" in log.action) return { type: "ReimbursedToBuyer" };
    if ("Listed" in log.action) return { type: "Listed" };
    if ("Removed" in log.action) return { type: "Removed" };
    throw new Error("Unknown action type");
  })();

  return {
    timestamp: log.timestamp.toString(),
    token_id: log.token_id.toString(),
    seller: log.seller.toText(),
    buyer:
      log.buyer.toString() === "2vxsx-fae" //anyomus principal
        ? null
        : log.buyer.toString(),
    action,
  };
};

const getUserLogs = createAsyncThunk<
  TransformedLog[],
  {
    page?: number;
    searchStr?: string;
    pageSize?: string;
  },
  { rejectValue: string }
>(
  "emporium/getUserLogs",
  async (
    { page = 1, searchStr = "", pageSize = "100" },
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
        ...transformLogEntry(log), // Spread the transformed 
      }));

      return transformedLogs;
    } catch (error) {
      console.error("Error fetching logs:", error);
      return rejectWithValue("An error occurred while fetching logs");
    }
  }
);
export default getUserLogs;
