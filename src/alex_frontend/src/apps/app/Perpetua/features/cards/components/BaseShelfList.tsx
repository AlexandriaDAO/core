import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Plus, Edit, X, RotateCcw, Save, AlertCircle, UserPlus, RotateCw } from "lucide-react";
import { ShelfCard } from './ShelfCard';
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { toast } from 'sonner';
import { useDragAndDrop } from '../../shared/reordering/hooks/useDragAndDrop';
import { ReorderableGrid } from '../../shared/reordering/components/ReorderableGrid';
import { ReorderableItem } from '../../../types/reordering.types';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import {
  selectIsShelfPublic,
  selectIsOwner,
  selectUserShelves
} from '@/apps/app/Perpetua/state/perpetuaSlice';
import { followUser } from '@/apps/app/Perpetua/state/services/followService';
import { NormalizedShelf } from '@/apps/app/Perpetua/state/perpetuaSlice';

// Types for the component
export interface BaseShelfListProps {
  shelves: ShelfPublic[];
  title: string;
  emptyStateMessage: string;
  showBackButton?: boolean;
  backLabel?: string;
  loading?: boolean;
  isCurrentUserProfile?: boolean;
  profileOwnerPrincipal?: string;
  allowReordering?: boolean;
  onViewShelf?: (shelfId: string) => void;
  onViewOwner?: (ownerId: string) => void;
  onBack?: () => void;
  onNewShelf?: () => void;
  onLoadMore?: () => Promise<void>;
  onSaveOrder?: (shelfIds: string[]) => Promise<void>;
  checkEditAccess?: (shelfId: string) => boolean;
  isCreatingShelf?: boolean;
}

// Helper function to extract essential properties for comparison
const getShelfEssentials = (shelf: ShelfPublic) => ({
  id: shelf.shelf_id,
  title: shelf.title,
  owner: typeof shelf.owner === 'string' ? shelf.owner : shelf.owner.toString(),
});

// Type for ListHeader props
interface ListHeaderProps {
  title: string;
  showBackButton: boolean;
  backLabel: string;
  profileOwnerPrincipal?: string;
  isCurrentUserProfile: boolean;
  allowReordering: boolean;
  canCreateNewShelf: boolean;
  canEditOrder: boolean;
  isEditMode: boolean;
  enterEditMode: () => void;
  cancelEditMode: () => void;
  saveShelfOrder: () => Promise<void>;
  saveInProgress: boolean;
  saveError: string | null;
  handleGoBack: () => void;
  onNewShelf?: () => void;
  isCreatingShelf: boolean;
}

// Interface for reorderable shelf items
interface ReorderableShelfItem extends ReorderableItem {
  shelf: ShelfPublic;
}

/**
 * BaseShelfList - A reusable component for displaying different shelf views
 */
