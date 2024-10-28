export interface CachedContent {
  url: string | null;
  textContent: string | null;
  imageObjectUrl: string | null;
  error: string | null;
}

export interface ContentUrlInfo {
  thumbnailUrl: string | null;
  coverUrl: string | null;
  fullUrl: string;
}
