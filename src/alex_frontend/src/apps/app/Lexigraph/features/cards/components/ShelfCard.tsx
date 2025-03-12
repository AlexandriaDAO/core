import React from 'react';
import { Button } from "@/lib/components/button";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { convertTimestamp } from "@/utils/general";
import { ShelfCardProps, PublicShelfCardProps } from '../types/types';

// Shelf Card Component for the library view
export const ShelfCard: React.FC<ShelfCardProps> = ({ 
  shelf, 
  onViewShelf,
  showOwner = false 
}) => {
  const createdAt = convertTimestamp(shelf.created_at, 'combined');
  const updatedAt = convertTimestamp(shelf.updated_at, 'combined');
  const slotCount = Object.keys(shelf.slots).length;
  
  // Check if the updated_at is different from created_at (allowing a small buffer for processing time)
  const wasEdited = Number(shelf.updated_at) - Number(shelf.created_at) > 1000000; // 1 second buffer
  
  const handleViewUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to user's shelves
    window.location.href = `/lexigraph/user/${shelf.owner}`;
  };
  
  return (
    <ContentCard
      onClick={() => onViewShelf(shelf.shelf_id)}
      id={shelf.shelf_id}
      owner={showOwner ? shelf.owner.toString() : undefined}
      component="Lexigraph"
      footer={
        <div className="flex justify-between items-center w-full mt-2">
          <div className="text-xs text-muted-foreground">
            {slotCount} {slotCount === 1 ? 'item' : 'items'}
          </div>
        </div>
      }
    >
      <div className="p-4 w-full h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-2">{shelf.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{shelf.description}</p>
        <div className="text-xs text-muted-foreground mt-2">
          <div className="flex flex-col space-y-1">
            <span>Created {createdAt}</span>
            {wasEdited && <span>Updated {updatedAt}</span>}
            {showOwner && (
              <div>
                <span>By: </span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs text-blue-500 hover:text-blue-700"
                  onClick={handleViewUser}
                >
                  {shelf.owner.toString().slice(0, 8)}...
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

// Public Shelf Card Component for the explore view
export const PublicShelfCard: React.FC<PublicShelfCardProps> = ({ 
  shelf, 
  onViewShelf 
}) => {
  return (
    <ShelfCard
      shelf={shelf}
      onViewShelf={onViewShelf}
      showOwner={true}
    />
  );
}; 