import React from 'react';
import { Card, CardContent, CardFooter } from "@/lib/components/card";
import { Badge } from "@/lib/components/badge";
import { Folder, Users } from "lucide-react";
import { ShelfCardProps, PublicShelfCardProps } from '../../../types/shelf.types';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { 
  selectIsOwner, 
  selectHasEditAccess, 
  selectShelfEditors 
} from '@/apps/app/Perpetua/state/perpetuaSlice';
import { ShelfCardActionMenu } from './ShelfCardActionMenu';

interface ShelfCardBaseProps {
  shelf: ShelfCardProps['shelf'];
  onViewShelf?: (shelfId: string) => void;
  parentShelfId?: string;
  itemId?: number;
  isReordering?: boolean;
}

/**
 * Card content component to avoid duplication between ShelfCard and PublicShelfCard
 */
const ShelfCardContent: React.FC<ShelfCardBaseProps> = ({
  shelf,
  parentShelfId,
  itemId
}) => (
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
);

/**
 * Main ShelfCard component for library view with collaboration info
 */
export const ShelfCard: React.FC<ShelfCardProps> = ({ 
  shelf, 
  onViewShelf,
  showOwner = false,
  parentShelfId,
  itemId
}) => {
  const itemCount = Object.keys(shelf.items).length;
  
  // Use selector factories from Redux with memoization
  const isOwner = useAppSelector(state => selectIsOwner(shelf.shelf_id)(state));
  const hasEditAccess = useAppSelector(state => selectHasEditAccess(shelf.shelf_id)(state));
  const editors = useAppSelector(state => selectShelfEditors(shelf.shelf_id)(state));
  
  // Derived state
  const isCollaborator = hasEditAccess && !isOwner;
  const hasCollaborators = editors.length > 0;

  return (
    <Card 
      className="h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 overflow-hidden"
      onClick={onViewShelf ? () => onViewShelf(shelf.shelf_id) : undefined}
    >
      <CardContent className="p-0">
        <ShelfCardContent 
          shelf={shelf} 
          parentShelfId={parentShelfId} 
          itemId={itemId}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-3 pt-0">
        <Badge variant="secondary" className="text-xs">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Badge>
        
        <div className="flex items-center gap-2">
          {isCollaborator && (
            <Badge variant="info" className="text-xs flex items-center">
              <Users className="h-3 w-3 mr-1" />
              Collaborator
            </Badge>
          )}
          {isOwner && hasCollaborators && (
            <Badge variant="secondary" className="text-xs flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {editors.length} {editors.length === 1 ? 'editor' : 'editors'}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

/**
 * PublicShelfCard component for displaying shelves in public lists
 */
export const PublicShelfCard: React.FC<PublicShelfCardProps> = ({ 
  shelf, 
  onViewShelf,
  parentShelfId,
  itemId,
  isReordering
}) => {
  const itemCount = Object.keys(shelf.items).length;
  
  return (
    <Card 
      className="h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 overflow-hidden"
      onClick={onViewShelf ? () => onViewShelf(shelf.shelf_id) : undefined}
    >
      <CardContent className="p-0">
        <ShelfCardContent 
          shelf={shelf} 
          parentShelfId={parentShelfId} 
          itemId={itemId}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-3 pt-0">
        <Badge variant="secondary" className="text-xs">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Badge>
        
        {isReordering && (
          <Badge variant="info" className="text-xs">
            Drag to reorder
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}; 