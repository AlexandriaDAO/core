import { Principal } from '@dfinity/principal';
import { getActorPerpetua } from '@/features/auth/utils/authUtils';
import { convertBigIntsToStrings, convertStringsToBigInts } from '@/utils/bgint_convert';
import { 
  Shelf, 
  Item, 
  ItemContent, 
  OffsetPaginationInput as BackendOffsetPaginationInput, 
  CursorPaginationInput as BackendCursorPaginationInput,
  OffsetPaginatedResult as BackendOffsetPaginatedResult,
  CursorPaginatedResult as BackendCursorPaginatedResult,
} from '@/../../declarations/perpetua/perpetua.did';
import { toPrincipal, principalToString, Result } from '../../utils';
import { store } from "@/store";

// --- Frontend Pagination Types ---

// Input Types
export interface OffsetPaginationParams {
  offset: number;
  limit: number;
}

export interface CursorPaginationParams<C = unknown> {
  cursor?: C | string; // Allow stringified cursor for easy passing
  limit: number;
}

// Result Types (using generics)
export interface PaginatedResult<T> {
  items: T[];
  limit: number;
}

export interface OffsetPaginatedResponse<T> extends PaginatedResult<T> {
  offset: number;
  total_count: number;
}

export interface CursorPaginatedResponse<T, C = unknown> extends PaginatedResult<T> {
  next_cursor?: C | string; // Return stringified cursor
}

// Cursor Types (mirroring backend structures)
export type TimestampCursor = string | bigint;
export type ItemIdCursor = number; // ItemId is u32
export type NormalizedTagCursor = string;
// Use JSON string representation for complex tuple cursors
export type TagPopularityKeyCursor = string; // Represents JSON of [bigint_string, string]
export type TagShelfAssociationKeyCursor = string; // Represents JSON of [string, string]

// Define actual backend tuple types expected by actor calls (based on .did)
// These might not match the generated .did.ts function signatures exactly due to monomorphization issues
type BackendTagPopularityKeyTuple = [bigint, string];
type BackendTagShelfAssociationKeyTuple = [string, string];

// Define query error type to match the backend
type QueryError = any; // We use 'any' here since the specific error types vary by endpoint

/**
 * Service layer for Perpetua API interactions
 * Centralizes all backend calls to provide consistent error handling and data transformation
 */