export const BaseShelfList: React.FC<BaseShelfListProps> = ({
  shelves,
  title,
  emptyStateMessage,
  showBackButton = false,
  backLabel = "All Shelves",
  loading = false,
  isCurrentUserProfile = false,
  profileOwnerPrincipal,
  allowReordering = false,
  onViewShelf,
  onViewOwner,
  onBack,
  onNewShelf,
  onLoadMore,
  onSaveOrder,
  checkEditAccess,
  isCreatingShelf = false
}) => {
  // Simple UI state - no complex state management
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [followInProgress, setFollowInProgress] = useState(false);
  
  // Convert shelves to reorderable format for drag-and-drop UI
  const reorderableShelves = useMemo(() => {
    return shelves.map((shelf: ShelfPublic) => ({ id: shelf.shelf_id, shelf }));
  }, [shelves]);
  
  // Local state just for visual drag-and-drop
  const [draggedShelves, setDraggedShelves] = useState<ReorderableShelfItem[]>([]);
  
  // Update dragged shelves when original shelves change or entering edit mode
  React.useEffect(() => {
    if (!isEditMode || draggedShelves.length === 0) {
      setDraggedShelves(reorderableShelves);
    }
  }, [isEditMode, reorderableShelves, draggedShelves.length]);
  
  // Hook for drag and drop UI functionality
  const {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    getDragItemStyle
  } = useDragAndDrop(draggedShelves, (newItems) => {
    setDraggedShelves(newItems);
    console.log("Items reordered in UI:", newItems.map(item => item.id));
  });
  
  const handleGoBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  }, [onBack]);
  
  // Simple edit mode handlers
  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
    setSaveError(null);
    setDraggedShelves(reorderableShelves); // Start with current order
  }, [reorderableShelves]);
  
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false);
    setSaveError(null);
  }, []);
  
  // Save order through parent callback
  const handleSaveOrder = useCallback(async () => {
    if (!onSaveOrder) return;
    
    setSaveInProgress(true);
    setSaveError(null);
    
    try {
      // Get the current visual order of shelves
      const shelfIds = draggedShelves.map(item => item.shelf.shelf_id);
      console.log("Saving new shelf order:", shelfIds);
      
      // Let parent handle the actual saving
      await onSaveOrder(shelfIds);
      
      toast.success("Shelf order saved");
      setIsEditMode(false);
      
      // Don't reset draggedShelves here - let Redux update the shelves prop
      // which will trigger our useEffect to update draggedShelves
    } catch (error) {
      console.error("[Shelf Reordering] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save order";
      
      setSaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaveInProgress(false);
    }
  }, [draggedShelves, onSaveOrder]);
  
  // --- Follow User Handler ---
  const handleFollowUser = useCallback(async () => {
    if (!profileOwnerPrincipal) return;
    setFollowInProgress(true);
    try {
      const result = await followUser(profileOwnerPrincipal);
      if ('Ok' in result) {
        toast.success(`Followed user ${profileOwnerPrincipal.substring(0, 5)}...`);
        // TODO: Update local/global state to reflect follow status later
      } else {
        toast.error(`Failed to follow user: ${result.Err}`);
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("An unexpected error occurred while trying to follow the user.");
    } finally {
      setFollowInProgress(false);
    }
  }, [profileOwnerPrincipal]);

  // Sub-component for rendering the header
  const ListHeader = ({ 
    title, showBackButton, backLabel, handleGoBack, profileOwnerPrincipal, isCurrentUserProfile,
    allowReordering, canCreateNewShelf, canEditOrder, isEditMode, enterEditMode, 
    cancelEditMode, saveShelfOrder, saveInProgress, saveError, onNewShelf,
    isCreatingShelf
  }: ListHeaderProps) => {
      
      // Determine if the follow button should be shown
      const showFollowButton = 
        profileOwnerPrincipal &&       // Owner principal is known
        !isCurrentUserProfile;       // Not viewing own profile
  
      return (
        <div className="flex flex-col gap-4 mb-6 font-serif">
          {showBackButton && (
            <div className="flex items-center">
              <div className="flex items-center h-8 rounded-md border border-input bg-background overflow-hidden">
                <Button 
                  variant="ghost" 
                  onClick={handleGoBack}
                  className="flex items-center gap-1 h-8 rounded-r-none border-r px-3 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{backLabel}</span>
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-serif">{title}</h2>
            
            <div className="flex items-center gap-2">
              {showFollowButton && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 px-3 h-9"
                    onClick={handleFollowUser}
                    disabled={followInProgress}
                  >
                    <UserPlus className="w-4 h-4" />
                    {followInProgress ? 'Following...' : 'Follow'}
                  </Button>
              )}
              
              {canCreateNewShelf && !isEditMode && (
                <Button 
                  variant="primary" 
                  className="flex items-center gap-1 px-3 h-9"
                  onClick={onNewShelf}
                  disabled={loading || saveInProgress || followInProgress || isCreatingShelf}
                >
                  {isCreatingShelf ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin mr-1" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      New Shelf
                    </>
                  )}
                </Button>
              )}
              
              {canEditOrder && (
                !isEditMode ? (
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1 px-3 h-9"
                    onClick={enterEditMode}
                    disabled={loading || saveInProgress || followInProgress}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Order
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1 px-3 h-9"
                      onClick={cancelEditMode}
                      disabled={saveInProgress}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex items-center gap-1 px-3 h-9"
                      onClick={saveShelfOrder}
                      disabled={saveInProgress}
                    >
                      <Save className="w-4 h-4" />
                      {saveInProgress ? 'Saving...' : 'Save Order'}
                    </Button>
                  </>
                )
              )}
            </div>
          </div>
          
          {saveError && (
            <div className="flex items-center gap-2 text-destructive text-sm mt-2 font-serif">
              <AlertCircle className="w-4 h-4" />
              {saveError}
            </div>
          )}
        </div>
      );
  };

  // Sub-component for rendering empty state
  const EmptyState = () => (
    <div className="text-center py-10 text-muted-foreground font-serif">
      {emptyStateMessage}
      {onNewShelf && isCurrentUserProfile && (
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
      )}
    </div>
  );

  // Wrapper component defined directly inside BaseShelfList
  const ShelfCardWrapper: React.FC<{ shelf: ShelfPublic; isEditMode: boolean; isDragging: boolean; }> = ({ shelf, isEditMode, isDragging }) => {
    // Memoize selector instances to prevent re-creation on every render
    const selectIsPublicMemo = useMemo(() => selectIsShelfPublic(shelf.shelf_id), [shelf.shelf_id]);
    const selectIsOwnerMemo = useMemo(() => selectIsOwner(shelf.shelf_id), [shelf.shelf_id]);

    // Use memoized selectors with useAppSelector
    const isPublic = Boolean(useAppSelector(selectIsPublicMemo));
    const isOwner = Boolean(useAppSelector(selectIsOwnerMemo));

    // Updated collaboration data - only based on ownership now
    const collaborationData = {
      isOwner,
      isCollaborator: false, // No editors means no collaborators other than owner
      editorsCount: 0 // No editors
    };

    return (
      <div className={`transition-all duration-200 font-serif ${isDragging ? 'opacity-75 scale-[0.98] shadow-md' : ''}`}>
        <ShelfCard
          key={shelf.shelf_id}
          shelf={shelf}
          onViewShelf={!isEditMode && onViewShelf ? () => onViewShelf(shelf.shelf_id) : undefined}
          isReordering={isEditMode}
          parentShelfId={undefined}
          itemId={undefined}
          isPublic={isPublic}
          showCollaborationInfo={isOwner}
          collaborationData={collaborationData}
        />
      </div>
    );
  };

  // Main render
  return (
    <div className="h-full flex flex-col">
      <ListHeader 
        title={title}
        showBackButton={showBackButton}
        backLabel={backLabel}
        handleGoBack={handleGoBack}
        profileOwnerPrincipal={profileOwnerPrincipal}
        isCurrentUserProfile={isCurrentUserProfile}
        allowReordering={allowReordering}
        canCreateNewShelf={!!onNewShelf}
        canEditOrder={allowReordering && shelves.length > 1}
        isEditMode={isEditMode}
        enterEditMode={enterEditMode}
        cancelEditMode={cancelEditMode}
        saveShelfOrder={handleSaveOrder}
        saveInProgress={saveInProgress}
        saveError={saveError}
        onNewShelf={onNewShelf}
        isCreatingShelf={isCreatingShelf}
      />
      
      {shelves.length === 0 && loading ? (
        <div className="text-center py-10 font-serif">Loading shelves...</div>
      ) : shelves.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {isEditMode ? (
            <ReorderableGrid
              items={draggedShelves}
              isEditMode={true}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDragEnd={handleDragEnd}
              handleDrop={handleDrop}
              getDragItemStyle={getDragItemStyle}
              renderItem={(item, index, isDragging) => 
                <ShelfCardWrapper 
                  shelf={item.shelf} 
                  isEditMode={isEditMode} 
                  isDragging={isDragging} 
                />
              } 
              columns={3}
              gap={4}
            />
          ) : (
            <ContentGrid>
              {shelves.map((shelf: ShelfPublic) => (
                <ShelfCardWrapper 
                  key={shelf.shelf_id} 
                  shelf={shelf} 
                  isEditMode={false} 
                  isDragging={false} 
                />
              ))}
            </ContentGrid>
          )}
          
          {onLoadMore && !isEditMode && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={onLoadMore} 
                disabled={loading || saveInProgress || followInProgress}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ADD: Re-apply React.memo with the correct comparison function signature
export const MemoizedBaseShelfList = React.memo(BaseShelfList, (prevProps: Readonly<BaseShelfListProps>, nextProps: Readonly<BaseShelfListProps>) => {
  // Simple prop equality checks
  if (
    prevProps.title !== nextProps.title ||
    prevProps.emptyStateMessage !== nextProps.emptyStateMessage ||
    prevProps.showBackButton !== nextProps.showBackButton ||
    prevProps.backLabel !== nextProps.backLabel ||
    prevProps.loading !== nextProps.loading ||
    prevProps.isCurrentUserProfile !== nextProps.isCurrentUserProfile ||
    prevProps.allowReordering !== nextProps.allowReordering ||
    prevProps.profileOwnerPrincipal !== nextProps.profileOwnerPrincipal ||
    prevProps.isCreatingShelf !== nextProps.isCreatingShelf
  ) {
    return false; // Re-render
  }
  
  // Check if the shelves have changed in meaningful ways
  if (prevProps.shelves.length !== nextProps.shelves.length) {
    return false; // Re-render
  }
  
  // Compare shelf essential properties (IDs, titles, owners)
  for (let i = 0; i < prevProps.shelves.length; i++) {
    const prevShelf = getShelfEssentials(prevProps.shelves[i]);
    const nextShelf = getShelfEssentials(nextProps.shelves[i]);
    
    if (
      prevShelf.id !== nextShelf.id ||
      prevShelf.title !== nextShelf.title ||
      prevShelf.owner !== nextShelf.owner
    ) {
      return false; // Re-render
    }
  }
  
  // We assume callbacks don't change identity between renders (parent should memoize them)
  return true; // Don't re-render
}); 