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
    isBuyer?: boolean;
}

export interface BaseAction {
    type: Exclude<LogActionType, "PriceUpdate">;
}

export type LogAction = PriceUpdateAction | ListedAction | SoldAction | BaseAction;

export interface TransformedLog {
    timestamp: string;
    token_id: string;
    buyer: string | null;
    seller: string;
    action: LogAction;
}

