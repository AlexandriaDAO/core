import { natToArweaveId } from "@/utils/id_convert";
import { LogEntry } from "../../../../../declarations/emporium/emporium.did";
export const MARKETPLACE_LBRY_FEE = 20; // MarketPlace fee frontend
export interface TransformedLogEntry {
  timestamp: string;
  token_id: string;
  buyer: string | null;
  seller: string;
  action: LogAction;
}

// Define specific action types
export type LogActionType =
  | "PriceUpdate"
  | "Sold"
  | "ReimbursedToBuyer"
  | "Listed"
  | "Removed";

export interface PriceUpdateAction {
  type: "PriceUpdate";
  oldPrice: string;
  newPrice: string;
}
export interface ListedAction {
  type: "Listed";
  price: string;
}
export interface SoldAction {
  type: "Sold";
  price: string;
}

interface BaseAction {
  type: Exclude<LogActionType, "PriceUpdate">;
}

export type LogAction = PriceUpdateAction | BaseAction;

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
export const transformLogEntry = (log: LogEntry,user:string): TransformedLogEntry => {
   const action: LogAction = (() => {
    if ("PriceUpdate" in log.action) {
      return {
        type: "PriceUpdate",
        oldPrice: log.action.PriceUpdate.old_price.toString(),
        newPrice: log.action.PriceUpdate.new_price.toString(),
      };
    }
    if ("Sold" in log.action) return { type: "Sold",price:log.action.Sold.price,isBuyer:log.buyer.toString()===user?true:false};
    if ("ReimbursedToBuyer" in log.action) return { type: "ReimbursedToBuyer" };
    if ("Listed" in log.action) return { type: "Listed",price:log.action.Listed.price };
    if ("Removed" in log.action) return { type: "Removed" };
    throw new Error("Unknown action type");
  })();

  return {
    timestamp: log.timestamp.toString(),
    token_id: natToArweaveId(BigInt(log.token_id.toString())),
    seller: log.seller.toText(),
    buyer:
      log.buyer.toString() === "2vxsx-fae" //anyomus principal
        ? null
        : log.buyer.toString(),
    action,
  };
};
