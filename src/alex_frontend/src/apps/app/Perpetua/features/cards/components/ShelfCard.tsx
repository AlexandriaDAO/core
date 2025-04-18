import React, { useState, useCallback } from 'react';
import { Card, CardContent } from "@/lib/components/card";
import { Badge } from "@/lib/components/badge";
import { Folder, ChevronDown, Calendar, User, Tag, Clock, Info, Copy, Check, Link, Globe, Lock, PlusCircle, Loader2 } from "lucide-react";
import { ShelfCardActionMenu } from './ShelfCardActionMenu';
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { Button } from "@/lib/components/button";
import { Shelf } from "@/../../declarations/perpetua/perpetua.did";
import { format } from 'date-fns';
import { followTag } from '@/apps/app/Perpetua/state/services/followService';
import { toast } from 'sonner';

export interface ShelfCardProps {
  shelf: Shelf;
  onViewShelf?: (shelfId: string) => void;
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
      if ('Ok' in result) {
        toast.success(`Followed tag: ${tag}`);
        // TODO: Update local/global state later to visually indicate followed status
        // e.g., disable button, change icon to Check, or sync with a global followed tags list
      } else {
        toast.error(`Failed to follow tag: ${result.Err}`);
      }
    } catch (error) {
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
                <ShelfCardActionMenu
                  contentId={shelf.shelf_id}
                  contentType="Shelf"
                  currentShelfId={shelf.shelf_id}
                  parentShelfId={parentShelfId}
                  itemId={itemId}
                />
                
                <div className="text-center p-6 h-full flex flex-col items-center justify-center">
                  <div className="text-xl font-semibold truncate max-w-full mb-1 font-serif">{shelf.title}</div>
                  {shelf.description?.[0] && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2 font-serif">{shelf.description[0]}</div>
                  )}

                  {/* Basic info badges displayed on the card itself */}
                  <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                    <Badge variant="secondary" className="text-xs font-serif">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </Badge>
                    
                    {isPublic ? (
                      <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 flex items-center gap-1 font-serif">
                        <Globe className="h-3 w-3" /> Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 flex items-center gap-1 font-serif">
                        <Lock className="h-3 w-3" /> Private
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
            
            <Button
              variant="secondary"
              className="absolute bottom-2 right-2 z-[30] opacity-70 hover:opacity-100 transition-opacity duration-200 h-7 w-7 p-0 bg-white/80 hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900 shadow-md rounded-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setIsFooterExpanded(!isFooterExpanded);
              }}
            >
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isFooterExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </AspectRatio>
        </CardContent>
      </Card>
      
      {/* Expanded footer with detailed information */}
      {isFooterExpanded && (
        <div 
          className="absolute bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg z-10 p-4 rounded-b-lg animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2 text-xs font-serif">
            {/* Combined section with all metadata */}
            <div className="grid gap-2">
              {/* Tags */}
              {/* {shelf.tags && shelf.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center mb-2">
                  {shelf.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 flex items-center gap-1 font-serif">
                      <Tag className="h-3 w-3 text-gray-500" /> {tag}
                    </Badge>
                  ))}
                </div>
              )} */}
              
              {isReordering && (
                <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 mb-2 inline-flex font-serif">
                  Drag to reorder
                </Badge>
              )}

              {/* ID Badge */}
              <div 
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/60 cursor-pointer group/item transition-colors"
                onClick={() => handleCopy(shelf.shelf_id, setCopiedId)}
                title={`Shelf ID: ${shelf.shelf_id}`}
              >
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">ID</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 dark:text-gray-400">{formatId(shelf.shelf_id)}</span>
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-green-500 opacity-100" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-gray-400 opacity-70 group-hover/item:opacity-100" />
                  )}
                </div>
              </div>
              
              {/* Owner Badge */}
              <div 
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer group/owner transition-colors"
                onClick={() => {
                  const ownerText = typeof shelf.owner === 'string' ? shelf.owner : shelf.owner?.toString();
                  if (ownerText) handleCopy(ownerText, setCopiedOwner);
                }}
              >
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Owner</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-600 dark:text-blue-400">{formatId(typeof shelf.owner === 'string' ? shelf.owner : shelf.owner?.toString() || '')}</span>
                  {copiedOwner ? (
                    <Check className="h-3.5 w-3.5 text-green-500 opacity-100" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-blue-400 opacity-70 group-hover/owner:opacity-100" />
                  )}
                </div>
              </div>
              
              {/* Created Date Badge */}
              <div 
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/60 cursor-pointer group/created transition-colors"
                onClick={() => {
                  if (shelf.created_at) handleCopy(createdAt, setCopiedCreated);
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Created</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 dark:text-gray-400">{createdAt}</span>
                  {copiedCreated ? (
                    <Check className="h-3.5 w-3.5 text-green-500 opacity-100" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-gray-400 opacity-70 group-hover/created:opacity-100" />
                  )}
                </div>
              </div>
              
              {/* Updated Date Badge */}
              <div 
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/60 cursor-pointer group/updated transition-colors"
                onClick={() => {
                  if (shelf.updated_at) handleCopy(updatedAt, setCopiedUpdated);
                }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Updated</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 dark:text-gray-400">{updatedAt}</span>
                  {copiedUpdated ? (
                    <Check className="h-3.5 w-3.5 text-green-500 opacity-100" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-gray-400 opacity-70 group-hover/updated:opacity-100" />
                  )}
                </div>
              </div>
              
              {/* Appears in */}
              {shelf.appears_in && shelf.appears_in.length > 0 && (
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <Folder className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Appears in</span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-serif">
                    {shelf.appears_in.length} {shelf.appears_in.length === 1 ? 'shelf' : 'shelves'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 