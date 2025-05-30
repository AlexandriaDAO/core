import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMyFollowedTags, unfollowTag as unfollowTagService, followTag as followTagService } from '../services/followService'; // Assuming followService.ts is in ../services/
import { RootState } from '@/store'; // For getState type if needed
import { extractErrorMessage } from '../../utils';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../../../declarations/perpetua/perpetua.did';

type RejectValue = string;

/**
 * Load the current user's followed tags.
 */
export const loadMyFollowedTags = createAsyncThunk<
  string[], // Return type on success (array of tag strings)
  ActorSubclass<_SERVICE>,       // Argument type (none for this thunk)
  { rejectValue: RejectValue }
>(
  'perpetua/loadMyFollowedTags',
  async (actor, { rejectWithValue }) => {
    try {
      const result = await getMyFollowedTags(actor);
      if ('Ok' in result) {
        return result.Ok;
      } else {
        return rejectWithValue(result.Err || 'Failed to load followed tags.');
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load followed tags.'));
    }
  }
);

/**
 * Unfollow a tag and then refresh the followed tags list.
 */
export const unfollowTag = createAsyncThunk<
  string[], // Returns the new list of followed tags
  {actor: ActorSubclass<_SERVICE>, tagToUnfollow: string},   // Argument: the tag to unfollow
  { rejectValue: RejectValue; state: RootState }
>(
  'perpetua/unfollowTag',
  async ({actor, tagToUnfollow}, { dispatch, rejectWithValue }) => {
    try {
      const unfollowResult = await unfollowTagService(actor, tagToUnfollow);
      if ('Ok' in unfollowResult) {
        // After successful unfollow, dispatch loadMyFollowedTags to refresh the list
        const refreshResultAction = await dispatch(loadMyFollowedTags(actor));
        if (loadMyFollowedTags.fulfilled.match(refreshResultAction)) {
          return refreshResultAction.payload; // Return the refreshed list
        } else {
          // Handle case where refreshing the list fails
          const errorPayload = refreshResultAction.payload as string || 'Failed to refresh followed tags after unfollowing.';
          return rejectWithValue(errorPayload);
        }
      } else {
        return rejectWithValue(unfollowResult.Err || `Failed to unfollow tag: ${tagToUnfollow}.`);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, `Failed to unfollow tag: ${tagToUnfollow}.`));
    }
  }
);

/**
 * Follow a tag and then refresh the followed tags list.
 */
export const followTag = createAsyncThunk<
  string[], // Returns the new list of followed tags
  {actor: ActorSubclass<_SERVICE>, tagToFollow: string},   // Argument: the tag to follow
  { rejectValue: RejectValue; state: RootState }
>(
  'perpetua/followTag',
  async ({actor, tagToFollow}, { dispatch, rejectWithValue }) => {
    try {
      const followResult = await followTagService(actor, tagToFollow);
      if ('Ok' in followResult) {
        // After successful follow, dispatch loadMyFollowedTags to refresh the list
        const refreshResultAction = await dispatch(loadMyFollowedTags(actor));
        if (loadMyFollowedTags.fulfilled.match(refreshResultAction)) {
          return refreshResultAction.payload; // Return the refreshed list
        } else {
           // Handle case where refreshing the list fails
          const errorPayload = refreshResultAction.payload as string || 'Failed to refresh followed tags after following.';
          return rejectWithValue(errorPayload);
        }
      } else {
        return rejectWithValue(followResult.Err || `Failed to follow tag: ${tagToFollow}.`);
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, `Failed to follow tag: ${tagToFollow}.`));
    }
  }
); 