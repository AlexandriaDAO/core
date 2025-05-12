import React, { useState, useCallback, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';

import { Button } from '@/lib/components/button';
import { Badge } from '@/lib/components/badge';
import { toast } from 'sonner';
import { loadMyFollowedTags, unfollowTag } from '@/apps/app/Perpetua/state/thunks/followThunks';
import { selectMyFollowedTags, selectIsLoadingMyFollowedTags } from '@/apps/app/Perpetua/state/perpetuaSlice';
import { X, Loader2 } from 'lucide-react';
import { Skeleton } from "@/lib/components/skeleton";

export const FollowedTagsList: React.FC = () => {
    const dispatch = useAppDispatch();
    const followedTags = useAppSelector(selectMyFollowedTags);
    const isLoading = useAppSelector(selectIsLoadingMyFollowedTags);
    const [unfollowingTagUi, setUnfollowingTagUi] = useState<string | null>(null);

    useEffect(() => {
        dispatch(loadMyFollowedTags());
    }, [dispatch]);

    const handleUnfollow = useCallback(async (tag: string) => {
        setUnfollowingTagUi(tag);
        try {
            await dispatch(unfollowTag(tag)).unwrap();
            toast.success(`Unfollowed tag: ${tag}`);
        } catch (err: any) {
            const errorMessage = typeof err === 'string' ? err : (err?.message || 'Failed to unfollow tag.');
            toast.error(errorMessage);
            console.error("Error unfollowing tag via thunk:", err);
        } finally {
            setUnfollowingTagUi(null);
        }
    }, [dispatch]);

    if (isLoading && followedTags.length === 0) {
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
                {followedTags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1 group relative">
                        <span>{tag}</span>
                        <Button
                            variant="ghost"
                            className="h-5 w-5 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-opacity opacity-50 group-hover:opacity-100"
                            onClick={() => handleUnfollow(tag)}
                            disabled={unfollowingTagUi === tag || isLoading}
                            aria-label={`Unfollow tag ${tag}`}
                            title={`Unfollow tag ${tag}`}
                        >
                            {unfollowingTagUi === tag ? (
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