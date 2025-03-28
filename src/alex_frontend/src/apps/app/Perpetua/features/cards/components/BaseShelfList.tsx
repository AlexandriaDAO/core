import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Plus, Edit, X, RotateCcw, Save, AlertCircle } from "lucide-react";
import { ShelfCard, PublicShelfCard } from './ShelfCard';
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { toast } from 'sonner';

// Types for the component
export interface BaseShelfListProps {
  // Shelf data
  shelves: Shelf[];
  // Display options
  title: string;
  emptyStateMessage: string;
  showBackButton?: boolean;
  backLabel?: string;
  // Control flags
  loading?: boolean;
  isCurrentUserProfile?: boolean;
  allowReordering?: boolean;
  // Event handlers
  onViewShelf?: (shelfId: string) => void;
  onViewOwner?: (ownerId: string) => void;
  onBack?: () => void;
  onNewShelf?: () => void;
  onLoadMore?: () => Promise<void>;
  // Reordering callbacks
  onSaveOrder?: (shelfIds: string[]) => Promise<void>;
  // Permissions
  checkEditAccess?: (shelfId: string) => boolean;
}

// Drag and Drop types
interface DragState {
  isDragging: boolean;
  dragIndex: number;
  shelfIds: string[];  // Array of shelf IDs for tracking order
}

/**
 * BaseShelfList - A reusable component for displaying different shelf views
 * This handles the common UI patterns across different shelf views
 */
export const BaseShelfList: React.FC<BaseShelfListProps> = ({
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
  // State for edit mode and order tracking
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Initialize drag state
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
        shelfIds: shelves.map(shelf => shelf.shelf_id)
      }));
    }
  }, [shelves, isEditMode]);
  
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
    
    // Reorder during drag to provide visual feedback
    setDragState(prev => {
      if (prev.dragIndex === index) return prev;
      
      const newShelfIds = [...prev.shelfIds];
      const draggedId = newShelfIds[prev.dragIndex];
      
      // Remove from old position and insert at new position
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
    // Dragging is complete, update is handled in dragOver
    setDragState(prev => ({
      ...prev,
      isDragging: false
    }));
  }, []);
  
  // Helper to get style for dragged items
  const getDragItemStyle = useCallback((index: number) => {
    if (!dragState.isDragging) return {};
    
    if (index === dragState.dragIndex) {
      return { 
        opacity: 0.5, 
        border: '2px dashed var(--border)'
      };
    }
    return {};
  }, [dragState.isDragging, dragState.dragIndex]);
  
  // Edit mode handlers
  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
    setSaveError(null);
  }, []);
  
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false);
    setSaveError(null);
    
    // Reset order to original
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
      let errorMessage = "Failed to save shelf order";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaveInProgress(false);
    }
  }, [dragState.shelfIds, onSaveOrder]);
  
  // Get shelves in current order
  const orderedShelves = useMemo(() => {
    if (!isEditMode) return shelves;
    
    // Map IDs back to shelves in the correct order
    return dragState.shelfIds
      .map(id => shelves.find(shelf => shelf.shelf_id === id))
      .filter(Boolean) as Shelf[];
  }, [shelves, isEditMode, dragState.shelfIds]);
  
  // Helper for getting drag props
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
  
  // Handler for back button
  const handleGoBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      // Fallback to browser history if no onBack provided
      window.history.back();
    }
  }, [onBack]);
  
  // Create a handler for shelf viewing that works with the component's API
  const getShelfViewHandler = useCallback((shelfId: string) => {
    if (!isEditMode && onViewShelf) {
      return (id: string) => onViewShelf(id);
    }
    return undefined;
  }, [onViewShelf, isEditMode]);
  
  // Render the shelf cards based on current state and props
  const renderShelfCards = useMemo(() => {
    return orderedShelves.map((shelf, index) => {
      // Get drag props if in edit mode
      const dragProps = getDragProps(index);
      
      // Determine if this is the current user's shelf
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
              isReordering={Boolean(isEditMode)}
            />
          ) : (
            <PublicShelfCard
              shelf={shelf}
              onViewShelf={getShelfViewHandler(shelf.shelf_id)}
              isReordering={Boolean(isEditMode)}
            />
          )}
        </div>
      );
    });
  }, [
    orderedShelves, 
    isEditMode, 
    isCurrentUserProfile, 
    checkEditAccess, 
    getDragProps, 
    getShelfViewHandler
  ]);
  
  // Render header based on options
  const renderHeader = () => (
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
  
  // Render content based on loading state and data
  const renderContent = () => {
    if (loading && shelves.length === 0) {
      return <div className="text-center py-10">Loading shelves...</div>;
    }
    
    if (shelves.length === 0) {
      return (
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
    }
    
    return (
      <>
        <ContentGrid>
          {renderShelfCards}
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
  };
  
  return (
    <div className="h-full flex flex-col">
      {renderHeader()}
      {renderContent()}
    </div>
  );
}; 