import { Principal } from '@dfinity/principal';
import { getActorPerpetua } from '@/features/auth/utils/authUtils';
import { convertBigIntsToStrings, convertStringsToBigInts } from '@/utils/bgint_convert';
import { Shelf, Item, ItemContent } from '@/../../declarations/perpetua/perpetua.did';
import { toPrincipal, principalToString, Result } from '../../utils';

// Define query error type to match the backend
type QueryError = any; // We use 'any' here since the specific error types vary by endpoint

/**
 * Service layer for Perpetua API interactions
 * Centralizes all backend calls to provide consistent error handling and data transformation
 */
export class PerpetuaService {
  private static instance: PerpetuaService;
  
  private constructor() {}
  
  public static getInstance(): PerpetuaService {
    if (!PerpetuaService.instance) {
      PerpetuaService.instance = new PerpetuaService();
    }
    return PerpetuaService.instance;
  }
  
  /**
   * Get the Perpetua actor instance
   */
  private async getActor() {
    return await getActorPerpetua();
  }
  
  /**
   * Get all shelves for a user
   */
  public async getUserShelves(principal: Principal | string): Promise<Result<Shelf[], QueryError>> {
    try {
      const actor = await this.getActor();
      const principalForApi = toPrincipal(principal);
      
      const result = await actor.get_user_shelves(principalForApi, []);

      console.log("result", result);
      
      if ("Ok" in result) {
        // Convert BigInt values to strings for Redux
        return { Ok: convertBigIntsToStrings(result.Ok) };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in getUserShelves:', error);
      return { Err: "Failed to load shelves" };
    }
  }
  
  /**
   * Get a specific shelf by ID
   */
  public async getShelf(shelfId: string): Promise<Result<Shelf, QueryError>> {
    try {
      const actor = await this.getActor();
      const result = await actor.get_shelf(shelfId);
      
      if ("Ok" in result) {
        return { Ok: convertBigIntsToStrings(result.Ok) };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error(`Error in getShelf (${shelfId}):`, error);
      return { Err: `Failed to load shelf ${shelfId}` };
    }
  }
  
  /**
   * Get recent public shelves
   */
  public async getRecentShelves(limit: number = 20, beforeTimestamp?: string | bigint): Promise<Result<any, QueryError>> {
    try {
      const actor = await this.getActor();
      
      // Convert string beforeTimestamp to BigInt if necessary
      let beforeTimestampBigInt: bigint | undefined = undefined;
      if (beforeTimestamp) {
        beforeTimestampBigInt = typeof beforeTimestamp === 'string' 
          ? BigInt(beforeTimestamp) 
          : beforeTimestamp;
      }
      
      const result = await actor.get_recent_shelves(
        [BigInt(limit)], 
        beforeTimestampBigInt ? [beforeTimestampBigInt] : []
      );
      
      if ("Ok" in result) {
        // Get the timestamp from the last shelf for pagination
        const lastShelfTimestamp = result.Ok.length > 0 
          ? result.Ok[result.Ok.length - 1].created_at 
          : undefined;
          
        // Convert all BigInt values to strings
        const shelves = convertBigIntsToStrings(result.Ok);
        const serializedBeforeTimestamp = beforeTimestampBigInt ? beforeTimestampBigInt.toString() : undefined;
        const serializedLastTimestamp = lastShelfTimestamp ? lastShelfTimestamp.toString() : undefined;
        
        return { 
          Ok: { 
            shelves, 
            beforeTimestamp: serializedBeforeTimestamp,
            lastTimestamp: serializedLastTimestamp
          }
        };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in getRecentShelves:', error);
      return { Err: "Failed to load recent shelves" };
    }
  }
  
  /**
   * Create a new shelf
   */
  public async createShelf(title: string, description?: string): Promise<Result<string, string>> {
    try {
      const actor = await this.getActor();
      const initialItems: Item[] = [];
      
      const result = await actor.store_shelf(
        title,
        description ? [description] : [],
        initialItems
      );
      
      if ("Ok" in result) {
        return { Ok: result.Ok };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in createShelf:', error);
      return { Err: "Failed to create shelf" };
    }
  }
  
  /**
   * Update shelf metadata
   */
  public async updateShelfMetadata(
    shelfId: string, 
    title?: string, 
    description?: string
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      
      const result = await actor.update_shelf_metadata(
        shelfId,
        title ? [title] : [],
        description ? [description] : []
      );
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in updateShelfMetadata:', error);
      return { Err: "Failed to update shelf metadata" };
    }
  }
  
  /**
   * Rebalance shelf items
   */
  public async rebalanceShelfItems(shelfId: string): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      const result = await actor.rebalance_shelf_items(shelfId);
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in rebalanceShelfItems:', error);
      return { Err: "Failed to rebalance shelf items" };
    }
  }
  
  /**
   * Add an item to a shelf
   */
  public async addItemToShelf(
    shelfId: string,
    content: string,
    type: "Nft" | "Markdown" | "Shelf",
    referenceItemId?: number | null,
    before: boolean = true
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      
      // Create the item content based on type
      const itemContent: ItemContent = type === "Nft" 
        ? { Nft: content } as ItemContent
        : type === "Shelf"
        ? { Shelf: content } as ItemContent
        : { Markdown: content } as ItemContent;
      
      const result = await actor.add_item_to_shelf(
        shelfId,
        {
          content: itemContent,
          reference_item_id: referenceItemId ? [referenceItemId] : [],
          before
        }
      );
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in addItemToShelf:', error);
      return { Err: "Failed to add item to shelf" };
    }
  }
  
