import React from 'react';
import { parsePathInfo } from "../../../routes";
import { ShelfDetailViewProps } from '../../../types/item.types';
import { Item } from "@/../../declarations/perpetua/perpetua.did";
import { Transaction } from "@/apps/Modules/shared/types/queries";

// Import our extracted components
import ShelfViewHeader from './ShelfViewHeader';
import ShelfViewControls, { useViewMode } from './ShelfViewControls';
import ShelfContentModal from './ShelfContentModal';
import ShelfGridView from './ShelfGridView';
import ShelfBlogView from './ShelfBlogView';
import ShelfEmptyView from './ShelfEmptyView';

// Import utility functions
import { 
  isShelfContentSafe, 
  generateContentUrls,
  getNftContentSafe
} from '../utils/ShelfViewUtils';

/**
 * ShelfDetailView - Main component for displaying a shelf and its contents
 */
export const ShelfDetailView: React.FC<ShelfDetailViewProps> = ({
  shelf,
  orderedItems,
  isEditMode,
  editedItems,
  hasEditAccess,
  onBack,
  onAddItem,
  onViewItem,
  onEnterEditMode,
  onCancelEditMode,
  onSaveItemOrder,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  getDragItemStyle,
  draggedIndex,
  settingsButton
}) => {
  const pathInfo = parsePathInfo(window.location.pathname);
  const items = isEditMode ? editedItems : orderedItems;
  const [isSaving, setIsSaving] = React.useState(false);
  const { viewMode, handleViewModeChange } = useViewMode();
  const safeOnAddItem = onAddItem || (() => console.warn("onAddItem callback is not defined"));
  
  // State for content modal
  const [viewingItemContent, setViewingItemContent] = React.useState<{
    itemId: number;
    content: any;
    transaction: Transaction | null;
    contentUrls?: {
      fullUrl: string;
      coverUrl: string | null;
      thumbnailUrl: string | null;
    };
  } | null>(null);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveItemOrder();
    } finally {
      setIsSaving(false);
    }
  };

  const handleNftDetails = async (tokenId: string) => {
    if (!onViewItem) return;
    
    const itemEntry = items.find(([_, item]: [number, Item]) => 
      item.content && 'Nft' in item.content && item.content.Nft === tokenId
    );
    
    if (itemEntry) {
      onViewItem(itemEntry[0]);
    }
  };

  const handleContentClick = (itemId: number) => {
    const itemEntry = items.find(([key, _]: [number, Item]) => key === itemId);
    if (!itemEntry || !itemEntry[1].content) return;
    
    const [_, item] = itemEntry;
    
    // For Shelf content, navigate to that shelf
    if (isShelfContentSafe(item.content)) {
      if (onViewItem) onViewItem(itemId);
      return;
    }
    
    // Only open modals for NFT content
    const nftId = getNftContentSafe(item.content);
    if (nftId) {
      setViewingItemContent({ 
        itemId, 
        content: item.content,
        transaction: null,
        contentUrls: generateContentUrls(item.content)
      });
    }
    // For all other content types including Markdown, don't open a modal
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center w-full bg-background/80 backdrop-blur-sm sticky top-0 z-10 p-4 border-b">
        <ShelfViewHeader 
          shelf={shelf} 
          onBack={onBack} 
        />
        
        <ShelfViewControls
          hasEditAccess={hasEditAccess}
          isEditMode={isEditMode}
          isSaving={isSaving}
          settingsButton={settingsButton}
          onEnterEditMode={onEnterEditMode}
          onCancelEditMode={onCancelEditMode}
          onSave={handleSave}
          onAddItem={safeOnAddItem}
          shelf={shelf}
          onViewModeChange={handleViewModeChange}
          currentViewMode={viewMode}
        />
      </div>
      
      <div className="flex-1 p-4">
        {items.length === 0 ? (
          <ShelfEmptyView 
            hasEditAccess={hasEditAccess} 
            onAddItem={safeOnAddItem} 
            shelf={shelf} 
          />
        ) : viewMode === 'grid' ? (
          <ShelfGridView
            items={items}
            isEditMode={isEditMode}
            draggedIndex={draggedIndex || null}
            shelf={shelf}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDragEnd={handleDragEnd}
            handleDrop={handleDrop}
            getDragItemStyle={getDragItemStyle}
            handleNftDetails={handleNftDetails}
            handleContentClick={handleContentClick}
          />
        ) : (
          <ShelfBlogView
            items={items}
            isEditMode={isEditMode}
            draggedIndex={draggedIndex || null}
            shelf={shelf}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDragEnd={handleDragEnd}
            handleDrop={handleDrop}
            handleNftDetails={handleNftDetails}
            handleContentClick={handleContentClick}
          />
        )}
      </div>
      
      <ShelfContentModal 
        viewingItemContent={viewingItemContent}
        onClose={() => setViewingItemContent(null)}
        shelfOwner={shelf.owner.toString()}
      />
    </div>
  );
};

export default ShelfDetailView; 