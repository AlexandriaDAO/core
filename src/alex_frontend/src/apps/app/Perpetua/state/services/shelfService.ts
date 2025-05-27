import { Principal } from '@dfinity/principal';
import { getActorPerpetua } from '@/features/auth/utils/authUtils';
import { convertBigIntsToStrings } from '@/utils/bgint_convert';
import {
  ShelfPublic,
  Item,
  OffsetPaginationInput as BackendOffsetPaginationInput,
  OffsetPaginatedResult as BackendOffsetPaginatedResult,
} from '@/../../declarations/perpetua/perpetua.did';
import { toPrincipal, Result } from '../../utils';
import {
  OffsetPaginationParams,
  OffsetPaginatedResponse,
  CursorPaginationParams,
  CursorPaginatedResponse,
  TimestampCursor,
  QueryError
} from './serviceTypes';
import { toast } from "sonner";

/**
 * Get all shelves for a user (Paginated)
 */
export async function getUserShelves(
  principal: Principal | string,
  params: OffsetPaginationParams
): Promise<Result<OffsetPaginatedResponse<ShelfPublic>, QueryError>> {
  try {
    const actor = await getActorPerpetua();
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
      let items = convertBigIntsToStrings(paginatedResult.items) as ShelfPublic[];

      // Re-convert owner strings back to Principal objects
      items = items.map(shelf => ({
        ...shelf,
        owner: Principal.fromText(shelf.owner as any as string) // Cast needed as it was converted to string
      }));

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
export async function getShelf(shelfId: string): Promise<Result<ShelfPublic, QueryError>> {
  try {
    const actor = await getActorPerpetua();
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
export async function getRecentShelves(
  params: CursorPaginationParams<TimestampCursor>
): Promise<Result<CursorPaginatedResponse<ShelfPublic, TimestampCursor>, QueryError>> {
  try {
    const actor = await getActorPerpetua();

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
export async function createShelf(title: string, description?: string, tags?: string[]): Promise<Result<string, string>> {
  try {
    const actor = await getActorPerpetua();
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
      // Check for specific error message related to insufficient balance
      if (result.Err.includes("Not enough balance") || result.Err.includes("Shelves cost 50 LBRY to create")) {
        toast.error("Failed to create shelf: Not enough balance. Shelves cost 50 LBRY to create. Please add to your top-up account.");
      } else {
        toast.error(`Failed to create shelf: ${result.Err}`);
      }
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
export async function updateShelfMetadata(
  shelfId: string,
  title?: string,
  description?: string
): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();

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
 * Reorder a shelf in a user's profile
 */
export async function reorderProfileShelf(
  shelfId: string,
  referenceShelfId: string | null,
  before: boolean
): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();

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
    console.error('Error in reorderProfileShelf:', error);
    return { Err: "Failed to reorder shelf" };
  }
}

/**
 * Check if a shelf is publicly editable
 */
export async function isShelfPublic(shelfId: string): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();

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
export async function toggleShelfPublicAccess(
  shelfId: string,
  isPublic: boolean
): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();

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
 * Get a shuffled feed of shelves, updated hourly.
 */
export async function getShuffledByHourFeed(
  limit: number
): Promise<Result<ShelfPublic[], QueryError>> {
  try {
    const actor = await getActorPerpetua();
    const result = await actor.get_shuffled_by_hour_feed(BigInt(limit));

    if ("Ok" in result) {
      return { Ok: convertBigIntsToStrings(result.Ok) };
    } else if ("Err" in result) {
      return { Err: result.Err };
    } else {
      console.error('Unexpected response format from getShuffledByHourFeed:', result);
      return { Err: "Unexpected response format" };
    }
  } catch (error) {
    console.error('Error in getShuffledByHourFeed:', error);
    return { Err: "Failed to load shuffled feed" };
  }
}

/**
 * Get a storyline feed of shelves based on followed users and tags (Paginated)
 */
export async function getStorylineFeed(
  params: CursorPaginationParams<TimestampCursor>
): Promise<Result<CursorPaginatedResponse<ShelfPublic, TimestampCursor>, QueryError>> {
  try {
    const actor = await getActorPerpetua();

    let cursorOpt: [] | [bigint] = [];
    if (params.cursor) {
      cursorOpt = [BigInt(params.cursor)];
    }

    const paginationInput = {
      cursor: cursorOpt as any, // Cast to bypass potential .did.ts type issues
      limit: BigInt(params.limit)
    };

    const result = await actor.get_storyline_feed(paginationInput);

    if ("Ok" in result && result.Ok) {
      const paginatedResult = result.Ok;
      const items = convertBigIntsToStrings(paginatedResult.items);
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
      console.error('Unexpected response format from getStorylineFeed:', result);
      return { Err: "Unexpected response format" };
    }
  } catch (error) {
    console.error('Error in getStorylineFeed:', error);
    return { Err: "Failed to load storyline feed" };
  }
}

export async function getUserPubliclyEditableShelves(
  principal: Principal | string,
  params: OffsetPaginationParams
): Promise<Result<OffsetPaginatedResponse<ShelfPublic>, QueryError>> {
  try {
    const actor = await getActorPerpetua();
    const principalForApi = toPrincipal(principal);
    const paginationInput: BackendOffsetPaginationInput = {
      offset: BigInt(params.offset),
      limit: BigInt(params.limit)
    };
    // Call the new backend method
    const result = await actor.get_user_publicly_editable_shelves(principalForApi, paginationInput);

    if ("Ok" in result) {
      const paginatedResult = result.Ok;
      // Assuming items are already ShelfPublic and bigints are handled by actor or further processing if needed
      let items = convertBigIntsToStrings(paginatedResult.items) as ShelfPublic[]; 

      // Re-convert owner strings back to Principal objects
      items = items.map(shelf => ({
        ...shelf,
        owner: Principal.fromText(shelf.owner as any as string) // Cast needed as it was converted to string
      }));

      return {
        Ok: {
          items: items,
          total_count: Number(paginatedResult.total_count),
          limit: Number(paginatedResult.limit),
          offset: Number(paginatedResult.offset)
        }
      };
    } else {
      return { Err: result.Err };
    }
  } catch (error) {
    console.error('Error in getUserPubliclyEditableShelves:', error);
    return { Err: "Failed to load user publicly editable shelves" };
  }
} 