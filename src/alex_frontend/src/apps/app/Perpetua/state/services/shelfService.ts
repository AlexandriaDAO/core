import { Principal } from '@dfinity/principal';
import { getActorPerpetua } from '@/features/auth/utils/authUtils';
import { convertBigIntsToStrings } from '@/utils/bgint_convert';
import {
  Shelf,
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

/**
 * Get all shelves for a user (Paginated)
 */
export async function getUserShelves(
  principal: Principal | string,
  params: OffsetPaginationParams
): Promise<Result<OffsetPaginatedResponse<Shelf>, QueryError>> {
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
export async function getShelf(shelfId: string): Promise<Result<Shelf, QueryError>> {
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
): Promise<Result<CursorPaginatedResponse<Shelf, TimestampCursor>, QueryError>> {
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
 * Create a new shelf and add it as an item to a parent shelf
 */
export async function createAndAddShelfItem(
  parentShelfId: string,
  title: string,
  description?: string
): Promise<Result<string, string>> {
  try {
    const actor = await getActorPerpetua();

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
export async function listShelfEditors(shelfId: string): Promise<Result<string[], string>> {
  try {
    const actor = await getActorPerpetua();
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
export async function addShelfEditor(
  shelfId: string,
  editorPrincipal: string
): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();
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
export async function removeShelfEditor(
  shelfId: string,
  editorPrincipal: string
): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();
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