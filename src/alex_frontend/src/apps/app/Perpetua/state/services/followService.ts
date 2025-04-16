import { Principal } from '@dfinity/principal';
import { getActorPerpetua } from '@/features/auth/utils/authUtils';
import { convertBigIntsToStrings } from '@/utils/bgint_convert';
import { toPrincipal, Result } from '../../utils';
import {
  Shelf,
  // We might need specific pagination/result types if they differ, but assuming reuse for now
  // Check .did if needed
} from '@/../../declarations/perpetua/perpetua.did';
import {
  CursorPaginationParams,
  CursorPaginatedResponse,
  TimestampCursor,
  QueryError
} from './serviceTypes';

// --- Follow/Unfollow Users ---

/**
 * Follow a user
 */
export async function followUser(
  userToFollow: string | Principal
): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();
    const principalForApi = toPrincipal(userToFollow);
    const result = await actor.follow_user(principalForApi);

    if ("Ok" in result) {
      return { Ok: true };
    } else {
      return { Err: result.Err };
    }
  } catch (error) {
    console.error('Error in followUser:', error);
    return { Err: "Failed to follow user" };
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  userToUnfollow: string | Principal
): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();
    const principalForApi = toPrincipal(userToUnfollow);
    const result = await actor.unfollow_user(principalForApi);

    if ("Ok" in result) {
      return { Ok: true };
    } else {
      return { Err: result.Err };
    }
  } catch (error) {
    console.error('Error in unfollowUser:', error);
    return { Err: "Failed to unfollow user" };
  }
}

// --- Follow/Unfollow Tags ---

/**
 * Follow a tag
 */
export async function followTag(tag: string): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();
    const result = await actor.follow_tag(tag);

    if ("Ok" in result) {
      return { Ok: true };
    } else {
      return { Err: result.Err };
    }
  } catch (error) {
    console.error('Error in followTag:', error);
    return { Err: "Failed to follow tag" };
  }
}

/**
 * Unfollow a tag
 */
export async function unfollowTag(tag: string): Promise<Result<boolean, string>> {
  try {
    const actor = await getActorPerpetua();
    const result = await actor.unfollow_tag(tag);

    if ("Ok" in result) {
      return { Ok: true };
    } else {
      return { Err: result.Err };
    }
  } catch (error) {
    console.error('Error in unfollowTag:', error);
    return { Err: "Failed to unfollow tag" };
  }
}

// --- Get Feeds ---

/**
 * Get feed of shelves from followed users (Paginated)
 */
export async function getFollowedUsersFeed(
  params: CursorPaginationParams<TimestampCursor>
): Promise<Result<CursorPaginatedResponse<Shelf, TimestampCursor>, QueryError>> {
  try {
    const actor = await getActorPerpetua();

    let cursorOpt: [] | [bigint] = [];
    if (params.cursor) {
      // Assuming TimestampCursor is string representation of bigint
      try {
        cursorOpt = [BigInt(params.cursor)];
      } catch (e) {
        console.error("Error parsing TimestampCursor for followed users feed:", e);
        return { Err: "Invalid cursor format" };
      }
    }

    // Use 'any' for paginationInput to bypass specific generated type issues if necessary
    const paginationInput: any = {
      cursor: cursorOpt,
      limit: BigInt(params.limit)
    };

    // Backend Result type expected: Result_2 = { Ok: T2 } | { Err: QueryError }; T2 = { items: Array<Shelf>, limit: bigint, next_cursor: [] | [nat64] }
    const result = await actor.get_followed_users_feed(paginationInput);

    if ("Ok" in result && result.Ok) {
      const paginatedResult = result.Ok;
      const items = convertBigIntsToStrings(paginatedResult.items);

      const nextCursorOpt = paginatedResult.next_cursor;
      const nextCursor = nextCursorOpt && nextCursorOpt.length > 0 && nextCursorOpt[0] !== undefined
                         ? nextCursorOpt[0].toString() // Convert bigint cursor to string
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
      console.error('Unexpected response format from getFollowedUsersFeed:', result);
      return { Err: "Unexpected response format" };
    }
  } catch (error) {
    console.error('Error in getFollowedUsersFeed:', error);
    return { Err: "Failed to load followed users feed" };
  }
}

/**
 * Get feed of shelves with followed tags (Paginated)
 */
export async function getFollowedTagsFeed(
  params: CursorPaginationParams<TimestampCursor>
): Promise<Result<CursorPaginatedResponse<Shelf, TimestampCursor>, QueryError>> {
  try {
    const actor = await getActorPerpetua();

    let cursorOpt: [] | [bigint] = [];
    if (params.cursor) {
       // Assuming TimestampCursor is string representation of bigint
       try {
        cursorOpt = [BigInt(params.cursor)];
      } catch (e) {
        console.error("Error parsing TimestampCursor for followed tags feed:", e);
        return { Err: "Invalid cursor format" };
      }
    }

    const paginationInput: any = {
      cursor: cursorOpt,
      limit: BigInt(params.limit)
    };

    // Backend Result type expected: Result_2 = { Ok: T2 } | { Err: QueryError }; T2 = { items: Array<Shelf>, limit: bigint, next_cursor: [] | [nat64] }
    const result = await actor.get_followed_tags_feed(paginationInput);

    if ("Ok" in result && result.Ok) {
      const paginatedResult = result.Ok;
      const items = convertBigIntsToStrings(paginatedResult.items);

      const nextCursorOpt = paginatedResult.next_cursor;
      const nextCursor = nextCursorOpt && nextCursorOpt.length > 0 && nextCursorOpt[0] !== undefined
                         ? nextCursorOpt[0].toString() // Convert bigint cursor to string
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
      console.error('Unexpected response format from getFollowedTagsFeed:', result);
      return { Err: "Unexpected response format" };
    }
  } catch (error) {
    console.error('Error in getFollowedTagsFeed:', error);
    return { Err: "Failed to load followed tags feed" };
  }
}
