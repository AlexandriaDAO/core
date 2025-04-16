import React, { useState, useCallback } from 'react';
import { Button } from '@/lib/components/button';
import { Badge } from '@/lib/components/badge';
import { toast } from 'sonner';
import { unfollowTag } from '@/apps/app/Perpetua/state/services/followService';
import { X } from 'lucide-react';

// Placeholder data - Replace with actual data fetching later
const placeholderFollowedTags = ['motoko', 'rust', 'web3', 'gaming', 'icp', 'nft'];

export const FollowedTagsList: React.FC = () => {
    // State to manage loading status for individual tags during unfollow
    const [unfollowingTag, setUnfollowingTag] = useState<string | null>(null);

    // TODO: Replace placeholder data with actual state/props from data fetching
    const followedTags = placeholderFollowedTags;

    const handleUnfollow = useCallback(async (tag: string) => {
        setUnfollowingTag(tag);
        try {
            const result = await unfollowTag(tag);
            if ('Ok' in result) {
                toast.success(`Unfollowed tag: ${tag}`);
                // TODO: Remove tag from local state/trigger refetch once real data source exists
                // Example (if using local state for placeholders): 
                // setFollowedTags(current => current.filter(t => t !== tag));
            } else {
                toast.error(`Failed to unfollow tag: ${result.Err}`);
            }
        } catch (error) {
            console.error("Error unfollowing tag:", error);
            toast.error("An error occurred while unfollowing the tag.");
        } finally {
            setUnfollowingTag(null);
        }
    }, []);

    if (followedTags.length === 0) {
        // Don't render anything if no tags are followed (or placeholder is empty)
        // Optionally show a message: 
        // return <p className="text-sm text-muted-foreground mb-4">You are not following any tags yet.</p>;
        return null;
    }

    return (
        <div className="mb-4 font-serif">
            <h3 className="mb-2 font-semibold text-base">Following Tags:</h3>
            <div className="flex flex-wrap gap-2 items-center">
                {followedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                        <span>{tag}</span>
                        <Button
                            variant="ghost"
                            className="h-5 w-5 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            onClick={() => handleUnfollow(tag)}
                            disabled={unfollowingTag === tag}
                            aria-label={`Unfollow tag ${tag}`}
                        >
                            {unfollowingTag === tag ? (
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