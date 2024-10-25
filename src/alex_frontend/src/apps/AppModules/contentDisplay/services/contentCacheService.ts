import { Transaction } from "../../arweave/types/queries";
import { getArweaveUrl } from "../../arweave/config/arweaveConfig";

export type CachedContent = {
  url: string | null;
  textContent: string | null;
  imageObjectUrl: string | null;
  error: string | null;
};

type ContentCache = Record<string, CachedContent>;

class ContentCacheService {
  private cache: ContentCache = {};

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
export const contentCache = new ContentCacheService();
