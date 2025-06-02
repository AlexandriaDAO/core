import { Transaction } from "../../../shared/types/queries";
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
    "application/pdf": async (id: string) => {
      return {
        thumbnailUrl: null,
        coverUrl: null,
        fullUrl: `https://arweave.net/${id}`,
      };
    },
    "image/": async (id: string) => {
      const arweaveUrl = `https://arweave.net/${id}`;
      const thumbnailUrl = `https://arweave.net/${id}?ar-size=20`;
      return {
        thumbnailUrl,
        coverUrl: arweaveUrl,
        fullUrl: arweaveUrl,
        needsProcessing: false,
        isProgressive: true,
      };
    },
    "video/": async (id: string, content?: CachedContent) => ({
      thumbnailUrl: content?.thumbnailUrl || null,
      coverUrl: content?.thumbnailUrl || null,
      fullUrl: `https://arweave.net/${id}`,
    }),
  };

  static async loadContent(transaction: Transaction): Promise<CachedContent> {
    const assetId = transaction.id;
    const source = transaction.assetUrl 
      ? 'icp_direct_url_provided' 
      : 'arweave_direct_fetch';
      
    const resultStatus = transaction.assetUrl 
      ? 'direct_url_metadata_only' 
      : 'arweave_metadata_only';
      
    return {
      url: transaction.assetUrl || `https://arweave.net/${transaction.id}`, 
      textContent: null,
      imageObjectUrl: null,
      thumbnailUrl: null,
      error: null,
    };
  }

  static async getContentUrls(
    transaction: Transaction,
    content?: CachedContent
  ): Promise<ContentUrlInfo> {
    const assetId = transaction.id;
    // const source = transaction.assetUrl ? 'icp_direct_url' : 'arweave_url_generation'; // Removed for log cleanup

    const contentType =
      transaction.tags.find((tag) => tag.name === "Content-Type")?.value ||
      "application/epub+zip";

    let fullUrl: string = transaction.assetUrl || `https://arweave.net/${assetId}`;
    let thumbnailUrl: string | null = null;
    let coverUrl: string | null = null;

    if (contentType.startsWith("image/")) {
      if (transaction.assetUrl) { // Asset is on ICP (or other non-Arweave direct URL)
        thumbnailUrl = transaction.assetUrl;
        coverUrl = transaction.assetUrl;
        // fullUrl is already transaction.assetUrl
        // console.log(`[ContentService_getContentUrls] Using direct assetUrl for ${assetId}: ${transaction.assetUrl}`); // Removed
      } else { // Asset is on Arweave
        // fullUrl is already `https://arweave.net/${assetId}`
        thumbnailUrl = `${fullUrl}?ar-size=200`;
        coverUrl = `${fullUrl}?ar-size=600`;
        // console.log(`[ContentService_getContentUrls] Generated Arweave URLs for ${assetId}: thumb=${thumbnailUrl}, cover=${coverUrl}`); // Removed
      }
      
      // console.timeEnd(`ContentService_getContentUrls_${assetId}_${source}`); // Removed
      return {
        thumbnailUrl,
        coverUrl,
        fullUrl,
        needsProcessing: false,
      };
    }

    const handler = Object.entries(this.contentTypeHandlers).find(
      ([key]) => contentType.startsWith(key) && key !== "image/"
    )?.[1];

    if (handler) {
      const result = await handler(assetId, content);
      // console.timeEnd(`ContentService_getContentUrls_${assetId}_${source}`); // Removed
      return {
        thumbnailUrl: result.thumbnailUrl,
        coverUrl: result.coverUrl,
        fullUrl: result.fullUrl || fullUrl,
        needsProcessing: result.needsProcessing !== undefined ? result.needsProcessing : false,
      };
    }

    // Fallback for unhandled content types
    // const source = transaction.assetUrl ? 'icp_direct_url' : 'arweave_url_generation'; // Re-evaluating if needed for fallback path
    // console.timeEnd(`ContentService_getContentUrls_${assetId}_${source}`); // Removed
    return {
      thumbnailUrl: null,
      coverUrl: null,
      fullUrl: fullUrl,
      needsProcessing: false,
    };
  }

  static clearTransaction(txId: string): void {
    // console.log(`[ContentService] clearTransaction called for ${txId}, but contentCache is no longer used.`); // Removed
  }

  static clearCache(): void {
    // console.log("[ContentService] clearCache called, but contentCache is no longer used."); // Removed
  }

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
