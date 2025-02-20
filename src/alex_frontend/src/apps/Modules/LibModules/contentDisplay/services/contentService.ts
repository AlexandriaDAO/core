import { Transaction } from "../../../shared/types/queries";
import { contentCache } from "../../../shared/services/contentCacheService";
import { getCover } from "@/utils/epub";
import { CachedContent, ContentUrlInfo } from "../types";

export class ContentService {
  private static contentTypeHandlers: Record<
    string,
    (id: string, content?: CachedContent) => Promise<ContentUrlInfo>
  > = {
    "application/epub+zip": async (id: string) => {
      const coverUrl = await getCover(`https://arweave.net/${id}`);
      return {
        thumbnailUrl: coverUrl,
        coverUrl: coverUrl,
        fullUrl: `https://arweave.net/${id}`,
      };
    },
    "application/pdf": async (id: string) => ({
      thumbnailUrl: null,
      coverUrl: null,
      fullUrl: `https://arweave.net/${id}`,
    }),
    "image/": async (id: string) => {
      const arweaveUrl = `https://arweave.net/${id}`;
      // Add a tiny version of the image (e.g. 20px wide) for initial blur-up effect
      const thumbnailUrl = `https://arweave.net/${id}?ar-size=20`;

      return {
        thumbnailUrl, // Tiny version for blur-up
        coverUrl: arweaveUrl, // Full resolution version
        fullUrl: arweaveUrl,
        needsProcessing: false,
        isProgressive: true, // Flag to indicate this should use progressive loading
      };
    },
    "video/": async (id: string, content?: CachedContent) => ({
      thumbnailUrl: content?.thumbnailUrl || null,
      coverUrl: content?.thumbnailUrl || null,
      fullUrl: `https://arweave.net/${id}`,
    }),
  };

  private static requestQueue: Array<{
    transaction: Transaction;
    resolve: (value: CachedContent) => void;
    reject: (error: unknown) => void;
  }> = [];

  private static isProcessing = false;

  static async loadContent(transaction: Transaction): Promise<CachedContent> {
    // Check cache first
    if (!transaction.assetUrl) {
      // if assetCanister exist , skip contentCache .
      const cached = await contentCache.loadContent(transaction);
      if (cached) return cached;
    }

    // For initial load, just get metadata without processing blobs
    const contentType = transaction.tags.find(
      (tag) => tag.name === "Content-Type"
    )?.value;

    return {
      url:transaction.assetUrl|| `https://arweave.net/${transaction.id}`,
      textContent: null,
      imageObjectUrl: null,
      thumbnailUrl: null,
      error: null,
    };
  }

  private static async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;
    const { transaction, resolve, reject } = this.requestQueue.shift()!;

    try {
      const content = await contentCache.loadContent(transaction);
      resolve(content);
    } catch (error: unknown) {
      reject(error);
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }

  static async getContentUrls(
    transaction: Transaction,
    content?: CachedContent
  ): Promise<ContentUrlInfo> {
    const contentType =
      transaction.tags.find((tag) => tag.name === "Content-Type")?.value ||
      "application/epub+zip";
    const arweaveUrl = transaction.assetUrl|| `https://arweave.net/${transaction.id}`;

    // For images, return direct URLs initially
    if (contentType.startsWith("image/")) {
      return {
        thumbnailUrl: arweaveUrl,
        coverUrl: arweaveUrl,
        fullUrl: arweaveUrl,
        needsProcessing: false,
      };
    }

    // For non-image content, process immediately since it's lightweight
    const handler = Object.entries(this.contentTypeHandlers).find(
      ([key]) => contentType.startsWith(key) && key !== "image/"
    )?.[1];

    if (handler) {
      const result = await handler(transaction.id, content);
      return {
        ...result,
        needsProcessing: false,
      };
    }

    // Default fallback
    return {
      thumbnailUrl: null,
      coverUrl: null,
      fullUrl: arweaveUrl,
      needsProcessing: false,
    };
  }

  static clearTransaction(txId: string): void {
    contentCache.clearTransaction(txId);
  }

  static clearCache(): void {
    contentCache.clearCache();
  }

  // Simplify this method
  static async processVisibleImage(id: string): Promise<ContentUrlInfo> {
    const arweaveUrl = `https://arweave.net/${id}`;
    return {
      thumbnailUrl: arweaveUrl,
      coverUrl: arweaveUrl,
      fullUrl: arweaveUrl,
      needsProcessing: false,
    };
  }
}
