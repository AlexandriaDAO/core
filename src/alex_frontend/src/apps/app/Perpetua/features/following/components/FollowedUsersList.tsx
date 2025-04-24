import React, { useState, useCallback } from 'react';
import { Button } from '@/lib/components/button';
import { Badge } from '@/lib/components/badge';
import { toast } from 'sonner';
import { unfollowUser } from '@/apps/app/Perpetua/state/services/followService';
import { X, User, Loader2 } from 'lucide-react';
import { useFollowStatus } from '../hooks/useFollowStatus';
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/alert";
import { Skeleton } from "@/lib/components/skeleton";
import { Principal } from '@dfinity/principal';

// Placeholder data - Replace with actual data fetching later
// const placeholderFollowedUsers = [
//     'qoctq-giaaa-aaaaa-aaaea-cai', // Example Principals
//     'a4gq5-oaaaa-aaaab-qaa4q-cai',
//     'ryjl3-tyaaa-aaaaa-aaaba-cai'
// ];

// Helper to format principal
const formatPrincipal = (id: string) => {
    if (!id) return '';
    if (id.length <= 10) return id;
    return `${id.substring(0, 5)}...${id.substring(id.length - 3)}`;
};


export const FollowedUsersList: React.FC = () => {
    // Use the hook to get followed users and manage state
    const { followedUsers, isLoading, error, toggleFollowUser, refetch } = useFollowStatus();
    
    // State to manage loading status for individual users during unfollow
    const [unfollowingUserPrincipal, setUnfollowingUserPrincipal] = useState<string | null>(null);

    // TODO: Replace placeholder data with actual state/props from data fetching
    // const followedUsers = placeholderFollowedUsers; // Removed placeholder

    const handleUnfollow = useCallback(async (principalString: string) => {
        setUnfollowingUserPrincipal(principalString);
        try {
            await toggleFollowUser(principalString);
            // Toast messages (success/error) are handled within the hook
        } catch (err) { 
            // Hook should handle errors, but log here just in case
            console.error("Error triggering unfollow from list:", err);
        } finally {
            setUnfollowingUserPrincipal(null);
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
            <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error Loading Followed Users</AlertTitle>
                <AlertDescription>{typeof error === 'string' ? error : JSON.stringify(error)}</AlertDescription>
                <Button onClick={refetch} variant="secondary" className="mt-2">Retry</Button>
            </Alert>
        );
    }

    if (followedUsers.size === 0) {
        return <p className="text-sm text-muted-foreground mb-4 font-serif">You are not following any users yet.</p>;
    }

    return (
        <div className="mb-4 font-serif">
            <h3 className="mb-2 font-semibold text-base">Following Users:</h3>
            <div className="flex flex-wrap gap-2 items-center">
                {/* Convert Set to Array for mapping */} 
                {Array.from(followedUsers).map(principalString => (
                    <Badge key={principalString} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1 group relative">
                        <User size={12} className="text-muted-foreground" />
                        <span title={principalString}>{formatPrincipal(principalString)}</span>
                        <Button
                            variant="ghost"
                            className="h-5 w-5 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-opacity opacity-50 group-hover:opacity-100"
                            onClick={() => handleUnfollow(principalString)}
                            disabled={unfollowingUserPrincipal === principalString}
                            aria-label={`Unfollow user ${formatPrincipal(principalString)}`}
                            title={`Unfollow user ${principalString}`}
                        >
                            {unfollowingUserPrincipal === principalString ? (
                                <Loader2 className="h-3 w-3 animate-spin" /> // Use Loader2
                            ) : (
                                <X size={14} />
                            )}
                        </Button>
                    </Badge>
                ))}
            </div>
        </div>
    );
}; 