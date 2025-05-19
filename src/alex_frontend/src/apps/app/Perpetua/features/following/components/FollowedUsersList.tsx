import React, { useState, useCallback } from 'react';
import { useIdentity } from '@/hooks/useIdentity';
import { Button } from '@/lib/components/button';
import { Badge } from '@/lib/components/badge';
import { toast } from 'sonner';
import { X, User, Loader2 } from 'lucide-react';
import { useFollowStatus } from '../hooks/useFollowStatus';
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/alert";
import { Skeleton } from "@/lib/components/skeleton";
import { FollowedUserBadge } from './FollowedUserBadge';


export const FollowedUsersList: React.FC = () => {
    const { identity } = useIdentity();
    const { followedUsers, isLoading, error, toggleFollowUser } = useFollowStatus();
    
    const [unfollowingUserPrincipal, setUnfollowingUserPrincipal] = useState<string | null>(null);

    const handleUnfollow = useCallback(async (principalString: string) => {
        setUnfollowingUserPrincipal(principalString);
        try {
            await toggleFollowUser(principalString);
        } catch (err) { 
            console.error("Error triggering unfollow from list:", err);
        } finally {
            setUnfollowingUserPrincipal(null);
        }
    }, [toggleFollowUser]);

    if (!identity) {
        return null;
    }

    return (
        <div className="bg-card text-card-foreground border rounded-lg p-4 shadow font-serif">
            <h3 className="mb-3 font-semibold text-base text-card-foreground/90">Following Users</h3>
            {isLoading && followedUsers.size === 0 ? (
                <div className="flex flex-wrap gap-2 items-center">
                    {[...Array(2)].map((_, index) => (
                        <Skeleton key={index} className="h-7 w-32 rounded-full" />
                    ))}
                </div>
            ) : error ? (
                <p className="text-sm text-destructive">
                    Error loading followed users: {typeof error === 'string' ? error : JSON.stringify(error)}
                </p>
            ) : followedUsers.size === 0 ? (
                <p className="text-sm text-muted-foreground">You are not following any users yet.</p>
            ) : (
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
            )}
        </div>
    );
}; 