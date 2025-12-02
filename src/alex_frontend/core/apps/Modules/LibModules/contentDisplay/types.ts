export interface CachedContent {
  url: string | null;
  textContent: string | null;
  imageObjectUrl: string | null;
  thumbnailUrl: string | null;
  error: string | null;
}

export interface ContentUrlInfo {
  thumbnailUrl: string | null;
  coverUrl: string | null;
  fullUrl: string;
  needsProcessing?: boolean;
}

export interface ContentDataItem {
  content?: string;
  urls?: ContentUrlInfo;
  error?: string;
  needsProcessing?: boolean;
}
