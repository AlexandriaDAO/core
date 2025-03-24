import React from 'react';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Plus } from "lucide-react";
import { ShelfCard, PublicShelfCard } from '../components/ShelfCard';
import { LibraryShelvesUIProps, ExploreShelvesUIProps, UserShelvesUIProps } from '../types/types';

// Unified shelves view - simple version without search/filtering
interface UnifiedShelvesUIProps {
  allShelves: any[]; // Combined shelves
  personalShelves: any[]; // Personal shelves for determining ownership
  loading: boolean;
  onNewShelf: () => void;
  onViewShelf: (shelfId: string) => void;
  onViewOwner: (ownerId: string) => void;
  onLoadMore: () => Promise<void>;
  checkEditAccess: (shelfId: string) => boolean;
}

// Unified Shelves UI Component that shows all shelves
export const UnifiedShelvesUI: React.FC<UnifiedShelvesUIProps> = ({
  allShelves,
  personalShelves,
  loading,
  onNewShelf,
  onViewShelf,
  onViewOwner,
  onLoadMore,
  checkEditAccess
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Shelves</h2>
        <Button 
          variant="primary" 
          className="flex items-center gap-1"
          onClick={onNewShelf}
        >
          <Plus className="w-4 h-4" />
          New Shelf
        </Button>
      </div>
      
      {loading && allShelves.length === 0 ? (
        <div className="text-center py-10">Loading shelves...</div>
      ) : allShelves.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No shelves found.
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
        <>
          <ContentGrid>
            {allShelves.map((shelf) => {
              // Determine if this is a shelf owned by the current user
              const isPersonal = personalShelves.some(ps => ps.shelf_id === shelf.shelf_id);
              
              return isPersonal ? (
                <ShelfCard
                  key={shelf.shelf_id}
                  shelf={shelf}
                  onViewShelf={onViewShelf}
                />
              ) : (
                <PublicShelfCard
                  key={shelf.shelf_id}
                  shelf={shelf}
                  onViewShelf={onViewShelf}
                />
              );
            })}
          </ContentGrid>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={onLoadMore} 
              disabled={loading}
            >
              Load More
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

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
  onViewShelf,
  onViewOwner,
  onBack
}) => {
  let ownerName = "";
  let ownerId = "";
  if (shelves.length > 0) {
    ownerName = shelves[0].owner.toString();
    ownerId = ownerName;
  }
  
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback to browser history if no onBack provided
      window.history.back();
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center">
          <div className="flex items-center h-8 rounded-md border border-input bg-background overflow-hidden">
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              className="flex items-center gap-1 h-8 rounded-r-none border-r px-3 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Shelves</span>
            </Button>
            <div className="flex items-center px-3 text-sm">
              <span className="font-medium">
                User {ownerName ? ownerName.slice(0, 8) + "..." : ""}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {ownerName ? (
              <span>
                Shelves by{" "}
                <span className="text-primary">
                  {ownerName.slice(0, 8)}...
                </span>
              </span>
            ) : 'User Shelves'}
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