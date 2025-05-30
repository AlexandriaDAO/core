import { Principal } from '@dfinity/principal';
import { convertBigIntsToStrings } from '@/utils/bgint_convert';
import { toPrincipal, Result } from '../../utils';
import {
  _SERVICE,
  ShelfPublic,
  // We might need specific pagination/result types if they differ, but assuming reuse for now
  // Check .did if needed
} from '@/../../declarations/perpetua/perpetua.did';
import {
  CursorPaginationParams,
  CursorPaginatedResponse,
  TimestampCursor,
  QueryError
} from './serviceTypes';
import { ActorSubclass } from '@dfinity/agent';

// --- Follow/Unfollow Users ---

/**
 * Follow a user
 */
export async function followUser(
  userToFollow: string | Principal,
  actor: ActorSubclass<_SERVICE>
): Promise<Result<boolean, string>> {
  try {
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
  userToUnfollow: string | Principal,
  actor: ActorSubclass<_SERVICE>
): Promise<Result<boolean, string>> {
  try {
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
export async function followTag(actor: ActorSubclass<_SERVICE>, tag: string): Promise<Result<boolean, string>> {
  try {
    // Assuming actor.follow_tag returns Result<null, text>
    // Ok(null) means success, Err(text) contains the error message.
    const result = await actor.follow_tag(tag);

    if ("Ok" in result) {
      // Backend confirmed success
      return { Ok: true };
    } else {
      // Backend returned an error (e.g., "Already following", "Unauthorized")
      return { Err: result.Err };
    }
  } catch (error) {
    console.error('Error in followTag:', error);
    return { Err: "Failed to follow tag" }; // Catch network/actor errors
  }
}

/**
 * Unfollow a tag
 */
export async function unfollowTag(actor: ActorSubclass<_SERVICE>, tag: string): Promise<Result<boolean, string>> {
  try {
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
  actor: ActorSubclass<_SERVICE>,
  params: CursorPaginationParams<TimestampCursor>
): Promise<Result<CursorPaginatedResponse<ShelfPublic, TimestampCursor>, QueryError>> {
  try {

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
  actor: ActorSubclass<_SERVICE>,
  params: CursorPaginationParams<TimestampCursor>
): Promise<Result<CursorPaginatedResponse<ShelfPublic, TimestampCursor>, QueryError>> {
  try {

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

// --- Get Followed Lists ---

/**
 * Get the list of tags followed by the current user
 */
export async function getMyFollowedTags(actor: ActorSubclass<_SERVICE>): Promise<Result<string[], QueryError>> {
  try {
    // Assuming backend method is get_my_followed_tags() -> (Result<vec text, QueryError>) query;
    const result = await actor.get_my_followed_tags();

    if ("Ok" in result) {
      return { Ok: result.Ok };
    } else if ("Err" in result) {
      return { Err: result.Err };
    } else {
      // This case might occur if the backend returns an unexpected format
      // or if the type definition used by the actor is incorrect.
      console.error('Unexpected response format from get_my_followed_tags:', result);
      return { Err: "Unexpected response format" };
    }
  } catch (error) {
    console.error('Error in getMyFollowedTags:', error);
    // Provide a more specific error message if possible, e.g., based on error type
    return { Err: "Failed to load followed tags" };
  }
}

/**
 * Get the list of users (Principals) followed by the current user
 */
export async function getMyFollowedUsers(actor: ActorSubclass<_SERVICE>): Promise<Result<Principal[], QueryError>> {
  try {
    // TODO: Ensure 'get_my_followed_users' exists in perpetua.did and types are regenerated.
    // Assuming backend method is get_my_followed_users() -> (Result<vec principal, QueryError>) query;
    const result = await actor.get_my_followed_users(); // Linter error expected if types not updated

    if ("Ok" in result) {
      // Convert principals to string representation for easier handling in frontend state if needed,
      // but returning Principal objects might be more idiomatic for IC interactions.
      // For now, return as Principal[] as defined by the expected backend type.
      return { Ok: result.Ok };
    } else if ("Err" in result) {
      return { Err: result.Err };
    } else {
      console.error('Unexpected response format from get_my_followed_users:', result);
      return { Err: "Unexpected response format" };
    }
  } catch (error) {
    console.error('Error in getMyFollowedUsers:', error);
    return { Err: "Failed to load followed users" };
  }
}
