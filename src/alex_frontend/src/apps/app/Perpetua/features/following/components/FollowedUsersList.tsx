import React, { useState, useCallback } from 'react';
import { Button } from '@/lib/components/button';
import { Badge } from '@/lib/components/badge';
import { toast } from 'sonner';
import { unfollowUser } from '@/apps/app/Perpetua/state/services/followService';
import { X, User } from 'lucide-react';

// Placeholder data - Replace with actual data fetching later
const placeholderFollowedUsers = [
    'qoctq-giaaa-aaaaa-aaaea-cai', // Example Principals
    'a4gq5-oaaaa-aaaab-qaa4q-cai',
    'ryjl3-tyaaa-aaaaa-aaaba-cai'
];

// Helper to format principal
const formatPrincipal = (id: string) => {
    if (!id) return '';
    if (id.length <= 10) return id;
    return `${id.substring(0, 5)}...${id.substring(id.length - 3)}`;
};


export const FollowedUsersList: React.FC = () => {
    // State to manage loading status for individual users during unfollow
    const [unfollowingUser, setUnfollowingUser] = useState<string | null>(null);

    // TODO: Replace placeholder data with actual state/props from data fetching
    const followedUsers = placeholderFollowedUsers;

    const handleUnfollow = useCallback(async (principal: string) => {
        setUnfollowingUser(principal);
        try {
            const result = await unfollowUser(principal);
            if ('Ok' in result) {
                toast.success(`Unfollowed user ${formatPrincipal(principal)}`);
                // TODO: Remove user from local state/trigger refetch once real data source exists
            } else {
                toast.error(`Failed to unfollow user: ${result.Err}`);
            }
        } catch (error) {
            console.error("Error unfollowing user:", error);
            toast.error("An error occurred while unfollowing the user.");
        } finally {
            setUnfollowingUser(null);
        }
    }, []);

    if (followedUsers.length === 0) {
        // Optionally show a message
        // return <p className="text-sm text-muted-foreground mb-4">You are not following any users yet.</p>;
        return null;
    }

    return (
        <div className="mb-4 font-serif">
            <h3 className="mb-2 font-semibold text-base">Following Users:</h3>
            <div className="flex flex-wrap gap-2 items-center">
                {followedUsers.map(principal => (
                    <Badge key={principal} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                        <User size={12} className="text-muted-foreground" />
                        <span title={principal}>{formatPrincipal(principal)}</span>
                        <Button
                            variant="ghost"
                            // Removed size="icon"
                            className="h-5 w-5 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            onClick={() => handleUnfollow(principal)}
                            disabled={unfollowingUser === principal}
                            aria-label={`Unfollow user ${formatPrincipal(principal)}`}
                        >
                            {unfollowingUser === principal ? (
                                <span className="animate-spin text-xs">...</span> // Simple spinner
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