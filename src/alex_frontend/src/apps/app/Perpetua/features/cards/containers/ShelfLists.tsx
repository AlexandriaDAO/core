import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Plus, Edit, X, RotateCcw, Save, AlertCircle } from "lucide-react";
import { ShelfCard, PublicShelfCard } from '../components/ShelfCard';
import { LibraryShelvesUIProps, ExploreShelvesUIProps, UserShelvesUIProps } from '../types/types';
import { Shelf } from "../../../../../../../,,/../../declarations/perpetua/perpetua.did";
import { useShelfReordering } from '../../shelf-management/hooks/useShelfReordering';
import { useIdentity } from '@/hooks/useIdentity';
import { toast } from 'sonner';
import isEqual from 'lodash/isEqual';

// Custom props comparison for React.memo to prevent unnecessary renders
const areShelvesPropsEqual = (prevProps: UserShelvesUIProps, nextProps: UserShelvesUIProps): boolean => {
  // Basic props comparison
  if (prevProps.loading !== nextProps.loading || 
      prevProps.isCurrentUser !== nextProps.isCurrentUser) {
    return false;
  }
  
  // Function equality - consider them equal since we can't reliably compare functions
  // We assume parent components are memoizing their callbacks properly
  
  // Deep comparison of shelves - only care about IDs and basic metadata
  if (prevProps.shelves.length !== nextProps.shelves.length) {
    return false;
  }
  
  return isEqual(
    prevProps.shelves.map(s => ({ 
      id: s.shelf_id, 
      title: s.title,
      owner: s.owner.toString() 
    })),
    nextProps.shelves.map(s => ({ 
      id: s.shelf_id, 
      title: s.title,
      owner: s.owner.toString()
    }))
  );
};

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
export const UnifiedShelvesUI: React.FC<UnifiedShelvesUIProps> = React.memo(({
  allShelves,
  personalShelves,
  loading,
  onNewShelf,
  onViewShelf,
  onViewOwner,
  onLoadMore,
  checkEditAccess
}) => {
  // Memoize shelves rendering to prevent unnecessary work during re-renders
  const renderedShelves = useMemo(() => {
    return allShelves.map((shelf) => {
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
    });
  }, [allShelves, personalShelves, onViewShelf]);

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
            {renderedShelves}
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
});
UnifiedShelvesUI.displayName = 'UnifiedShelvesUI';

// Library Shelves UI Component
export const LibraryShelvesUI: React.FC<LibraryShelvesUIProps> = React.memo(({
  shelves,
  loading,
  onNewShelf,
  onViewShelf
}) => {
  // Memoize shelves rendering
  const renderedShelfCards = useMemo(() => {
    return shelves.map((shelf) => (
      <ShelfCard
        key={shelf.shelf_id}
        shelf={shelf}
        onViewShelf={onViewShelf}
      />
    ));
  }, [shelves, onViewShelf]);

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
          {renderedShelfCards}
        </ContentGrid>
      )}
    </div>
  );
});
LibraryShelvesUI.displayName = 'LibraryShelvesUI';

// Explore Shelves UI Component
export const ExploreShelvesUI: React.FC<ExploreShelvesUIProps> = React.memo(({
  shelves,
  loading,
  onViewShelf,
  onLoadMore
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  }, [onLoadMore]);
  
  // Memoize shelf cards
  const renderedShelfCards = useMemo(() => {
    return shelves.map((shelf) => (
      <PublicShelfCard
        key={shelf.shelf_id}
        shelf={shelf}
        onViewShelf={onViewShelf}
      />
    ));
  }, [shelves, onViewShelf]);
  
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
            {renderedShelfCards}
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
});
ExploreShelvesUI.displayName = 'ExploreShelvesUI';

