import { PredictionResults } from "../../../LibModules/arweaveSearch/redux/arweaveSlice";

export interface ContentUrlInfo {
  thumbnailUrl: string | null;
  coverUrl: string | null;
  fullUrl: string;
}

export interface ContentTypeHandler {
  [key: string]: (id: string) => Promise<ContentUrlInfo>;
}

export interface SelectedContent {
  id: string;
  type: string;
}

export interface MintableStateItem {
  mintable: boolean;
  predictions?: PredictionResults;  // Make predictions optional here
}

export interface MintableState {
  [key: string]: MintableStateItem;
}
