import { Transaction } from "../../../shared/types/queries";
import { contentCache } from "./contentCacheService";
import { fileTypeCategories } from "@/apps/Modules/shared/types/files";
import { MintableStateItem } from "@/apps/Modules/shared/state/arweave/arweaveSlice";
import { getCover } from "@/utils/epub";
import { CachedContent, ContentUrlInfo } from '../types';

const initialPredictions = {
  Drawing: 0,
  Hentai: 0,
  Neutral: 0,
  Porn: 0,
  Sexy: 0,
  isPorn: false
};

export class ContentService {
  private static contentTypeHandlers: Record<string, (id: string, content?: CachedContent) => Promise<ContentUrlInfo>> = {
    "application/epub+zip": async (id: string) => {
      const coverUrl = await getCover(`https://arweave.net/${id}`);
      return {
        thumbnailUrl: coverUrl,
        coverUrl: coverUrl,
        fullUrl: `https://arweave.net/${id}`
      };
    },
    "application/pdf": async (id: string) => ({
      thumbnailUrl: null,
      coverUrl: null,
      fullUrl: `https://arweave.net/${id}`
    }),
    "image/": async (id: string, content?: CachedContent) => ({
      thumbnailUrl: content?.imageObjectUrl || `https://arweave.net/${id}`,
      coverUrl: content?.imageObjectUrl || `https://arweave.net/${id}`,
      fullUrl: content?.imageObjectUrl || `https://arweave.net/${id}`,
    }),
    "video/": async (id: string) => ({
      thumbnailUrl: null,
      coverUrl: null,
      fullUrl: `https://arweave.net/${id}`
    }),
  };

  static async loadContent(transaction: Transaction): Promise<CachedContent> {
    return contentCache.loadContent(transaction);
  }

  static async getContentUrls(
    transaction: Transaction, 
    content?: CachedContent
  ): Promise<ContentUrlInfo> {
    const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
    
    // Find the matching handler
    const handler = Object.entries(this.contentTypeHandlers)
      .find(([key]) => contentType.startsWith(key))?.[1];

    if (handler) {
      return handler(transaction.id, content);
    }

    // Default fallback
    return {
      thumbnailUrl: null,
      coverUrl: null,
      fullUrl: `https://arweave.net/${transaction.id}`
    };
  }

  static getInitialMintableStates(transactions: Transaction[]): Record<string, MintableStateItem> {
    return transactions.reduce((acc, transaction) => {
      const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "image/jpeg";
      const requiresValidation = [...fileTypeCategories.images, ...fileTypeCategories.video].includes(contentType);
      acc[transaction.id] = { 
        mintable: !requiresValidation,
        predictions: initialPredictions
      };
      return acc;
    }, {} as Record<string, MintableStateItem>);
  }

  static clearTransaction(txId: string): void {
    contentCache.clearTransaction(txId);
  }

  static clearCache(): void {
    contentCache.clearCache();
  }
}
