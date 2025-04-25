import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/lib/components/button';
import { Badge } from '@/lib/components/badge';
import { toast } from 'sonner';
import { unfollowTag, getMyFollowedTags } from '@/apps/app/Perpetua/state/services/followService';
import { X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/alert";
import { Skeleton } from "@/lib/components/skeleton";

export const FollowedTagsList: React.FC = () => {
    const [followedTags, setFollowedTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unfollowingTag, setUnfollowingTag] = useState<string | null>(null);

    const fetchFollowedTags = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getMyFollowedTags();
            if ('Ok' in result) {
                setFollowedTags(result.Ok);
            } else {
                setError(result.Err || 'Failed to load followed tags.');
                toast.error(result.Err || 'Failed to load followed tags.');
            }
        } catch (err) {
            console.error("Error fetching followed tags:", err);
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(errorMessage);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFollowedTags();
    }, [fetchFollowedTags]);

    const handleUnfollow = useCallback(async (tag: string) => {
        setUnfollowingTag(tag);
        try {
            const result = await unfollowTag(tag);
            if ('Ok' in result) {
                toast.success(`Unfollowed tag: ${tag}`);
                setFollowedTags(current => current.filter(t => t !== tag));
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

    if (isLoading) {
        return (
            <div className="mb-4 font-serif">
                <h3 className="mb-2 font-semibold text-base">Following Tags:</h3>
                <div className="flex flex-wrap gap-2 items-center">
                    {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-7 w-20 rounded-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (followedTags.length === 0) {
        return <p className="text-sm text-muted-foreground mb-4 font-serif">You are not following any tags yet.</p>;
    }

    return (
        <div className="mb-4 font-serif">
            <h3 className="mb-2 font-semibold text-base">Following Tags:</h3>
            <div className="flex flex-wrap gap-2 items-center">
                {followedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1 group relative">
                        <span>{tag}</span>
                        <Button
                            variant="ghost"
                            className="h-5 w-5 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-opacity opacity-50 group-hover:opacity-100"
                            onClick={() => handleUnfollow(tag)}
                            disabled={unfollowingTag === tag}
                            aria-label={`Unfollow tag ${tag}`}
                            title={`Unfollow tag ${tag}`}
                        >
                            {unfollowingTag === tag ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
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