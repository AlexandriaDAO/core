import React, { useState } from 'react';
import { Card, CardContent } from "@/lib/components/card";
import { Badge } from "@/lib/components/badge";
import { Folder, ChevronDown, Calendar, User, Tag, Clock, Info, Copy, Check, Link } from "lucide-react";
import { ShelfCardActionMenu } from './ShelfCardActionMenu';
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { Button } from "@/lib/components/button";
import { Shelf } from "@/../../declarations/perpetua/perpetua.did";
import { format } from 'date-fns';

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
  collaborationData
}) => {
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const itemCount = Object.keys(shelf.items).length;
  
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
    <div className="relative h-full">
      <Card 
        className="h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col relative bg-white dark:bg-gray-900"
        onClick={onViewShelf ? () => onViewShelf(shelf.shelf_id) : undefined}
      >
        <CardContent className="flex flex-col items-start p-0 flex-grow">
          <AspectRatio ratio={1} className="w-full relative">
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 h-full">
              <div className="relative w-full h-full">
                <ShelfCardActionMenu
                  contentId={shelf.shelf_id}
                  contentType="Shelf"
                  currentShelfId={shelf.shelf_id}
                  parentShelfId={parentShelfId}
                  itemId={itemId}
                />
                
                <div className="text-center p-4 h-full flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center mb-2">
                    <Folder className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-lg font-semibold truncate max-w-full">{shelf.title}</div>
                  {shelf.description?.[0] && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{shelf.description[0]}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div 
              className="absolute bottom-2 right-2 z-[30]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Button
                variant="secondary"
                className="bg-white/90 hover:bg-white dark:bg-black/90 dark:hover:bg-black text-gray-600 hover:text-gray-500 border border-gray-600/20 hover:border-gray-600/40 p-1.5 rounded-md flex items-center justify-center shadow-lg backdrop-blur-sm group"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFooterExpanded(!isFooterExpanded);
                }}
              >
                <ChevronDown className={`h-4 w-4 transition-all duration-200 ${isFooterExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </AspectRatio>
        </CardContent>
      </Card>
      
      {/* Expanded footer with detailed information */}
      {isFooterExpanded && (
        <div className="absolute bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700 shadow-md z-10 p-3">
          <div className="grid grid-cols-1 gap-2 text-xs">
            {/* Basic Info Section */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px] py-0.5 px-1">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Badge>
              
              {isReordering && (
                <Badge variant="info" className="text-[10px] py-0.5 px-1">
                  Drag to reorder
                </Badge>
              )}
              
              {showCollaborationInfo && collaborationData && (
                <>
                  {collaborationData.isCollaborator && (
                    <Badge variant="info" className="text-[10px] flex items-center py-0.5 px-1">
                      Collaborator
                    </Badge>
                  )}
                  {collaborationData.isOwner && collaborationData.editorsCount && collaborationData.editorsCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] flex items-center py-0.5 px-1">
                      {collaborationData.editorsCount} {collaborationData.editorsCount === 1 ? 'editor' : 'editors'}
                    </Badge>
                  )}
                </>
              )}
            </div>
            
            {/* Metadata Section - Copyable badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
              {/* ID Badge */}
              <Badge 
                variant="secondary" 
                className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(shelf.shelf_id, setCopiedId);
                }}
                title={`Shelf ID: ${shelf.shelf_id}`}
              >
                <Info className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{formatId(shelf.shelf_id)}</span>
                {copiedId ? (
                  <Check className="h-2.5 w-2.5 text-green-500" />
                ) : (
                  <Copy className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                )}
              </Badge>
              
              {/* Owner Badge */}
              <Badge 
                variant="secondary" 
                className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  const ownerText = typeof shelf.owner === 'string' ? shelf.owner : shelf.owner?.toString();
                  if (ownerText) handleCopy(ownerText, setCopiedOwner);
                }}
              >
                <User className="h-2.5 w-2.5" />
                <span>{formatId(typeof shelf.owner === 'string' ? shelf.owner : shelf.owner?.toString() || '')}</span>
                {copiedOwner ? (
                  <Check className="h-2.5 w-2.5 text-green-500" />
                ) : (
                  <Copy className="h-2.5 w-2.5" />
                )}
              </Badge>
              
              {/* Created Date Badge */}
              <Badge 
                variant="outline" 
                className="text-[10px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-0.5 py-0.5 px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  if (shelf.created_at) handleCopy(createdAt, setCopiedCreated);
                }}
              >
                <Calendar className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{createdAt}</span>
                {copiedCreated ? (
                  <Check className="h-2.5 w-2.5 text-green-500" />
                ) : (
                  <Copy className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                )}
              </Badge>
              
              {/* Updated Date Badge */}
              <Badge 
                variant="outline" 
                className="text-[10px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-0.5 py-0.5 px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  if (shelf.updated_at) handleCopy(updatedAt, setCopiedUpdated);
                }}
              >
                <Clock className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{updatedAt}</span>
                {copiedUpdated ? (
                  <Check className="h-2.5 w-2.5 text-green-500" />
                ) : (
                  <Copy className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                )}
              </Badge>
              
              {/* Tags */}
              {shelf.tags && shelf.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  {shelf.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-[10px] px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Appears in */}
              {shelf.appears_in && shelf.appears_in.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] flex items-center py-0.5 px-1"
                  >
                    <Folder className="h-2.5 w-2.5 mr-0.5 text-gray-500 dark:text-gray-400" />
                    {shelf.appears_in.length}
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