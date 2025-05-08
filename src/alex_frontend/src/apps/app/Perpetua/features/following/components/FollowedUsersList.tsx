import React, { useState, useCallback } from 'react';
import { Button } from '@/lib/components/button';
import { Badge } from '@/lib/components/badge';
import { toast } from 'sonner';
import { unfollowUser } from '@/apps/app/Perpetua/state/services/followService';
import { X, User, Loader2 } from 'lucide-react';
import { useFollowStatus } from '../hooks/useFollowStatus';
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/alert";
import { Skeleton } from "@/lib/components/skeleton";
import { FollowedUserBadge } from './FollowedUserBadge';


export const FollowedUsersList: React.FC = () => {
    // Use the hook to get followed users and manage state
    const { followedUsers, isLoading, error, toggleFollowUser } = useFollowStatus();
    
    // State to manage loading status for individual users during unfollow
    const [unfollowingUserPrincipal, setUnfollowingUserPrincipal] = useState<string | null>(null);

    // TODO: Replace placeholder data with actual state/props from data fetching
    // const followedUsers = placeholderFollowedUsers; // Removed placeholder

    const handleUnfollow = useCallback(async (principalString: string) => {
        setUnfollowingUserPrincipal(principalString);
        try {
            await toggleFollowUser(principalString);
            // Toast messages (success/error) are handled within the useFollowStatus hook
        } catch (err) { 
            console.error("Error triggering unfollow from list:", err);
            // Errors also handled by the hook
        } finally {
            setUnfollowingUserPrincipal(null); // Reset loading state for this specific user
        }
    }, [toggleFollowUser]);

    if (isLoading) {
        return (
            <div className="mb-4 font-serif">
                <h3 className="mb-2 font-semibold text-base">Following Users:</h3>
                <div className="flex flex-wrap gap-2 items-center">
                    {[...Array(2)].map((_, index) => (
                        <Skeleton key={index} className="h-7 w-32 rounded-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
      return (
        <div className="mb-4 font-serif text-destructive">
          <h3 className="mb-2 font-semibold text-base">Following Users:</h3>
          <p>Error loading followed users: {typeof error === 'string' ? error : JSON.stringify(error)}</p>
        </div>
      );
    }

    if (followedUsers.size === 0) {
        return <p className="text-sm text-muted-foreground mb-4 font-serif">You are not following any users yet.</p>;
    }

    return (
        <div className="mb-4 font-serif">
            <h3 className="mb-2 font-semibold text-base">Following Users:</h3>
            <div className="flex flex-wrap gap-2 items-center">
                {Array.from(followedUsers).map(principalString => (
                    <FollowedUserBadge 
                        key={principalString}
                        principalString={principalString}
                        onUnfollow={handleUnfollow}
                        isUnfollowingThisUser={unfollowingUserPrincipal === principalString}
                    />
                ))}
            </div>
        </div>
    );
}; 