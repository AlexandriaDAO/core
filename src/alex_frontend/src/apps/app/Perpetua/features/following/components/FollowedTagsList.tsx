import React, { useState, useCallback, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useIdentity } from '@/lib/ic-use-identity';

import { Button } from '@/lib/components/button';
import { Badge } from '@/lib/components/badge';
import { toast } from 'sonner';
import { loadMyFollowedTags, unfollowTag } from '@/apps/app/Perpetua/state/thunks/followThunks';
import { selectMyFollowedTags, selectIsLoadingMyFollowedTags } from '@/apps/app/Perpetua/state/perpetuaSlice';
import { X, Loader2 } from 'lucide-react';
import { Skeleton } from "@/lib/components/skeleton";
import { usePerpetua } from '@/hooks/actors';

export const FollowedTagsList: React.FC = () => {
    const {actor} = usePerpetua();
    const dispatch = useAppDispatch();
    const { identity } = useIdentity();
    const followedTags = useAppSelector(selectMyFollowedTags);
    const isLoading = useAppSelector(selectIsLoadingMyFollowedTags);
    const [unfollowingTagUi, setUnfollowingTagUi] = useState<string | null>(null);

    useEffect(() => {
        if (identity && actor) {
            dispatch(loadMyFollowedTags(actor));
        }
    }, [dispatch, identity, actor]);

    const handleUnfollow = useCallback(async (tag: string) => {
        if(!actor) return;
        setUnfollowingTagUi(tag);
        try {
            await dispatch(unfollowTag({actor, tagToUnfollow: tag})).unwrap();
            toast.success(`Unfollowed tag: ${tag}`);
        } catch (err: any) {
            const errorMessage = typeof err === 'string' ? err : (err?.message || 'Failed to unfollow tag.');
            toast.error(errorMessage);
            console.error("Error unfollowing tag via thunk:", err);
        } finally {
            setUnfollowingTagUi(null);
        }
    }, [dispatch, actor]);

    if (!identity) {
        return null;
    }

    return (
        <div className="bg-card text-card-foreground border rounded-lg p-4 shadow font-serif">
            <h3 className="mb-3 font-semibold text-base text-card-foreground/90">Following Tags</h3>
            {isLoading && followedTags.length === 0 ? (
                <div className="flex flex-wrap gap-2 items-center">
                    {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-7 w-20 rounded-full" />
                    ))}
                </div>
            ) : followedTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">You are not following any tags yet.</p>
            ) : (
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
            )}
        </div>
    );
};