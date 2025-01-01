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

  private async generateVideoThumbnail(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = "anonymous";
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        cleanup();
        resolve(null);
      }, 10000); // 10 second timeout

      const cleanup = () => {
        video.removeEventListener('timeupdate', timeupdate);
        video.removeEventListener('loadeddata', loadeddata);
        video.removeEventListener('error', handleError);
        clearTimeout(timeout);
      };

      const handleError = () => {
        cleanup();
        resolve(null);
      };
      
      const timeupdate = () => {
        if (video.currentTime > 0) {
          cleanup();
          
          try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                if (blob) {
                  const thumbnailUrl = URL.createObjectURL(blob);
                  resolve(thumbnailUrl);
                } else {
                  resolve(null);
                }
              }, 'image/jpeg');
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error generating thumbnail:', error);
            resolve(null);
          }
        }
      };

      const loadeddata = () => {
        video.currentTime = 0.1;
      };

      video.addEventListener('timeupdate', timeupdate);
      video.addEventListener('loadeddata', loadeddata);
      video.addEventListener('error', handleError);
      video.src = url;
      video.load();
    });
  }

  private async handleImageContent(url: string): Promise<CachedContent> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return {
      url,
      textContent: null,
      imageObjectUrl: objectUrl,
      thumbnailUrl: null,
      error: null,
    };
  }

  private async handleVideoContent(url: string): Promise<CachedContent> {
    const thumbnailUrl = await this.generateVideoThumbnail(url);
    return {
      url,
      textContent: null,
      imageObjectUrl: null,
      thumbnailUrl,
      error: null,
    };
  }

  private async handleTextContent(url: string): Promise<CachedContent> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const textContent = await response.text();
    return {
      url,
      textContent,
      imageObjectUrl: null,
      thumbnailUrl: null,
      error: null,
    };
  }

  private getDefaultContent(url: string): CachedContent {
    return {
      url,
      textContent: null,
      imageObjectUrl: null,
      thumbnailUrl: null,
      error: null,
    };
  }

  private getErrorContent(errorMessage: string = 'Failed to load content. Please try again later.'): CachedContent {
    return {
      url: null,
      textContent: null,
      imageObjectUrl: null,
      thumbnailUrl: null,
      error: errorMessage,
    };
  }

  async loadContent(transaction: Transaction): Promise<CachedContent> {
    const txId = transaction.id;
    
    if (this.cache[txId]) {
      return this.cache[txId];
    }

    try {
      const contentType = transaction.tags.find((tag) => tag.name === 'Content-Type')?.value || 'image/jpeg';
      const url = getArweaveUrl(txId);

      let content: CachedContent;

      if (contentType.startsWith('image/')) {
        content = await this.handleImageContent(url);
      } else if (contentType.startsWith('video/')) {
        content = await this.handleVideoContent(url);
      } else if (this.isTextContent(contentType)) {
        content = await this.handleTextContent(url);
      } else {
        content = this.getDefaultContent(url);
      }

      this.cache[txId] = content;
      this.pruneCache();
      return content;

    } catch (error) {
      const errorContent = this.getErrorContent();
      this.cache[txId] = errorContent;
      return errorContent;
    }
  }

  private isTextContent(contentType: string): boolean {
    return ['text/plain', 'text/markdown', 'application/json', 'text/html'].includes(contentType);
  }

  getContent(txId: string): CachedContent | undefined {
    return this.cache[txId];
  }

  clearCache() {
    Object.values(this.cache).forEach(content => {
      if (content.imageObjectUrl) {
        URL.revokeObjectURL(content.imageObjectUrl);
      }
      if (content.thumbnailUrl) {
        URL.revokeObjectURL(content.thumbnailUrl);
      }
    });
    this.cache = {};
  }

  clearTransaction(txId: string) {
    const content = this.cache[txId];
    if (content?.imageObjectUrl) {
      URL.revokeObjectURL(content.imageObjectUrl);
    }
    if (content?.thumbnailUrl) {
      URL.revokeObjectURL(content.thumbnailUrl);
    }
    delete this.cache[txId];
  }

  updateThumbnail(txId: string, thumbnailUrl: string) {
    if (this.cache[txId]) {
      this.cache[txId].thumbnailUrl = thumbnailUrl;
    }
  }
}

// Export a singleton instance
export const contentCache = ContentCacheService.getInstance();
