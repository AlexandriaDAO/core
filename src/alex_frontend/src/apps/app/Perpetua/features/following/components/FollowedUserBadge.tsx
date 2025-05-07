import React, { useState, useCallback } from 'react';
import { Button } from '@/lib/components/button';
import { Badge } from '@/lib/components/badge';
import { User, X, Loader2 } from 'lucide-react';
import { useUsername } from '@/hooks/useUsername';

interface FollowedUserBadgeProps {
  principalString: string;
  onUnfollow: (principalString: string) => Promise<void>; // Make it async if toggleFollowUser is
  isUnfollowingThisUser: boolean; // To disable button during this specific user unfollow
}

// Helper to format principal (can be kept here or moved to a shared util if used elsewhere)
const formatPrincipal = (id: string) => {
  if (!id) return '';
  if (id.length <= 10) return id;
  return `${id.substring(0, 5)}...${id.substring(id.length - 3)}`;
};

export const FollowedUserBadge: React.FC<FollowedUserBadgeProps> = ({ 
  principalString,
  onUnfollow,
  isUnfollowingThisUser 
}) => {
  const { username, isLoading: isLoadingUsername } = useUsername(principalString);

  const displayName = isLoadingUsername 
    ? 'Loading...' 
    : username || formatPrincipal(principalString);

  const handleBadgeUnfollow = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent clicks if necessary
    await onUnfollow(principalString);
  };

  return (
    <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 group relative font-serif">
      <User size={12} className="text-muted-foreground mr-0.5" />
      <span title={principalString}>{displayName}</span>
      <Button
        variant="ghost"
        className="h-5 w-5 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 flex items-center justify-center transition-opacity opacity-50 group-hover:opacity-100"
        onClick={handleBadgeUnfollow}
        disabled={isUnfollowingThisUser}
        aria-label={`Unfollow ${displayName}`}
        title={`Unfollow ${displayName} (${principalString})`}
      >
        {isUnfollowingThisUser ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X size={14} />
        )}
      </Button>
    </Badge>
  );
}; 