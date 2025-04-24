import { useState, useEffect, useCallback } from 'react';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import {
  followTag,
  unfollowTag,
  getMyFollowedTags,
  followUser,
  unfollowUser,
  getMyFollowedUsers,
} from '@/apps/app/Perpetua/state/services/followService';
import { QueryError } from '@/apps/app/Perpetua/state/services/serviceTypes';

interface UseFollowStatusReturn {
  followedTags: Set<string>;
  followedUsers: Set<string>; // Store principal strings for easy lookup
  isLoading: boolean;
  error: QueryError | string | null; // Allow generic string for catch blocks
  isFollowingTag: (tag: string) => boolean;
  isFollowingUser: (userId: string | Principal) => boolean;
  toggleFollowTag: (tag: string) => Promise<void>;
  toggleFollowUser: (userId: string | Principal) => Promise<void>;
  refetch: () => void;
}

/**
 * Hook to manage and interact with the current user's follow status for tags and users.
 */
export const useFollowStatus = (): UseFollowStatusReturn => {
  const [followedTags, setFollowedTags] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<QueryError | string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tagsResult, usersResult] = await Promise.all([
        getMyFollowedTags(),
        getMyFollowedUsers(),
      ]);

      if ('Ok' in tagsResult) {
        setFollowedTags(new Set(tagsResult.Ok));
      } else {
        console.error("Failed to fetch followed tags:", tagsResult.Err);
        setError(tagsResult.Err ?? 'Failed to fetch tags');
      }

      if ('Ok' in usersResult) {
        setFollowedUsers(new Set(usersResult.Ok.map(p => p.toText())));
      } else {
        console.error("Failed to fetch followed users:", usersResult.Err);
        setError(usersResult.Err ?? 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching follow status:', err);
      setError(err instanceof Error ? err.message : 'Network or unexpected error fetching follow status.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    const action = currentlyFollowing ? unfollowTag : followTag;
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
    const actionVerb = currentlyFollowing ? 'Unfollowed' : 'Followed';
    const toastId = toast.loading(`${currentlyFollowing ? 'Unfollowing' : 'Following'} tag "${tag}"...`);

    try {
      const result = await action(tag);
      if ('Ok' in result) {
        toast.success(`${actionVerb} tag: ${tag}`, { id: toastId });
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

  const toggleFollowUser = useCallback(async (userId: string | Principal): Promise<void> => {
    const principal = typeof userId === 'string' ? Principal.fromText(userId) : userId;
    const principalString = principal.toText();
    const currentlyFollowing = isFollowingUser(principalString);
    const action = currentlyFollowing ? unfollowUser : followUser;
    const optimisticUpdate = () => {
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        if (currentlyFollowing) {
          newSet.delete(principalString);
        } else {
          newSet.add(principalString);
        }
        return newSet;
      });
    };

    optimisticUpdate();
    const actionVerb = currentlyFollowing ? 'Unfollowed' : 'Followed';
    const shortPrincipal = `${principalString.substring(0, 5)}...`;
    const toastId = toast.loading(`${currentlyFollowing ? 'Unfollowing' : 'Following'} user ${shortPrincipal}...`);

    try {
      const result = await action(principal);
      if ('Ok' in result) {
        toast.success(`${actionVerb} user ${shortPrincipal}`, { id: toastId });
      } else {
        toast.error(`Failed to ${actionVerb.toLowerCase()} user: ${result.Err}`, { id: toastId });
         fetchData(); // Revert
      }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast.error(`Error ${actionVerb.toLowerCase()}ing user: ${errorMessage}`, { id: toastId });
         fetchData(); // Revert
    }
  }, [isFollowingUser, fetchData]);

  return {
    followedTags,
    followedUsers,
    isLoading,
    error,
    isFollowingTag,
    isFollowingUser,
    toggleFollowTag,
    toggleFollowUser,
    refetch: fetchData,
  };
}; 