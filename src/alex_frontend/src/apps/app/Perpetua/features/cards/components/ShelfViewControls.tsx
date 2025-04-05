import React from 'react';
import { Button } from "@/lib/components/button";
import { Edit, Plus, X, Grid, List } from "lucide-react";
import { useState, useEffect } from 'react';

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
}) => (
  <div className="flex items-center gap-2">
    {/* View mode toggle */}
    <div className="flex border rounded-md overflow-hidden mr-2">
      <Button
        variant="outline"
        className={`rounded-none h-8 px-3 border-0 ${currentViewMode === 'grid' ? 'bg-primary/10' : ''}`}
        onClick={() => onViewModeChange('grid')}
        aria-label="Grid View"
      >
        <Grid className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        className={`rounded-none h-8 px-3 border-0 ${currentViewMode === 'blog' ? 'bg-primary/10' : ''}`}
        onClick={() => onViewModeChange('blog')}
        aria-label="Blog View"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
    
    {/* Settings button if not in edit mode */}
    {!isEditMode && settingsButton}
    
    {/* Edit mode controls */}
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
    
    {/* Add item button */}
    {hasEditAccess && (
      <Button
        variant="primary"
        className="flex items-center gap-1 h-8 text-sm"
        onClick={() => onAddItem(shelf)}
      >
        <Plus className="w-4 h-4" />
        Add Item
      </Button>
    )}
  </div>
);

/**
 * Custom hook for managing view mode with localStorage persistence
 */
export const useViewMode = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'blog'>(() => {
    if (typeof window === 'undefined') return 'grid';
    
    const storedViewMode = localStorage.getItem('alexandria-shelf-view-mode');
    return (storedViewMode === 'grid' || storedViewMode === 'blog') ? 
      storedViewMode as 'grid' | 'blog' : 'grid';
  });
  
  const handleViewModeChange = (mode: 'grid' | 'blog') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('alexandria-shelf-view-mode', mode);
    }
  };
  
  return { viewMode, handleViewModeChange };
};

export default ShelfViewControls; 