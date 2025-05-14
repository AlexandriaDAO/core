import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from "@/lib/components/card";
import { Badge } from "@/lib/components/badge";
import { Folder, ChevronDown, Calendar, User, Tag, Clock, Info, Copy, Check, Link, Globe, Lock, PlusCircle, Loader2, UserPlus } from "lucide-react";
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { Button } from "@/lib/components/button";
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { format } from 'date-fns';
import { followTag } from '@/apps/app/Perpetua/state/services/followService';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { UnifiedCardActions } from '@/apps/Modules/shared/components/UnifiedCardActions/UnifiedCardActions';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useUsername } from '@/hooks/useUsername';
import { useFollowStatus } from '../../following/hooks/useFollowStatus';

export interface ShelfCardProps {
  shelf: ShelfPublic;
  onViewShelf?: (shelfId: string) => void;
  onViewOwner?: (ownerId: string) => void;
  parentShelfId?: string;
  itemId?: number;
  isReordering?: boolean;
  showCollaborationInfo?: boolean;
  collaborationData?: {
    isOwner?: boolean;
    isCollaborator?: boolean;
    editorsCount?: number;
  };
  isPublic?: boolean;
}

/**
 * Consolidated ShelfCard component that works for both private and public views
 */
export const ShelfCard: React.FC<ShelfCardProps> = ({ 
  shelf, 
  onViewShelf,
  onViewOwner,
  parentShelfId,
  itemId,
  isReordering = false,
  showCollaborationInfo = false,
  collaborationData,
  isPublic = false
}) => {
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const itemCount = Object.keys(shelf.items).length;
  
  // State to track which tag is currently being followed
  const [followingTag, setFollowingTag] = useState<string | null>(null);

  // Get current user principal to determine ownership
  const { user } = useSelector((state: RootState) => state.auth);
  const currentUserPrincipal = user?.principal;

  const ownerPrincipalString = useMemo(() => {
    if (shelf.owner instanceof Principal) {
      return shelf.owner.toText();
    }
    // If not a Principal, it should be a string based on ShelfPublic type.
    // String() handles if it's already a string or converts other primitives.
    // Fallback to empty string if shelf.owner is unexpectedly null/undefined.
    return String(shelf.owner || ''); 
  }, [shelf.owner]);

  const { username: ownerUsername, isLoading: isLoadingOwnerUsername } = useUsername(ownerPrincipalString);

  // Format dates if they exist
  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      // Convert bigint to number for date formatting
      // Divide by 1,000,000 to convert nanoseconds to milliseconds if necessary
      // or use as is if already in milliseconds
      const timeInMillis = Number(timestamp) > 1000000000000000 
        ? Number(timestamp) / 1000000 
        : Number(timestamp);
      const date = new Date(timeInMillis);
      
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return `Timestamp: ${timestamp.toString()}`;
      }
      
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      // If conversion fails, at least show the raw timestamp
      return `Timestamp: ${timestamp.toString()}`;
    }
  };

  const createdAt = formatDate(shelf.created_at);
  const updatedAt = formatDate(shelf.updated_at);

  // --- Tag Follow Handler ---
  const handleFollowTag = useCallback(async (tag: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when clicking tag follow button
    setFollowingTag(tag); // Set loading state for this specific tag
    try {
      const result = await followTag(tag);

      if ('Ok' in result && result.Ok === true) {
        toast.success(`Followed tag: ${tag}`);
        // TODO: Update local/global state later to visually indicate followed status
        // e.g., disable button, change icon to Check, or sync with a global followed tags list
      } else if ('Err' in result) {
        // Check if the error indicates the tag was already followed
        if (result.Err.toLowerCase().includes('already following')) {
          toast.info(`Already following tag: ${tag}`);
        } else {
          // Handle other backend errors
          toast.error(`Failed to follow tag: ${result.Err}`);
        }
      } 
      // No action needed if result is { Ok: false } which shouldn't happen with the current service logic,
      // but added robustness in case the service changes.

    } catch (error) {
      // Catch frontend/network errors during the service call
      console.error("Error following tag:", error);
      toast.error("An unexpected error occurred while trying to follow the tag.");
    } finally {
      setFollowingTag(null); // Clear loading state regardless of outcome
    }
  }, []); // No dependencies needed for now

  // Copy states
  const [copiedId, setCopiedId] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);
  const [copiedCreated, setCopiedCreated] = useState(false);
  const [copiedUpdated, setCopiedUpdated] = useState(false);
  
  // Format ID for display
  const formatId = (id: string) => {
    if (!id) return '';
    if (id.length <= 8) return id;
    return `${id.substring(0, 3)}...${id.substring(id.length - 3)}`;
  };
  
  // Handle copy functionality
  const handleCopy = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  // Determine ownership
  const ownerPrincipal = shelf.owner instanceof Principal ? shelf.owner : undefined;
  const isOwnedByUser = !!(ownerPrincipal && currentUserPrincipal && ownerPrincipal.toText() === currentUserPrincipal);

  const { 
    isFollowingUser,
    toggleFollowUser,
    isLoading: isLoadingFollowList
  } = useFollowStatus();

  const [followActionInProgress, setFollowActionInProgress] = useState(false);

  const handleToggleFollowOwner = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!ownerPrincipalString || isOwnedByUser) return;

    setFollowActionInProgress(true);
    try {
      await toggleFollowUser(ownerPrincipalString);
      // Toasts are handled by the useFollowStatus hook
    } catch (error) {
      console.error("Error toggling follow for shelf owner:", error);
      // Errors are also handled by the hook, but toast here for specific failure if needed
    } finally {
      setFollowActionInProgress(false);
    }
  };

  const isCurrentlyFollowingOwner = ownerPrincipalString ? isFollowingUser(ownerPrincipalString) : false;

  return (
    <div className="relative h-full group">
      <Card 
        className="h-full cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col relative border-gray-200/70 dark:border-gray-700/70 overflow-hidden bg-white dark:bg-gray-900"
        onClick={onViewShelf ? () => onViewShelf(shelf.shelf_id) : undefined}
      >
        <CardContent className="flex flex-col items-start p-0 flex-grow">
          <AspectRatio ratio={1} className="w-full relative">
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 h-full group-hover:bg-gray-100 dark:group-hover:bg-gray-900/80 transition-colors duration-300">
              <div className="relative w-full h-full">
                <UnifiedCardActions
                  contentId={shelf.shelf_id}
                  contentType="Shelf"
                  ownerPrincipal={ownerPrincipal}
                  parentShelfId={parentShelfId}
                  itemId={itemId}
                  currentShelfId={shelf.shelf_id}
                  onToggleDetails={() => setIsFooterExpanded(prev => !prev)}
                  showDetails={isFooterExpanded}
                  isOwned={isOwnedByUser}
                />
                
                <div className="text-center p-6 h-full flex flex-col items-center justify-center">
                  <div className="text-xl font-semibold truncate max-w-full mb-1 font-serif">{shelf.title}</div>
                  
                  {shelf.description?.[0] && (
                    <div className="text-sm text-muted-foreground mt-1 mb-2 line-clamp-2 font-serif">{shelf.description[0]}</div>
                  )}

                  {/* Owner Display with Follow Button */}
                  {ownerPrincipalString && (
                    <div className="flex items-center justify-center text-xs text-muted-foreground mb-2 font-serif">
                      <span 
                        className={`${onViewOwner ? 'cursor-pointer hover:underline' : ''}`}
                        onClick={(e) => {
                          if (onViewOwner) {
                            e.stopPropagation(); 
                            onViewOwner(ownerPrincipalString);
                          }
                        }}
                        title={onViewOwner ? `View ${ownerUsername || 'owner'}'s shelves` : undefined}
                      >
                        By: {isLoadingOwnerUsername ? 'Loading...' : ownerUsername || formatId(ownerPrincipalString)}
                      </span>
                      {!isOwnedByUser && (
                        <Button
                          variant="ghost"
                          className="h-5 w-5 ml-1 p-0 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-50"
                          onClick={handleToggleFollowOwner}
                          disabled={isLoadingFollowList || followActionInProgress}
                          title={isCurrentlyFollowingOwner ? `Unfollow ${ownerUsername || 'user'}` : `Follow ${ownerUsername || 'user'}`}
                        >
                          {followActionInProgress ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <UserPlus className={`h-4 w-4 ${isCurrentlyFollowingOwner ? 'text-primary' : ''}`} />
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Basic info badges displayed on the card itself */}
                  <div className="mt-1 flex flex-wrap gap-1.5 justify-center">
                    <Badge variant="secondary" className="text-xs font-serif">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </Badge>
                    
                    {isPublic ? (
                      <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 flex items-center gap-1 font-serif" title="Public Shelf" aria-label="Public Shelf">
                        <Globe className="h-4 w-4" />
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 flex items-center gap-1 font-serif" title="Private Shelf" aria-label="Private Shelf">
                        <Lock className="h-4 w-4" />
                      </Badge>
                    )}
                  </div>

                  {/* Render tags below other badges if they exist */}
                  {shelf.tags && shelf.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 justify-center items-center">
                      {shelf.tags.map((tag, index) => (
                        <div key={index} className="flex items-center gap-1">
                          {/* Tag Badge (now not clickable) */}
                          <Badge 
                            variant="outline" 
                            className="text-[11px] px-1.5 py-px bg-gray-50 dark:bg-gray-800 flex items-center gap-0.5 font-serif cursor-default"
                          >
                            <Tag className="h-2.5 w-2.5 text-gray-500" /> {tag}
                          </Badge>
                          {/* Follow Button */}
                          <Button
                            variant="ghost" 
                            className="h-5 w-5 p-0 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => handleFollowTag(tag, e)}
                            disabled={followingTag === tag} // Disable while this tag is being followed
                            title={`Follow tag: ${tag}`}
                            aria-label={`Follow tag ${tag}`}
                          >
                            {followingTag === tag ? (
                              <Loader2 className="h-3 w-3 animate-spin" /> // Loading spinner
                            ) : (
                              <PlusCircle className="h-4 w-4" /> // Plus icon
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AspectRatio>
        </CardContent>
      </Card>
      
      {/* Expanded footer with detailed information - Owner badge removed */}
      {isFooterExpanded && (
        <div 
          className="absolute bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg z-10 p-4 rounded-b-lg animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2 text-xs font-serif">
            <div className="grid gap-2">
              {/* ... isReordering badge ... */}
              {/* ... ID Badge ... */}
              {/* ... Created Date Badge ... */}
              {/* ... Updated Date Badge ... */}
              {/* ... Appears in badge ... */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 