  /**
   * Remove an item from a shelf
   */
  public async removeItemFromShelf(
    shelfId: string,
    itemId: number
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      
      const result = await actor.remove_item_from_shelf(shelfId, itemId);
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in removeItemFromShelf:', error);
      return { Err: "Failed to remove item from shelf" };
    }
  }
  
  /**
   * Reorder a shelf item
   */
  public async reorderShelfItem(
    shelfId: string,
    itemId: number,
    referenceItemId: number | null,
    before: boolean
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      
      const result = await actor.reorder_shelf_item(
        shelfId,
        {
          item_id: itemId,
          reference_item_id: referenceItemId ? [referenceItemId] : [],
          before
        }
      );

      console.log("New shelf item order", result);
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in reorderShelfItem:', error);
      return { Err: "Failed to reorder item" };
    }
  }
  
  /**
   * Reorder a shelf in a user's profile
   */
  public async reorderProfileShelf(
    shelfId: string,
    referenceShelfId: string | null,
    before: boolean
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      
      const result = await actor.reorder_profile_shelf(
        shelfId,
        referenceShelfId ? [referenceShelfId] : [],
        before
      );
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in reorderProfileShelf:', error);
      return { Err: "Failed to reorder shelf" };
    }
  }
  
  /**
   * Create a new shelf and add it as an item to a parent shelf
   */
  public async createAndAddShelfItem(
    parentShelfId: string,
    title: string,
    description?: string
  ): Promise<Result<string, string>> {
    try {
      const actor = await this.getActor();
      
      const result = await actor.create_and_add_shelf_item(
        parentShelfId,
        title,
        description ? [description] : []
      );
      
      if ("Ok" in result) {
        return { Ok: result.Ok };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in createAndAddShelfItem:', error);
      return { Err: "Failed to create and add shelf" };
    }
  }
  
  /**
   * List editors for a shelf
   */
  public async listShelfEditors(shelfId: string): Promise<Result<string[], string>> {
    try {
      const actor = await this.getActor();
      const result = await actor.list_shelf_editors(shelfId);
      
      if ("Ok" in result) {
        // Convert Principal objects to strings
        const editorPrincipals = result.Ok.map(principal => principal.toString());
        return { Ok: editorPrincipals };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in listShelfEditors:', error);
      return { Err: "Failed to list shelf editors" };
    }
  }
  
  /**
   * Add an editor to a shelf
   */
  public async addShelfEditor(
    shelfId: string,
    editorPrincipal: string
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      const principalForApi = toPrincipal(editorPrincipal);
      
      const result = await actor.add_shelf_editor(shelfId, principalForApi);
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in addShelfEditor:', error);
      return { Err: "Failed to add editor to shelf" };
    }
  }
  
  /**
   * Remove an editor from a shelf
   */
  public async removeShelfEditor(
    shelfId: string,
    editorPrincipal: string
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      const principalForApi = toPrincipal(editorPrincipal);
      
      const result = await actor.remove_shelf_editor(shelfId, principalForApi);
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in removeShelfEditor:', error);
      return { Err: "Failed to remove editor from shelf" };
    }
  }
}

// Export singleton instance
export const perpetuaService = PerpetuaService.getInstance(); 