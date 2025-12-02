import { Result } from '../../utils';
import {
  // CursorPaginationInput as BackendCursorPaginationInput, // Removed generic import
  // CursorPaginatedResult as BackendCursorPaginatedResult, // Removed generic import
  _SERVICE
} from '@/../../declarations/perpetua/perpetua.did';
import {
  CursorPaginationParams,
  CursorPaginatedResponse,
  TagPopularityKeyCursor,
  TagShelfAssociationKeyCursor,
  NormalizedTagCursor,
  QueryError // Added QueryError import
} from './serviceTypes';
import { ActorSubclass } from '@dfinity/agent';

// --- Backend Tuple Types ---
// These might not match the generated .did.ts function signatures exactly
type BackendTagPopularityKeyTuple = [bigint, string];
// type BackendTagShelfAssociationKeyTuple = [string, string]; // Not used by getShelvesByTag directly
type BackendTagShelfCreationTimelineKeyTuple = [string, string, bigint]; // Defined for TagShelfCreationTimelineKey

// --- Query Error Type --- (REMOVED - Imported from types file)
// type QueryError = any;


// --- Tag Service Functions ---

/**
 * Add a tag to a shelf
 */
export async function addTagToShelf(
  actor: ActorSubclass<_SERVICE>,
  shelfId: string,
  tag: string
): Promise<Result<boolean, string>> {
  try {
    
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
  actor: ActorSubclass<_SERVICE>,
  shelfId: string,
  tag: string
): Promise<Result<boolean, string>> {
  try {
    
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
  actor: ActorSubclass<_SERVICE>,
  params: CursorPaginationParams<TagPopularityKeyCursor>
): Promise<Result<CursorPaginatedResponse<string, TagPopularityKeyCursor>, QueryError>> {
  try {
    
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
  actor: ActorSubclass<_SERVICE>,
  tag: string,
  params: CursorPaginationParams<TagShelfAssociationKeyCursor>
): Promise<Result<CursorPaginatedResponse<string, TagShelfAssociationKeyCursor>, QueryError>> {
  try {
    
    let cursorOpt: [] | [BackendTagShelfCreationTimelineKeyTuple] = []; 
    if (params.cursor && typeof params.cursor === 'string') {
      try {
        // Expecting a JSON string of [tag, shelf_id, reversed_created_at_string]
        const parsedArr = JSON.parse(params.cursor) as [string, string, string]; 
        if (Array.isArray(parsedArr) && parsedArr.length === 3) {
            cursorOpt = [[parsedArr[0], parsedArr[1], BigInt(parsedArr[2])]]; 
        } else {
            throw new Error("Parsed cursor is not an array of length 3 for TagShelfCreationTimelineKey");
        }
      } catch (e) {
        console.error("Error parsing TagShelfCreationTimelineKey cursor:", e);
        return { Err: "Invalid cursor format" as any }; 
      }
    }
        
    const paginationInput: any = {
      cursor: cursorOpt,
      limit: BigInt(params.limit)
    };
    
    const result = await actor.get_shelves_by_tag(tag, paginationInput);

    if ("Ok" in result && result.Ok) {
      const paginatedResult = result.Ok;
      const items: string[] = paginatedResult.items.map(shelf => shelf.shelf_id);
      
      const nextCursorOpt = paginatedResult.next_cursor; // This is Option<TagShelfCreationTimelineKey>
      let nextCursorString: TagShelfAssociationKeyCursor | undefined = undefined; // TODO: This should be string | undefined for TagShelfCreationTimelineKey
      
      if (nextCursorOpt && nextCursorOpt.length > 0 && nextCursorOpt[0]) {
        try {
          const cursorObject = nextCursorOpt[0]; // This is TagShelfCreationTimelineKey {tag:string, shelf_id:string, reversed_created_at:bigint}
          // Serialize to [string, string, string] for JSON stringification
          const cursorToSerialize: [string, string, string] = [cursorObject.tag, cursorObject.shelf_id, cursorObject.reversed_created_at.toString()];
          nextCursorString = JSON.stringify(cursorToSerialize);
        } catch (e) {
          console.error("Error stringifying next TagShelfCreationTimelineKey cursor:", e);
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
      return { Err: "Unexpected response format" as any };
    }
  } catch (error) {
    console.error(`Error in getShelvesByTag (${tag}):`, error);
    return { Err: `Failed to load shelves for tag ${tag}` as any };
  }
}

/**
 * Get the number of shelves associated with a specific tag
 */
export async function getTagShelfCount(actor: ActorSubclass<_SERVICE>, tag: string): Promise<Result<number, QueryError>> {
  try {
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
  actor: ActorSubclass<_SERVICE>,
  prefix: string,
  params: CursorPaginationParams<NormalizedTagCursor> // Simple string cursor
): Promise<Result<CursorPaginatedResponse<string, NormalizedTagCursor>, QueryError>> {
  try {
    
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