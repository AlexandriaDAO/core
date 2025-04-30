import React from 'react';
import { Button } from "@/lib/components/button";
import { Edit, Plus, X, Grid, List, MoreVertical, Check } from "lucide-react";
import { useState } from 'react';

interface ShelfViewControlsProps {
  isOwner: boolean;
  canAddItem: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  settingsButton?: React.ReactNode;
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  onSave: () => void;
  onAddItem: () => void;
  shelf: any;
  onViewModeChange: (mode: 'grid' | 'blog') => void;
  currentViewMode: 'grid' | 'blog';
}

export const ShelfViewControls: React.FC<ShelfViewControlsProps> = ({
  isOwner,
  canAddItem,
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="relative">
      {/* Desktop layout - hidden on small screens */}
      <div className="hidden sm:flex items-center gap-2">
        {/* View mode toggle */}
        <div className="flex border rounded-md overflow-hidden">
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
        {!isEditMode && isOwner && (
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
        {canAddItem && (
          <Button
            variant="primary"
            className="flex items-center gap-1 h-8 text-sm"
            onClick={onAddItem}
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        )}
      </div>
      
      {/* Mobile layout - visible only on small screens */}
      <div className="flex sm:hidden items-center space-x-2">
        {/* Essential controls always visible on mobile */}
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant="outline"
            className={`rounded-none h-8 w-8 p-1 border-0 ${currentViewMode === 'grid' ? 'bg-primary/10' : ''}`}
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid View"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className={`rounded-none h-8 w-8 p-1 border-0 ${currentViewMode === 'blog' ? 'bg-primary/10' : ''}`}
            onClick={() => onViewModeChange('blog')}
            aria-label="Blog View"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Most important action - directly available */}
        {canAddItem && !isEditMode && (
          <Button
            variant="primary"
            className="h-8 w-8 p-1"
            onClick={onAddItem}
            aria-label="Add Item"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
        
        {/* Edit mode specific controls */}
        {isEditMode && (
          <>
            <Button
              variant="outline"
              className="h-8 w-8 p-1"
              onClick={onCancelEditMode}
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </Button>
            
            <Button
              variant="primary"
              className="h-8 w-8 p-1"
              onClick={onSave}
              disabled={isSaving}
              aria-label="Save Order"
            >
              <Check className="w-4 h-4" />
            </Button>
          </>
        )}
        
        {/* Mobile menu toggle for additional options */}
        {(!isEditMode && (isOwner || settingsButton)) && (
          <div className="relative">
            <Button
              variant="outline"
              className="h-8 w-8 p-1"
              onClick={toggleMobileMenu}
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            
            {/* Dropdown menu for additional controls */}
            {showMobileMenu && (
              <div className="absolute right-0 top-full mt-1 bg-background border rounded-md shadow-lg z-50 min-w-[150px]">
                <div className="py-1">
                  {!isEditMode && settingsButton && (
                    <div className="px-2 py-1">
                      {settingsButton}
                    </div>
                  )}
                  
                  {!isEditMode && isOwner && (
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 flex items-center gap-2"
                      onClick={() => {
                        onEnterEditMode();
                        setShowMobileMenu(false);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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