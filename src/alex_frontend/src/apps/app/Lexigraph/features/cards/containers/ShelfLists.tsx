import React from 'react';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Plus } from "lucide-react";
import { ShelfCard, PublicShelfCard } from '../components/ShelfCard';
import { LibraryShelvesUIProps, ExploreShelvesUIProps, UserShelvesUIProps } from '../types/types';

// Library Shelves UI Component
export const LibraryShelvesUI: React.FC<LibraryShelvesUIProps> = ({
  shelves,
  loading,
  onNewShelf,
  onViewShelf
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Shelves</h2>
        <Button 
          variant="primary" 
          className="flex items-center gap-1"
          onClick={onNewShelf}
        >
          <Plus className="w-4 h-4" />
          New Shelf
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading shelves...</div>
      ) : shelves.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          You don't have any shelves yet.
          <div className="mt-2">
            <Button
              variant="outline"
              className="flex items-center gap-1 mx-auto"
              onClick={onNewShelf}
            >
              <Plus className="w-4 h-4" />
              Create First Shelf
            </Button>
          </div>
        </div>
      ) : (
        <ContentGrid>
          {shelves.map((shelf) => (
            <ShelfCard
              key={shelf.shelf_id}
              shelf={shelf}
              onViewShelf={onViewShelf}
            />
          ))}
        </ContentGrid>
      )}
    </div>
  );
};

// Explore Shelves UI Component
export const ExploreShelvesUI: React.FC<ExploreShelvesUIProps> = ({
  shelves,
  loading,
  onViewShelf,
  onLoadMore
}) => {
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Explore Public Shelves</h2>
      </div>
      
      {loading && shelves.length === 0 ? (
        <div className="text-center py-10">Loading shelves...</div>
      ) : shelves.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No public shelves found.
        </div>
      ) : (
        <>
          <ContentGrid>
            {shelves.map((shelf) => (
              <PublicShelfCard
                key={shelf.shelf_id}
                shelf={shelf}
                onViewShelf={onViewShelf}
              />
            ))}
          </ContentGrid>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={handleLoadMore} 
              disabled={isLoadingMore || loading}
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// User Shelves UI Component
export const UserShelvesUI: React.FC<UserShelvesUIProps> = ({
  shelves,
  loading,
  onBack,
  onViewShelf
}) => {
  let ownerName = "";
  if (shelves.length > 0) {
    ownerName = shelves[0].owner.toString();
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="self-start flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {ownerName ? `Shelves by ${ownerName.slice(0, 8)}...` : 'User Shelves'}
          </h2>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading shelves...</div>
      ) : shelves.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          This user has no public shelves.
        </div>
      ) : (
        <ContentGrid>
          {shelves.map((shelf) => (
            <PublicShelfCard
              key={shelf.shelf_id}
              shelf={shelf}
              onViewShelf={onViewShelf}
            />
          ))}
        </ContentGrid>
      )}
    </div>
  );
}; 