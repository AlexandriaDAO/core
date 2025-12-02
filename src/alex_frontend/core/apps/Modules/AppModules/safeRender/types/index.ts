import { PredictionResults } from '@/apps/Modules/shared/state/arweave/arweaveSlice';

export interface ContentUrlInfo {
  url?: string;
  type?: string;
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

export interface ContentValidatorProps {
  transactionId: string;
  contentUrl: string;
  contentType: string;
  imageObjectUrl: string | null;
  onLoad?: (element: HTMLImageElement | HTMLVideoElement, thumbnailUrl?: string) => void;
}
