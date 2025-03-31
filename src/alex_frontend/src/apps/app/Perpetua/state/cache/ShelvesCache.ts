import { Principal } from '@dfinity/principal';
import { principalToString } from '../../utils';

/**
 * Cache entry with type metadata and timestamp
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  type: string;
}

/**
 * Enhanced cache manager with improved type safety and performance
 */
export class ShelvesCache {
  private static instance: ShelvesCache;
  private cache: Map<string, CacheEntry<any>>;
  private readonly TTL: number;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  
  private constructor(ttlMs: number = 30000, cleanupIntervalMs: number = 60000) {
    this.cache = new Map();
    this.TTL = ttlMs;
    
    // Start periodic cleanup
    this.startCleanupInterval(cleanupIntervalMs);
  }
  
  public static getInstance(): ShelvesCache {
    if (!ShelvesCache.instance) {
      ShelvesCache.instance = new ShelvesCache();
    }
    return ShelvesCache.instance;
  }
  
  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(intervalMs: number): void {
    // Clear any existing interval first
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Set up new cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanExpired();
    }, intervalMs);
  }
  
  /**
   * Stop the periodic cleanup
   */
  public stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * Generate a consistent cache key with type and ID information 
   */
  private generateKey(id: Principal | string, type: string): string {
    const normalizedId = principalToString(id);
    return `${type}:${normalizedId}`;
  }
  
  /**
   * Get data from cache if valid and not expired
   */
  public get<T>(id: Principal | string, type: string): T | null {
    const key = this.generateKey(id, type);
    const entry = this.cache.get(key);
    
    // Check if entry exists and is not expired
    if (entry && (Date.now() - entry.timestamp < this.TTL)) {
      return entry.data as T;
    }
    
    // Either no entry or expired
    if (entry) {
      this.cache.delete(key); // Clean up expired entry
    }
    
    return null;
  }
  
  /**
   * Store data in cache with type information
   */
  public set<T>(id: Principal | string, type: string, data: T): void {
    const key = this.generateKey(id, type);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      type
    });
  }
  
  /**
   * Invalidate a specific cache entry
   */
  public invalidate(id: Principal | string, type: string): void {
    const key = this.generateKey(id, type);
    this.cache.delete(key);
  }
  
  /**
   * Invalidate all cache entries for a principal
   */
  public invalidateForPrincipal(principal: Principal | string): void {
    const principalStr = principalToString(principal);
    
    // Use an array to collect keys to delete to avoid modifying during iteration
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (key.includes(principalStr)) {
        keysToDelete.push(key);
      }
    }
    
    // Perform the deletion
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  
  /**
   * Invalidate all cache entries for a shelf
   */
  public invalidateForShelf(shelfId: string): void {
    // Use an array to collect keys to delete to avoid modifying during iteration
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (key.includes(shelfId)) {
        keysToDelete.push(key);
      }
    }
    
    // Perform the deletion
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Invalidate entries by type
   */
  public invalidateByType(type: string): void {
    // Use an array to collect keys to delete to avoid modifying during iteration
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.type === type) {
        keysToDelete.push(key);
      }
    }
    
    // Perform the deletion
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  
  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clean expired entries
   */
  public cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.TTL) {
        keysToDelete.push(key);
      }
    }
    
    // Perform the deletion
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  
  /**
   * Get cache statistics
   */
  public getStats(): { size: number, types: Record<string, number> } {
    const stats = {
      size: this.cache.size,
      types: {} as Record<string, number>
    };
    
    // Count entries by type
    for (const [key, entry] of this.cache.entries()) {
      if (!stats.types[entry.type]) {
        stats.types[entry.type] = 0;
      }
      stats.types[entry.type]++;
    }
    
    return stats;
  }
}

// Export singleton instance
export const cacheManager = ShelvesCache.getInstance(); 