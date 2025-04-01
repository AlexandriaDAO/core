import React, { useState, useEffect } from 'react';
import { Button } from "@/lib/components/button";
import { Edit, Plus, X, Grid, List } from "lucide-react";

interface ShelfViewControlsProps {
  hasEditAccess: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  settingsButton?: React.ReactNode;
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  onSave: () => void;
  onAddItem: ((shelf: any) => void) | (() => void);
  shelf: any;
  onViewModeChange: (mode: 'grid' | 'blog') => void;
  currentViewMode: 'grid' | 'blog';
}

export const ShelfViewControls: React.FC<ShelfViewControlsProps> = ({
  hasEditAccess,
  isEditMode,
  isSaving,
  settingsButton,
  onEnterEditMode,
  onCancelEditMode,
  onSave,
  onAddItem,
  shelf,
  onViewModeChange,
  currentViewMode
}) => {
  const handleAddItem = () => {
    onAddItem(shelf);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex border rounded-md overflow-hidden mr-2">
        <Button
          variant="outline"
          className={`rounded-none h-8 px-3 ${currentViewMode === 'grid' ? 'bg-primary/10' : ''}`}
          onClick={() => onViewModeChange('grid')}
          aria-label="Grid View"
        >
          <Grid className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          className={`rounded-none h-8 px-3 ${currentViewMode === 'blog' ? 'bg-primary/10' : ''}`}
          onClick={() => onViewModeChange('blog')}
          aria-label="Blog View"
        >
          <List className="w-4 h-4" />
        </Button>
      </div>
      
      {!isEditMode && settingsButton}
      
      {!isEditMode && hasEditAccess && (
        <Button
          variant="outline"
          className="flex items-center gap-1 h-8 text-sm"
          onClick={onEnterEditMode}
        >
          <Edit className="w-4 h-4" />
          Reorder
        </Button>
      )}
      
      {isEditMode && (
        <>
          <Button
            variant="outline"
            className="flex items-center gap-1 h-8 text-sm"
            onClick={onCancelEditMode}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          
          <Button
            variant="primary"
            className="flex items-center gap-1 h-8 text-sm"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Order'}
          </Button>
        </>
      )}
      
      {hasEditAccess && (
        <Button
          variant="primary"
          className="flex items-center gap-1 h-8 text-sm"
          onClick={handleAddItem}
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      )}
    </div>
  );
};

// Hook for managing view mode with localStorage
export const useViewMode = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'blog'>(() => {
    // Try to get stored preference
    const storedViewMode = typeof window !== 'undefined' ? 
      localStorage.getItem('alexandria-shelf-view-mode') : null;
    // Return stored value if valid, otherwise default to 'grid'
    return (storedViewMode === 'grid' || storedViewMode === 'blog') ? 
      storedViewMode as 'grid' | 'blog' : 'grid';
  });
  
  // Save view mode to localStorage when it changes
  const handleViewModeChange = (mode: 'grid' | 'blog') => {
    setViewMode(mode);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('alexandria-shelf-view-mode', mode);
    }
  };
  
  return { viewMode, handleViewModeChange };
};

export default ShelfViewControls; 