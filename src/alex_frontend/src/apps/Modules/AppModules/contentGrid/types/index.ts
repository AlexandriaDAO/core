import { PredictionResults } from '@/apps/Modules/shared/state/arweave/arweaveSlice';

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
  predictions?: PredictionResults;
}

export interface MintableState {
  [key: string]: MintableStateItem;
}

export interface ContentValidatorProps {
  transactionId: string;
  contentUrl: string;
  contentType: string;
  imageObjectUrl: string | null;
}
