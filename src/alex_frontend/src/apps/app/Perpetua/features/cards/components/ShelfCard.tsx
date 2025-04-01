import React from 'react';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { convertTimestamp } from "@/utils/general";
import { ShelfCardProps, PublicShelfCardProps } from '../types/types';
import { buildRoutes } from '../../../routes';
import { Users } from "lucide-react";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { 
  selectIsOwner, 
  selectHasEditAccess, 
  selectShelfEditors 
} from '@/apps/app/Perpetua/state/perpetuaSlice';
import { ShelfCardActionMenu } from './ShelfCardActionMenu';

// Extending the props interfaces to include parentShelfId and itemId
interface ExtendedShelfCardProps extends ShelfCardProps {
  parentShelfId?: string;
  itemId?: number;
}

interface ExtendedPublicShelfCardProps extends PublicShelfCardProps {
  parentShelfId?: string;
  itemId?: number;
  isReordering?: boolean;
}

// Shelf Card Component for the library view
export const ShelfCard: React.FC<ExtendedShelfCardProps> = ({ 
  shelf, 
  onViewShelf,
  showOwner = false,
  parentShelfId,
  itemId
}) => {
  const createdAt = convertTimestamp(shelf.created_at, 'combined');
  const updatedAt = convertTimestamp(shelf.updated_at, 'combined');
  const itemCount = Object.keys(shelf.items).length;
  
  // Use selector factories from Redux directly - Redux will internally cache these
  const isOwner = useAppSelector(state => selectIsOwner(shelf.shelf_id)(state));
  const hasEditAccess = useAppSelector(state => selectHasEditAccess(shelf.shelf_id)(state));
  const editors = useAppSelector(state => selectShelfEditors(shelf.shelf_id)(state));
  
  // Derived state
  const isCollaborator = hasEditAccess && !isOwner;
  const hasCollaborators = editors.length > 0;
  
  // Check if the updated_at is different from created_at (allowing a small buffer for processing time)
  const wasEdited = Number(shelf.updated_at) - Number(shelf.created_at) > 1000000; // 1 second buffer
  
  const handleViewUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to user's shelves using the route builder
    window.location.href = buildRoutes.user(shelf.owner.toString());
  };
  
  return (
    <ContentCard
      onClick={onViewShelf ? () => onViewShelf(shelf.shelf_id) : undefined}
      id={shelf.shelf_id}
      owner={showOwner ? shelf.owner.toString() : undefined}
      component="Perpetua"
      footer={
        <div className="flex justify-between items-center w-full mt-2">
          <div className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
          {/* Show collaboration indicators */}
          <div className="flex items-center gap-2">
            {isCollaborator && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Collaborator
              </span>
            )}
            {isOwner && hasCollaborators && (
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {editors.length} {editors.length === 1 ? 'editor' : 'editors'}
              </span>
            )}
          </div>
        </div>
      }
    >
      <div className="relative w-full h-full">
        {/* Replace the two buttons with a single action menu */}
        <ShelfCardActionMenu
          contentId={shelf.shelf_id}
          contentType="Shelf"
          currentShelfId={shelf.shelf_id}
          parentShelfId={parentShelfId}
          itemId={itemId}
        />
        
        <div className="text-center p-4 h-full flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-lg font-semibold">{shelf.title}</div>
          <div className="text-sm text-muted-foreground mt-1">{shelf.description?.[0]}</div>
        </div>
      </div>
    </ContentCard>
  );
};

// Public variant of the shelf card used for displaying shelves in lists
export const PublicShelfCard: React.FC<ExtendedPublicShelfCardProps> = ({ 
  shelf, 
  onViewShelf,
  parentShelfId,
  itemId,
  isReordering
}) => {
  // Skip null safety checks as they should be handled by the parent component
  const itemCount = Object.keys(shelf.items).length;
  
  // Use selector factory from Redux directly - Redux will internally cache this
  const hasEditAccess = useAppSelector(state => selectHasEditAccess(shelf.shelf_id)(state));
  
  return (
    <ContentCard
      onClick={onViewShelf ? () => onViewShelf(shelf.shelf_id) : undefined}
      id={shelf.shelf_id}
      owner={shelf.owner.toString()}
      component="Perpetua"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
          {isReordering && (
            <div className="text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Drag to reorder
              </span>
            </div>
          )}
        </div>
      }
    >
      {/* Replace the two buttons with a single action menu */}
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
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-lg font-semibold">{shelf.title}</div>
          <div className="text-sm text-muted-foreground mt-1">{shelf.description?.[0]}</div>
        </div>
      </div>
    </ContentCard>
  );
}; 