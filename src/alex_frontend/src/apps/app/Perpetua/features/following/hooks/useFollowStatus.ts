import { useState, useEffect, useCallback } from 'react';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import {
  getMyFollowedUsers,
  getMyFollowedTags,
  followUser,
  unfollowUser
} from '@/apps/app/Perpetua/state/services/followService';
import { useIdentity } from '@/hooks/useIdentity';
import { Result } from '@/apps/app/Perpetua/utils'; // Import Result from its definition file
import { QueryError } from '@/../../declarations/perpetua/perpetua.did'; // Import QueryError from declarations

// Define a more specific error type if needed, or use string/null
type FollowError = string | null;

interface UseFollowStatusReturn {
  followedTags: Set<string>;
  followedUsers: Set<string>; // Store principal strings for easy lookup
  isLoading: boolean;
  error: QueryError | string | null; // Use a union type for potential errors
  isFollowingTag: (tag: string) => boolean;
  isFollowingUser: (userId: string | Principal) => boolean;
  toggleFollowTag: (tag: string) => Promise<void>;
  toggleFollowUser: (principalString: string) => Promise<void>;
  refetchData: () => void;
}

/**
 * Hook to manage and interact with the current user's follow status for tags and users.
 */
export const useFollowStatus = (): UseFollowStatusReturn => {
  const { identity } = useIdentity();
  const [followedTags, setFollowedTags] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<QueryError | string | null>(null);

  const fetchData = useCallback(async () => {
    if (!identity) {
      setFollowedUsers(new Set());
      setFollowedTags(new Set());
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    let combinedError: string | QueryError | null = null;

    try {
      const [usersResult, tagsResult] = await Promise.all([
        getMyFollowedUsers(),
        getMyFollowedTags()
      ]);

      if ('Ok' in usersResult) {
        setFollowedUsers(new Set(usersResult.Ok.map(p => p.toText())));
      } else {
        console.error("Failed to fetch followed users:", usersResult.Err);
        combinedError = usersResult.Err;
      }

      if ('Ok' in tagsResult) {
        setFollowedTags(new Set(tagsResult.Ok));
      } else {
        console.error("Failed to fetch followed tags:", tagsResult.Err);
        if (combinedError) {
          combinedError = `${JSON.stringify(combinedError)}; ${JSON.stringify(tagsResult.Err)}`; // Simple combination
        } else {
          combinedError = tagsResult.Err;
        }
      }

      if (combinedError) {
        setError(combinedError);
      }

    } catch (err) {
      console.error("Unexpected error fetching follow status:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setFollowedUsers(new Set());
      setFollowedTags(new Set());
    } finally {
      setIsLoading(false);
    }
  }, [identity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isFollowingTag = useCallback((tag: string): boolean => {
    return followedTags.has(tag);
  }, [followedTags]);

  const isFollowingUser = useCallback((userId: string | Principal): boolean => {
    const principalString = typeof userId === 'string' ? userId : userId.toText();
    return followedUsers.has(principalString);
  }, [followedUsers]);

  const toggleFollowTag = useCallback(async (tag: string): Promise<void> => {
    const currentlyFollowing = isFollowingTag(tag);
    const action = currentlyFollowing ? unfollowUser : followUser;
    const optimisticUpdate = () => {
      setFollowedTags(prev => {
        const newSet = new Set(prev);
        if (currentlyFollowing) {
          newSet.delete(tag);
        } else {
          newSet.add(tag);
        }
        return newSet;
      });
    };

    optimisticUpdate();
    const actionVerb = currentlyFollowing ? 'Unfollow' : 'Follow';
    const toastId = toast.loading(`${currentlyFollowing ? 'Unfollowing' : 'Following'} tag "${tag}"...`);

    try {
      const result = await action(tag);
      if ('Ok' in result) {
        toast.success(`${actionVerb}ed tag: ${tag}`, { id: toastId });
      } else {
        toast.error(`Failed to ${actionVerb.toLowerCase()} tag: ${result.Err}`, { id: toastId });
        fetchData(); // Revert
      }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast.error(`Error ${actionVerb.toLowerCase()}ing tag: ${errorMessage}`, { id: toastId });
        fetchData(); // Revert
    }
  }, [isFollowingTag, fetchData]);

  const toggleFollowUser = useCallback(async (principalString: string) => {
    if (!identity) {
      toast.error("You must be logged in to follow or unfollow users.");
      throw new Error("User not authenticated");
    }

    const isCurrentlyFollowing = followedUsers.has(principalString);
    const action = isCurrentlyFollowing ? unfollowUser : followUser;
    const actionVerb = isCurrentlyFollowing ? 'Unfollow' : 'Follow';
    const originalUsers = new Set(followedUsers);
    let apiResult: Result<boolean, string> | null = null;

    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyFollowing) {
        newSet.delete(principalString);
      } else {
        newSet.add(principalString);
      }
      return newSet;
    });

    try {
      apiResult = await action(principalString);

      if ('Ok' in apiResult) {
        toast.success(`${actionVerb}ed user successfully.`);
      } else {
        console.error(`Failed to ${actionVerb.toLowerCase()} user:`, apiResult.Err);
        toast.error(`Failed to ${actionVerb.toLowerCase()} user: ${apiResult.Err}`);
        setFollowedUsers(originalUsers);
        throw new Error(apiResult.Err);
      }
    } catch (err) {
      console.error(`Error during ${actionVerb.toLowerCase()} user:`, err);
      if (!(err instanceof Error && apiResult && 'Err' in apiResult && err.message === apiResult.Err)) {
        const errorMessage = err instanceof Error ? err.message : `Failed to ${actionVerb.toLowerCase()} user.`;
        toast.error(errorMessage);
      }
      setFollowedUsers(originalUsers);
      throw err;
    }
  }, [identity, followedUsers]);

  return {
    followedTags,
    followedUsers,
    isLoading,
    error,
    isFollowingTag,
    isFollowingUser,
    toggleFollowTag,
    toggleFollowUser,
    refetchData: fetchData,
  };
}; 