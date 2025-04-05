import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Plus, Edit, X, RotateCcw, Save, AlertCircle } from "lucide-react";
import { ShelfCard, PublicShelfCard } from './ShelfCard';
import { Shelf } from "@/../../declarations/perpetua/perpetua.did";
import { toast } from 'sonner';

// Types for the component
export interface BaseShelfListProps {
  shelves: Shelf[];
  title: string;
  emptyStateMessage: string;
  showBackButton?: boolean;
  backLabel?: string;
  loading?: boolean;
  isCurrentUserProfile?: boolean;
  allowReordering?: boolean;
  onViewShelf?: (shelfId: string) => void;
  onViewOwner?: (ownerId: string) => void;
  onBack?: () => void;
  onNewShelf?: () => void;
  onLoadMore?: () => Promise<void>;
  onSaveOrder?: (shelfIds: string[]) => Promise<void>;
  checkEditAccess?: (shelfId: string) => boolean;
}

// Helper function to extract essential properties for comparison
const getShelfEssentials = (shelf: Shelf) => ({
  id: shelf.shelf_id,
  title: shelf.title,
  owner: typeof shelf.owner === 'string' ? shelf.owner : shelf.owner.toString(),
});

// Drag and drop types
interface DragState {
  isDragging: boolean;
  dragIndex: number;
  shelfIds: string[];
}

/**
 * BaseShelfList - A reusable component for displaying different shelf views
 */
