export const MARKETPLACE_LBRY_FEE = 20; // MarketPlace fee frontend
export interface TransformedLogEntry {
	timestamp: string;
	token_id: string;
	buyer: string | null;
	seller: string;
	action: LogAction;
}

export type LogActionType = "PriceUpdate" | "Sold" | "ReimbursedToBuyer" | "Listed" | "Removed";

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