// User Shelves UI Component with custom equality function
export const UserShelvesUI: React.FC<UserShelvesUIProps> = React.memo(({
  shelves,
  loading,
  onViewShelf,
  onViewOwner,
  onBack,
  isCurrentUser = false
}) => {
  const { identity } = useIdentity();
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Calculate owner information once and memoize it
  const { ownerName, ownerId, currentUserIsOwner } = useMemo(() => {
    let owner = "";
    let id = "";
    
    if (shelves.length > 0) {
      owner = shelves[0].owner.toString();
      id = owner;
    }

    // Check if the current user is the owner of this profile (ensure boolean result)
    const isOwner = Boolean(isCurrentUser || (identity && owner && identity.getPrincipal().toString() === owner));
    
    return { ownerName: owner, ownerId: id, currentUserIsOwner: isOwner };
  }, [shelves, identity, isCurrentUser]);

  // Initialize shelf reordering hook
  const reorderingProps = useShelfReordering({
    shelves: shelves,
    hasEditAccess: currentUserIsOwner
  });
  
  const { 
    isEditMode, 
    editedShelves, 
    enterEditMode, 
    cancelEditMode, 
    saveShelfOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    getDragItemStyle 
  } = reorderingProps;
  
  const handleSaveOrder = useCallback(async () => {
    setSaveInProgress(true);
    setSaveError(null);
    
    try {
      await saveShelfOrder();
      toast.success("Shelf order saved successfully");
    } catch (error) {
      console.error("[Shelf Reordering] Error saving order:", error);
      let errorMessage = "Failed to save shelf order";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaveInProgress(false);
    }
  }, [ownerName, saveShelfOrder]);

  // Helper function to get content to render
  const getShelves = useCallback(() => isEditMode ? editedShelves : shelves, [isEditMode, editedShelves, shelves]);
  
  // Helper function to create drag props with correct types - memoized
  const getDragProps = useCallback((index: number) => {
    if (isEditMode) {
      return {
        draggable: true,
        onDragStart: (e: React.DragEvent) => handleDragStart(e, index),
        onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
        onDragEnd: handleDragEnd,
        onDrop: (e: React.DragEvent) => handleDrop(e, index),
        style: getDragItemStyle(index),
        className: "cursor-move transition-all duration-200"
      };
    }
    return {
      draggable: false,
      className: ""
    };
  }, [isEditMode, handleDragStart, handleDragOver, handleDragEnd, handleDrop, getDragItemStyle]);

  const handleGoBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      // Fallback to browser history if no onBack provided
      window.history.back();
    }
  }, [onBack]);
  
  // Memoize the entire rendered shelf list to prevent re-renders
  const renderShelfCards = useMemo(() => {
    const currentShelves = getShelves();
    
    return currentShelves.map((shelf, index) => {
      const dragProps = getDragProps(index);
      
      return (
        <div 
          key={shelf.shelf_id}
          {...dragProps}
        >
          <PublicShelfCard
            shelf={shelf}
            onViewShelf={!isEditMode ? onViewShelf : undefined}
            isReordering={Boolean(isEditMode)}
          />
        </div>
      );
    });
  }, [getShelves, getDragProps, isEditMode, onViewShelf]);
  
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
          
          {currentUserIsOwner && (
            <div className="flex items-center gap-2">
              {!isEditMode ? (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={enterEditMode}
                  disabled={loading || shelves.length <= 1}
                >
                  <Edit className="w-4 h-4" />
                  Edit Order
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1"
                    onClick={cancelEditMode}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex items-center gap-1"
                    onClick={handleSaveOrder}
                    disabled={saveInProgress}
                  >
                    <Save className="w-4 h-4" />
                    {saveInProgress ? 'Saving...' : 'Save Order'}
                  </Button>
                </>
              )}
            </div>
          )}
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
          {renderShelfCards}
        </ContentGrid>
      )}
    </div>
  );
}, areShelvesPropsEqual);  // Apply custom equality function to prevent unnecessary re-renders

UserShelvesUI.displayName = 'UserShelvesUI'; 