export const BaseShelfList: React.FC<BaseShelfListProps> = React.memo(({
  shelves,
  title,
  emptyStateMessage,
  showBackButton = false,
  backLabel = "All Shelves",
  loading = false,
  isCurrentUserProfile = false,
  allowReordering = false,
  onViewShelf,
  onViewOwner,
  onBack,
  onNewShelf,
  onLoadMore,
  onSaveOrder,
  checkEditAccess
}) => {
  // State management
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Memoize shelf data to minimize re-renders
  const shelfEssentials = useMemo(() => 
    shelves.map(getShelfEssentials), 
    [shelves]
  );
  
  const memoizedShelves = useMemo(() => shelves, [shelfEssentials]);
  
  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragIndex: -1,
    shelfIds: shelves.map(shelf => shelf.shelf_id)
  });
  
  // Update shelf order when shelves prop changes
  React.useEffect(() => {
    if (!isEditMode) {
      setDragState(prev => ({
        ...prev,
        shelfIds: memoizedShelves.map(shelf => shelf.shelf_id)
      }));
    }
  }, [memoizedShelves, isEditMode]);
  
  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      dragIndex: index
    }));
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragState.dragIndex === index) return;
    
    setDragState(prev => {
      if (prev.dragIndex === index) return prev;
      
      const newShelfIds = [...prev.shelfIds];
      const draggedId = newShelfIds[prev.dragIndex];
      
      newShelfIds.splice(prev.dragIndex, 1);
      newShelfIds.splice(index, 0, draggedId);
      
      return {
        ...prev,
        dragIndex: index,
        shelfIds: newShelfIds
      };
    });
  }, [dragState.dragIndex]);
  
  const handleDragEnd = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false
    }));
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragState(prev => ({
      ...prev,
      isDragging: false
    }));
  }, []);
  
  // Edit mode handlers
  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
    setSaveError(null);
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      dragIndex: -1,
      shelfIds: shelves.map(shelf => shelf.shelf_id)
    }));
  }, [shelves]);
  
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false);
    setSaveError(null);
    setDragState({
      isDragging: false,
      dragIndex: -1,
      shelfIds: shelves.map(shelf => shelf.shelf_id)
    });
  }, [shelves]);
  
  const handleSaveOrder = useCallback(async () => {
    if (!onSaveOrder) return;
    
    setSaveInProgress(true);
    setSaveError(null);
    
    try {
      await onSaveOrder(dragState.shelfIds);
      toast.success("Shelf order saved successfully");
      setIsEditMode(false);
    } catch (error) {
      console.error("[Shelf Reordering] Error saving order:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save shelf order";
      
      setSaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaveInProgress(false);
    }
  }, [dragState.shelfIds, onSaveOrder]);
  
  // Get shelves in current order
  const orderedShelves = useMemo(() => {
    if (!isEditMode) return shelves;
    
    return dragState.shelfIds
      .map(id => shelves.find(shelf => shelf.shelf_id === id))
      .filter(Boolean) as Shelf[];
  }, [shelves, isEditMode, dragState.shelfIds]);
  
  // Helper for getting drag props
  const getDragProps = useCallback((index: number) => {
    if (!isEditMode) return { draggable: false, className: "" };
    
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, index),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
      onDragEnd: handleDragEnd,
      onDrop: (e: React.DragEvent) => handleDrop(e, index),
      style: dragState.isDragging && index === dragState.dragIndex 
        ? { opacity: 0.5, border: '2px dashed var(--border)' } 
        : {},
      className: "cursor-move transition-all duration-200"
    };
  }, [isEditMode, handleDragStart, handleDragOver, handleDragEnd, handleDrop, dragState]);
  
  const handleGoBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  }, [onBack]);
  
  // Shelf view handler
  const getShelfViewHandler = useCallback((shelfId: string) => {
    if (!isEditMode && onViewShelf) {
      return (id: string) => onViewShelf(id);
    }
    return undefined;
  }, [onViewShelf, isEditMode]);
  
  // Sub-component for rendering the header
  const ListHeader = () => (
    <div className="flex flex-col gap-4 mb-6">
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
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="flex items-center gap-2">
          {onNewShelf && !isEditMode && (
            <Button 
              variant="primary" 
              className="flex items-center gap-1"
              onClick={onNewShelf}
            >
              <Plus className="w-4 h-4" />
              New Shelf
            </Button>
          )}
          
          {allowReordering && shelves.length > 1 && (
            !isEditMode ? (
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={enterEditMode}
                disabled={loading || saveInProgress}
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
            )
          )}
        </div>
      </div>
      
      {saveError && (
        <div className="flex items-center gap-2 text-destructive text-sm mt-2">
          <AlertCircle className="w-4 h-4" />
          {saveError}
        </div>
      )}
    </div>
  );

  // Sub-component for rendering empty state
  const EmptyState = () => (
    <div className="text-center py-10 text-muted-foreground">
      {emptyStateMessage}
      {onNewShelf && (
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

  // Sub-component for rendering shelf cards
  const ShelfCardList = () => (
    <>
      <ContentGrid>
        {orderedShelves.map((shelf, index) => {
          const dragProps = getDragProps(index);
          const isCurrentUserShelf = isCurrentUserProfile || 
            (checkEditAccess && checkEditAccess(shelf.shelf_id));
          
          return (
            <div 
              key={shelf.shelf_id}
              {...dragProps}
            >
              {isCurrentUserShelf ? (
                <ShelfCard
                  shelf={shelf}
                  onViewShelf={getShelfViewHandler(shelf.shelf_id)}
                  isReordering={isEditMode}
                />
              ) : (
                <PublicShelfCard
                  shelf={shelf}
                  onViewShelf={getShelfViewHandler(shelf.shelf_id)}
                  isReordering={isEditMode}
                />
              )}
            </div>
          );
        })}
      </ContentGrid>
      
      {onLoadMore && (
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={onLoadMore} 
            disabled={loading || saveInProgress}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  );
  
  // Main render
  return (
    <div className="h-full flex flex-col">
      <ListHeader />
      
      {loading && shelves.length === 0 ? (
        <div className="text-center py-10">Loading shelves...</div>
      ) : shelves.length === 0 ? (
        <EmptyState />
      ) : (
        <ShelfCardList />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Simple prop equality checks
  if (
    prevProps.title !== nextProps.title ||
    prevProps.emptyStateMessage !== nextProps.emptyStateMessage ||
    prevProps.showBackButton !== nextProps.showBackButton ||
    prevProps.backLabel !== nextProps.backLabel ||
    prevProps.loading !== nextProps.loading ||
    prevProps.isCurrentUserProfile !== nextProps.isCurrentUserProfile ||
    prevProps.allowReordering !== nextProps.allowReordering
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