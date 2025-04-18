import { Principal } from '@dfinity/principal';
import { getActorPerpetua } from '@/features/auth/utils/authUtils';
import { toPrincipal, Result } from '../../utils';
import {
  // CursorPaginationInput as BackendCursorPaginationInput, // Removed generic import
  // CursorPaginatedResult as BackendCursorPaginatedResult, // Removed generic import
} from '@/../../declarations/perpetua/perpetua.did';
import {
  CursorPaginationParams,
  CursorPaginatedResponse,
  TagPopularityKeyCursor,
  TagShelfAssociationKeyCursor,
  NormalizedTagCursor,
  QueryError // Added QueryError import
} from './serviceTypes';

// --- Backend Tuple Types ---
// These might not match the generated .did.ts function signatures exactly
type BackendTagPopularityKeyTuple = [bigint, string];
type BackendTagShelfAssociationKeyTuple = [string, string];

// --- Query Error Type --- (REMOVED - Imported from types file)
// type QueryError = any;

// --- Shared Actor Utility ---
// It might be better placed in a more general utility file later
async function getPerpetuaActorInstance() {
  return await getActorPerpetua();
}

// --- Tag Service Functions ---

/**
 * Add a tag to a shelf
 */
export async function addTagToShelf(
  shelfId: string,
  tag: string
): Promise<Result<boolean, string>> {
  try {
    const actor = await getPerpetuaActorInstance();
    
    const result = await actor.add_tag_to_shelf({
      shelf_id: shelfId,
      tag
    });
    
    if ("Ok" in result) {
      return { Ok: true };
    } else {
      // Assuming the error type is string based on .did, adjust if needed
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
export async function removeTagFromShelf(
  shelfId: string,
  tag: string
): Promise<Result<boolean, string>> {
  try {
    const actor = await getPerpetuaActorInstance();
    
    const result = await actor.remove_tag_from_shelf({
      shelf_id: shelfId,
      tag
    });
    
    if ("Ok" in result) {
      return { Ok: true };
    } else {
      // Assuming the error type is string based on .did, adjust if needed
      return { Err: result.Err };
    }
  } catch (error) {
    console.error('Error in removeTagFromShelf:', error);
    return { Err: "Failed to remove tag from shelf" };
  }
}

/**
 * Get popular tags (Paginated)
 */
export async function getPopularTags(
  params: CursorPaginationParams<TagPopularityKeyCursor>
): Promise<Result<CursorPaginatedResponse<string, TagPopularityKeyCursor>, QueryError>> {
  try {
    const actor = await getPerpetuaActorInstance();
    
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
    
    // Use 'any' for paginationInput to bypass specific generated type issues
    const paginationInput: any = {
      cursor: cursorOpt,
      limit: BigInt(params.limit)
    };
    
    // Backend Result type expected: Result_7 = { Ok: T7 } | { Err: QueryError }; T7 = { items: Array<string>, limit: bigint, next_cursor: [] | [[bigint, string]] }
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
export async function getShelvesByTag(
  tag: string,
  params: CursorPaginationParams<TagShelfAssociationKeyCursor>
): Promise<Result<CursorPaginatedResponse<string, TagShelfAssociationKeyCursor>, QueryError>> {
  try {
    const actor = await getPerpetuaActorInstance();
    
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
    
    // Use 'any' for paginationInput to bypass specific generated type issues
    const paginationInput: any = {
      cursor: cursorOpt,
      limit: BigInt(params.limit)
    };
    
    // Backend Result type expected: Result_9 = { Ok: T9 } | { Err: QueryError }; T9 = { items: Array<string>, limit: bigint, next_cursor: [] | [[string, string]] }
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
export async function getTagShelfCount(tag: string): Promise<Result<number, QueryError>> {
  try {
    const actor = await getPerpetuaActorInstance();
    // Backend Result type expected: bigint
    const result = await actor.get_tag_shelf_count(tag);

    // Backend returns nat64, no Err variant defined in .did
    if (typeof result === 'bigint') {
      // Convert BigInt count to number
      return { Ok: Number(result) };
    } else {
       console.error('Unexpected response format from get_tag_shelf_count:', result);
      return { Err: "Unexpected response format" }; // Should ideally not happen if backend adheres to .did
    }
  } catch (error) {
    console.error(`Error in getTagShelfCount (${tag}):`, error);
    return { Err: `Failed to load count for tag ${tag}` };
  }
}

/**
 * Get tags starting with a given prefix (Paginated)
 */
export async function getTagsWithPrefix(
  prefix: string,
  params: CursorPaginationParams<NormalizedTagCursor> // Simple string cursor
): Promise<Result<CursorPaginatedResponse<string, NormalizedTagCursor>, QueryError>> {
  try {
    const actor = await getPerpetuaActorInstance();
    
    // Prepare pagination input
    let cursorOpt: [] | [string] = [];
    if (params.cursor && typeof params.cursor === 'string') {
      cursorOpt = [params.cursor];
    }
    
    // Use 'any' for paginationInput to bypass specific generated type issues
    const paginationInput: any = {
      cursor: cursorOpt,
      limit: BigInt(params.limit)
    };
    
    // Backend Result type expected: Result_10 = { Ok: T10 } | { Err: QueryError }; T10 = { items: Array<string>, limit: bigint, next_cursor: [] | [string] }
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

// Note: We'll likely need to move the pagination and cursor type definitions
// to a shared file (e.g., perpetuaServiceTypes.ts) to avoid duplication.
// For now, I've assumed they exist in './perpetuaServiceTypes'. (NOTE: This was done)
// For now, I've assumed they exist in './perpetuaServiceTypes'. 