class PerpetuaService {
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
   * Get all shelves for a user (Paginated)
   */
  public async getUserShelves(
    principal: Principal | string, 
    params: OffsetPaginationParams
  ): Promise<Result<OffsetPaginatedResponse<Shelf>, QueryError>> {
    try {
      const actor = await this.getActor();
      const principalForApi = toPrincipal(principal);
      
      // Prepare pagination input for the backend
      const paginationInput: BackendOffsetPaginationInput = {
        offset: BigInt(params.offset),
        limit: BigInt(params.limit)
      };
      
      // Call the updated backend method
      const result = await actor.get_user_shelves(principalForApi, paginationInput);

      if ("Ok" in result) {
        // Process the paginated result
        const paginatedResult = result.Ok;
        const items = convertBigIntsToStrings(paginatedResult.items);
        
        return {
          Ok: {
            items: items,
            total_count: Number(paginatedResult.total_count), // Convert Nat to number
            limit: Number(paginatedResult.limit), // Convert Nat to number
            offset: Number(paginatedResult.offset) // Convert Nat to number
          }
        };
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
   * Get recent public shelves (Paginated)
   */
  public async getRecentShelves(
    params: CursorPaginationParams<TimestampCursor>
  ): Promise<Result<CursorPaginatedResponse<Shelf, TimestampCursor>, QueryError>> {
    try {
      const actor = await this.getActor();
      
      let cursorOpt: [] | [bigint] = [];
      if (params.cursor) {
        cursorOpt = [BigInt(params.cursor)];
      }
      
      // Prepare pagination input, casting cursor to 'any' to bypass likely incorrect .did.ts type
      const paginationInput = {
        cursor: cursorOpt as any, // Cast to bypass incorrect generated type
        limit: BigInt(params.limit)
      };
      
      // Call the updated backend method, passing the structured but less strictly typed input
      const result = await actor.get_recent_shelves(paginationInput);
      
      if ("Ok" in result && result.Ok) {
        const paginatedResult = result.Ok;
        const items = convertBigIntsToStrings(paginatedResult.items);
        // Ensure next_cursor exists, has elements, and the first element is defined before accessing
        const nextCursorOpt = paginatedResult.next_cursor;
        const nextCursor = nextCursorOpt && nextCursorOpt.length > 0 && nextCursorOpt[0] !== undefined 
                           ? nextCursorOpt[0].toString() 
                           : undefined;

        return { 
          Ok: {
            items: items,
            limit: Number(paginatedResult.limit), 
            next_cursor: nextCursor
          } 
        };
      } else if ("Err" in result) {
        return { Err: result.Err };
      } else {
        // Handle unexpected response structure
        console.error('Unexpected response format from getRecentShelves:', result);
        return { Err: "Unexpected response format" }; 
      }
    } catch (error) {
      console.error('Error in getRecentShelves:', error);
      return { Err: "Failed to load recent shelves" };
    }
  }
  
  /**
   * Create a new shelf
   */
  public async createShelf(title: string, description?: string, tags?: string[]): Promise<Result<string, string>> {
    try {
      const actor = await this.getActor();
      const initialItems: Item[] = [];
      
      const result = await actor.store_shelf(
        title,
        description ? [description] : [],
        initialItems,
        tags ? [tags] : []
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
   * Add an item to a shelf
   */
  public async addItemToShelf(
    shelfId: string,
    content: string,
    type: "Nft" | "Markdown" | "Shelf",
    referenceItemId: number | null = null,
    before: boolean = true,
    collectionType?: "NFT" | "SBT"
  ): Promise<Result<boolean, string>> {
    try {
      console.log(`perpetuaService: Adding ${type} item to shelf ${shelfId}`);
      
      // For NFT/SBT items, ensure the content is a numeric ID
      if (type === "Nft") {
        // Check if content is already a numeric ID
        if (!/^\d+$/.test(content)) {
          try {
            // Attempt to convert from Arweave ID using Redux store
            const state = store.getState();
            const arweaveToNftId = state.nftData?.arweaveToNftId || {};
            
            if (arweaveToNftId[content]) {
              // Convert to numeric ID
              const numericId = arweaveToNftId[content];
              console.log(`Converting Arweave ID ${content} to numeric NFT ID: ${numericId}`);
              content = numericId;
            } else {
              console.error(`Invalid NFT ID format and couldn't find numeric ID for: ${content}`);
              return { Err: "Invalid NFT ID format. The ID must be numeric." };
            }
          } catch (err) {
            console.error("Error converting Arweave ID to numeric NFT ID:", err);
            return { Err: "Invalid NFT ID format. The ID must be numeric." };
          }
        }
        
        // Final validation
        if (!/^\d+$/.test(content)) {
          console.error(`Invalid NFT ID format after attempted conversion: ${content}`);
          return { Err: "Invalid NFT ID format. The ID must be numeric." };
        }
        
        // Use the ID length to determine token type
        const idLength = content.length;
        const isRegularNft = idLength < 80;
        console.log(`Token ID length: ${idLength} chars, type: ${isRegularNft ? 'NFT' : 'SBT'}`);
        
        // For regular NFTs, check if user owns it
        if (isRegularNft) {
          try {
            const state = store.getState();
            const nfts = state.nftData?.nfts || {};
            const userPrincipal = state.auth?.user?.principal?.toString();
            
            // Check ownership in our local state
            const nftData = nfts[content];
            if (nftData) {
              const nftOwner = nftData.principal?.toString();
              console.log(`NFT Owner: ${nftOwner || 'Unknown'}, Current User: ${userPrincipal || 'Unknown'}`);
              
              // Check if user owns this NFT
              if (nftOwner && userPrincipal && nftOwner !== userPrincipal) {
                console.warn(`Warning: You don't own this NFT. Backend verification will likely fail.`);
                // We don't block here - let the backend make the final decision
              }
            }
            
            // Normalize regular NFT ID format (not needed for SBTs)
            const normalizedId = BigInt(content).toString();
            if (normalizedId !== content) {
              console.log(`Normalizing NFT ID from ${content} to ${normalizedId}`);
              content = normalizedId;
            }
          } catch (err) {
            console.error("Error during NFT pre-check:", err);
          }
        }
      }
      
      // Create item content based on type
      let itemContent;
      if (type === "Nft") {
        itemContent = { Nft: content };
      } else if (type === "Markdown") {
        itemContent = { Markdown: content };
      } else if (type === "Shelf") {
        itemContent = { Shelf: content };
      } else {
        console.error(`Unsupported item type: ${type}`);
        return { Err: "Unsupported item type" };
      }

      console.log(`Adding ${type} item to shelf ${shelfId} with content:`, itemContent);
      
      // Make the backend call with prepared content
      try {
        const actor = await this.getActor();
        const result = await actor.add_item_to_shelf(
          shelfId,
          {
            content: itemContent,
            reference_item_id: referenceItemId === null ? [] : [referenceItemId],
            before
          }
        );
        
        if ("Ok" in result) {
          console.log(`Successfully added ${type} item to shelf ${shelfId}`);
          return { Ok: true };
        } else if ("Err" in result) {
          const errMessage = result.Err;
          console.error(`Error from backend adding ${type} item to shelf:`, errMessage);
          return { Err: errMessage };
        }
        
        return { Err: "Unknown response from canister" };
      } catch (error: any) {
        // Handle IC canister call errors
        console.error(`IC canister error adding ${type} item to shelf:`, error);
        
        const errorMessage = error?.message || String(error);
        
        // If this is a regular NFT and we got an ownership/auth error, provide helpful message
        if (type === "Nft" && content.length < 80 && 
            (errorMessage.includes("Invalid principal") || 
             errorMessage.includes("CheckSequenceNotMatch") ||
             errorMessage.includes("Unauthorized"))) {
          
          return {
            Err: "You don't have permission to add this NFT. Only the owner of an NFT can add it to shelves. For content you don't own, you can use it as an SBT instead."
          };
        }
        
        // Generic auth error for other cases
        if (errorMessage.includes('Invalid principal') || 
            errorMessage.includes('CheckSequenceNotMatch')) {
          return { Err: "Authentication error: Please log out and log back in to refresh your session." };
        }
        
        return { Err: errorMessage };
      }
    } catch (error) {
      console.error(`Unexpected error adding ${type} item to shelf:`, error);
      return { Err: "An unexpected error occurred" };
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
      
      // Important: The API returns { Ok: null } on success, not { Ok: true }
      // Need to check just for "Ok" property existence, not its value
      if ("Ok" in result) {
        return { Ok: true };
      } else if ("Err" in result) {
        return { Err: result.Err };
      }
      
      return { Err: "Unknown response from backend" };
    } catch (error) {
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
  
  /**
   * Add a tag to a shelf
   */
  public async addTagToShelf(
    shelfId: string,
    tag: string
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      
      const result = await actor.add_tag_to_shelf({
        shelf_id: shelfId,
        tag
      });
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in addTagToShelf:', error);
      return { Err: "Failed to add tag to shelf" };
    }
  }
  
  /**
   * Remove a tag from a shelf
   */
  public async removeTagFromShelf(
    shelfId: string,
    tag: string
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      
      const result = await actor.remove_tag_from_shelf({
        shelf_id: shelfId,
        tag
      });
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in removeTagFromShelf:', error);
      return { Err: "Failed to remove tag from shelf" };
    }
  }

  /**
   * Check if a shelf is publicly editable
   */
  public async isShelfPublic(shelfId: string): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      
      const result = await actor.is_shelf_public(shelfId);
      
      if ("Ok" in result) {
        return { Ok: result.Ok };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in isShelfPublic:', error);
      return { Err: "Failed to check shelf public status" };
    }
  }

  /**
   * Toggle public access for a shelf
   */
  public async toggleShelfPublicAccess(
    shelfId: string,
    isPublic: boolean
  ): Promise<Result<boolean, string>> {
    try {
      const actor = await this.getActor();
      
      const result = await actor.toggle_shelf_public_access(shelfId, isPublic);
      
      if ("Ok" in result) {
        return { Ok: true };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in toggleShelfPublicAccess:', error);
      return { Err: `Failed to ${isPublic ? 'enable' : 'disable'} public access for shelf` };
    }
  }

  /**
   * Set the absolute order of items in a shelf
   */
  public async setItemOrder(
    shelfId: string,
    orderedItemIds: number[]
  ): Promise<Result<void, string>> {
    try {
      const actor = await this.getActor();
      const result = await actor.set_item_order(shelfId, orderedItemIds);

      if ("Ok" in result) {
        // The backend returns Ok(()) which is equivalent to void in TS
        return { Ok: undefined };
      } else {
        return { Err: result.Err };
      }
    } catch (error) {
      console.error('Error in setItemOrder:', error);
      return { Err: "Failed to set item order" };
    }
  }

  /**
   * Get popular tags (Paginated)
   */
  public async getPopularTags(
    params: CursorPaginationParams<TagPopularityKeyCursor> 
  ): Promise<Result<CursorPaginatedResponse<string, TagPopularityKeyCursor>, QueryError>> {
    try {
      const actor = await this.getActor();
      
      let cursorOpt: [] | [BackendTagPopularityKeyTuple] = []; // Use the tuple type
      if (params.cursor && typeof params.cursor === 'string') {
        try {
          const parsedTuple = JSON.parse(params.cursor);
          if (Array.isArray(parsedTuple) && parsedTuple.length === 2) {
             // Convert count back to BigInt
            parsedTuple[0] = BigInt(parsedTuple[0]); 
            cursorOpt = [parsedTuple as BackendTagPopularityKeyTuple]; // Assert as tuple type
          } else {
            throw new Error('Parsed cursor is not a tuple of length 2');
          }
        } catch (e) {
          console.error("Error parsing TagPopularityKey cursor:", e);
          return { Err: "Invalid cursor format" };
        }
      }
      
      const paginationInput = {
        cursor: cursorOpt as any, // Cast tuple to any for actor call
        limit: BigInt(params.limit)
      };
      
      const result = await actor.get_popular_tags(paginationInput);
      
      if ("Ok" in result && result.Ok) {
        const paginatedResult = result.Ok;
        const items = paginatedResult.items;
        
        const nextCursorOpt = paginatedResult.next_cursor;
        let nextCursorString: TagPopularityKeyCursor | undefined = undefined;
        // Backend returns Option<[nat64, text]>
        if (nextCursorOpt && nextCursorOpt.length > 0 && nextCursorOpt[0]) {
          try {
            const cursorTuple = nextCursorOpt[0]; // This should be [bigint, string]
            // Convert BigInt count to string before stringifying
            const cursorToSerialize: [string, string] = [cursorTuple[0].toString(), cursorTuple[1]];
            nextCursorString = JSON.stringify(cursorToSerialize);
          } catch (e) {
            console.error("Error stringifying next TagPopularityKey cursor:", e);
          }
        }

        return { 
          Ok: {
            items: items,
            limit: Number(paginatedResult.limit), 
            next_cursor: nextCursorString
          } 
        };
      } else if ("Err" in result) {
        return { Err: result.Err };
      } else {
        console.error('Unexpected response format from getPopularTags:', result);
        return { Err: "Unexpected response format" }; 
      }
    } catch (error) {
      console.error('Error in getPopularTags:', error);
      return { Err: "Failed to load popular tags" };
    }
  }
  
  /**
   * Get shelf IDs associated with a specific tag (Paginated)
   */
  public async getShelvesByTag(
    tag: string,
    params: CursorPaginationParams<TagShelfAssociationKeyCursor>
  ): Promise<Result<CursorPaginatedResponse<string, TagShelfAssociationKeyCursor>, QueryError>> {
    try {
      const actor = await this.getActor();
      
      let cursorOpt: [] | [BackendTagShelfAssociationKeyTuple] = []; // Use tuple type
      if (params.cursor && typeof params.cursor === 'string') {
        try {
          const parsedTuple = JSON.parse(params.cursor);
           if (Array.isArray(parsedTuple) && parsedTuple.length === 2) {
             cursorOpt = [parsedTuple as BackendTagShelfAssociationKeyTuple]; // Assert tuple type
           } else {
            throw new Error('Parsed cursor is not a tuple of length 2');
           }
        } catch (e) {
          console.error("Error parsing TagShelfAssociationKey cursor:", e);
          return { Err: "Invalid cursor format" };
        }
      }
      
      const paginationInput = {
        cursor: cursorOpt as any, // Cast tuple to any for actor call
        limit: BigInt(params.limit)
      };
      
      const result = await actor.get_shelves_by_tag(tag, paginationInput);

      if ("Ok" in result && result.Ok) {
        const paginatedResult = result.Ok;
        const items = paginatedResult.items; 
        
        const nextCursorOpt = paginatedResult.next_cursor;
        let nextCursorString: TagShelfAssociationKeyCursor | undefined = undefined;
         // Backend returns Option<[text, text]>
        if (nextCursorOpt && nextCursorOpt.length > 0 && nextCursorOpt[0]) {
          try {
            const cursorTuple = nextCursorOpt[0]; // This should be [string, string]
            nextCursorString = JSON.stringify(cursorTuple);
          } catch (e) {
            console.error("Error stringifying next TagShelfAssociationKey cursor:", e);
          }
        }

        return { 
          Ok: {
            items: items,
            limit: Number(paginatedResult.limit), 
            next_cursor: nextCursorString
          } 
        };
      } else if ("Err" in result) {
        return { Err: result.Err };
      } else {
        console.error('Unexpected response format from getShelvesByTag:', result);
        return { Err: "Unexpected response format" };
      }
    } catch (error) {
      console.error(`Error in getShelvesByTag (${tag}):`, error);
      return { Err: `Failed to load shelves for tag ${tag}` };
    }
  }

  /**
   * Get the number of shelves associated with a specific tag
   */
  public async getTagShelfCount(tag: string): Promise<Result<number, QueryError>> {
    try {
      const actor = await this.getActor();
      const result = await actor.get_tag_shelf_count(tag);

      // Backend returns nat64, no Err variant defined in .did
      if (typeof result === 'bigint') {
        // Convert BigInt count to number
        return { Ok: Number(result) };
      } else {
         console.error('Unexpected response format from get_tag_shelf_count:', result);
        return { Err: "Unexpected response format" };
      }
    } catch (error) {
      console.error(`Error in getTagShelfCount (${tag}):`, error);
      return { Err: `Failed to load count for tag ${tag}` };
    }
  }

  /**
   * Get tags starting with a given prefix (Paginated)
   */
  public async getTagsWithPrefix(
    prefix: string,
    params: CursorPaginationParams<NormalizedTagCursor> // Simple string cursor
  ): Promise<Result<CursorPaginatedResponse<string, NormalizedTagCursor>, QueryError>> {
    try {
      const actor = await this.getActor();
      
      // Prepare pagination input
      let cursorOpt: [] | [string] = [];
      if (params.cursor && typeof params.cursor === 'string') {
        cursorOpt = [params.cursor];
      }
      
      const paginationInput = {
        cursor: cursorOpt as any, // Cast to bypass potential .did.ts issues
        limit: BigInt(params.limit)
      };
      
      // Call the updated backend method
      const result = await actor.get_tags_with_prefix(prefix, paginationInput);

      if ("Ok" in result && result.Ok) {
        const paginatedResult = result.Ok;
        const items = paginatedResult.items; // Already string[]
        
        // Get the next cursor if it exists
        const nextCursorOpt = paginatedResult.next_cursor;
        const nextCursor = nextCursorOpt && nextCursorOpt.length > 0 ? nextCursorOpt[0] : undefined;
        
        return { 
          Ok: {
            items: items,
            limit: Number(paginatedResult.limit), 
            next_cursor: nextCursor
          } 
        };
      } else if ("Err" in result) {
        return { Err: result.Err };
      } else {
        console.error('Unexpected response format from getTagsWithPrefix:', result);
        return { Err: "Unexpected response format" };
      }
    } catch (error) {
      console.error(`Error in getTagsWithPrefix (${prefix}):`, error);
      return { Err: `Failed to search tags with prefix ${prefix}` };
    }
  }
}

// Export singleton instance
export const perpetuaService = PerpetuaService.getInstance(); 