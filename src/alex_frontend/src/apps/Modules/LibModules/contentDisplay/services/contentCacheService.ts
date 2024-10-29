import { Transaction } from "../../../shared/types/queries";
import { getArweaveUrl } from "../../arweaveSearch/config/arweaveConfig";
import { CachedContent } from '../types';

type ContentCache = Record<string, CachedContent>;

class ContentCacheService {
  private static instance: ContentCacheService;
  private maxCacheSize: number;
  private cache: ContentCache = {};

  private constructor(maxCacheSize = 100) {
    this.maxCacheSize = maxCacheSize;
    this.cache = {};
  }

  public static getInstance(): ContentCacheService {
    if (!ContentCacheService.instance) {
      ContentCacheService.instance = new ContentCacheService();
    }
    return ContentCacheService.instance;
  }

  private pruneCache() {
    const entries = Object.entries(this.cache);
    if (entries.length > this.maxCacheSize) {
      // Remove oldest entries
      const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
      toRemove.forEach(([txId, content]) => {
        if (content.imageObjectUrl) {
          URL.revokeObjectURL(content.imageObjectUrl);
        }
        delete this.cache[txId];
      });
    }
  }

  async loadContent(transaction: Transaction): Promise<CachedContent> {
    const txId = transaction.id;
    
    // Return cached content if it exists
    if (this.cache[txId]) {
      return this.cache[txId];
    }

    try {
      const contentType = transaction.tags.find((tag) => tag.name === 'Content-Type')?.value || 'image/jpeg';
      const url = getArweaveUrl(txId);

      let content: CachedContent;

      if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        content = {
          url,
          textContent: null,
          imageObjectUrl: objectUrl,
          error: null,
        };
      } else if (['text/plain', 'text/markdown', 'application/json', 'text/html'].includes(contentType)) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const textContent = await response.text();
        content = {
          url,
          textContent,
          imageObjectUrl: null,
          error: null,
        };
      } else {
        content = {
          url,
          textContent: null,
          imageObjectUrl: null,
          error: null,
        };
      }

      this.cache[txId] = content;
      this.pruneCache();
      return content;

    } catch (error) {
      const errorContent = {
        url: null,
        textContent: null,
        imageObjectUrl: null,
        error: 'Failed to load content. Please try again later.',
      };
      this.cache[txId] = errorContent;
      return errorContent;
    }
  }

  getContent(txId: string): CachedContent | undefined {
    return this.cache[txId];
  }

  clearCache() {
    // Cleanup object URLs before clearing cache
    Object.values(this.cache).forEach(content => {
      if (content.imageObjectUrl) {
        URL.revokeObjectURL(content.imageObjectUrl);
      }
    });
    this.cache = {};
  }

  clearTransaction(txId: string) {
    const content = this.cache[txId];
    if (content?.imageObjectUrl) {
      URL.revokeObjectURL(content.imageObjectUrl);
    }
    delete this.cache[txId];
  }
}

// Export a singleton instance
export const contentCache = ContentCacheService.getInstance();
