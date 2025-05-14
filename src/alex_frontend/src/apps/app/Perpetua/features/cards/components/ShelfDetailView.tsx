import React, { useState } from 'react';
import { parsePathInfo } from "../../../routes";
import { Item } from "@/../../declarations/perpetua/perpetua.did";
import { Transaction } from "@/apps/Modules/shared/types/queries";

// Import our extracted components
import ShelfViewHeader from './ShelfViewHeader';
import ShelfViewControls, { useViewMode } from './ShelfViewControls';
import ShelfContentModal from './ShelfContentModal';
import ShelfGridView from './ShelfGridView';
import ShelfBlogView from './ShelfBlogView';
import ShelfEmptyView from './ShelfEmptyView';
import InlineItemCreator from '../../shelf-management/components/InlineItemCreator';
import { ShelfInformationDialog } from '../../shelf-information/components/ShelfInformationDialog';

// Import utility functions
import { 
  isShelfContentSafe, 
  generateContentUrls,
  getNftContentSafe
} from '../utils/ShelfViewUtils';

// Update the props type definition for the component
interface UpdatedShelfDetailViewProps {
  shelf: any;
  orderedItems: [number, Item][];
  isEditMode: boolean;
  editedItems: [number, Item][];
  isOwner: boolean;
  canAddItem: boolean;
  onBack: () => void;
  onAddItem: (content: string, type: "Nft" | "Markdown" | "Shelf", collectionType?: "NFT" | "SBT") => Promise<boolean | void>;
  onViewItem?: (itemId: number) => void;
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  onSaveItemOrder: () => Promise<void>;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  getDragItemStyle: (index: number) => React.CSSProperties;
  draggedIndex: number | null;
  settingsButton?: React.ReactNode;
}

/**
 * ShelfDetailView - Main component for displaying a shelf and its contents
 */
export const ShelfDetailView: React.FC<UpdatedShelfDetailViewProps> = ({
  shelf,
  orderedItems,
  isEditMode,
  editedItems,
  isOwner,
  canAddItem,
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
  const [isSaving, setIsSaving] = useState(false);
  const { viewMode, handleViewModeChange } = useViewMode();
  
  // State for inline item creator
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  // State for content modal
  const [viewingItemContent, setViewingItemContent] = useState<{
    itemId: number;
    content: any; // Keep 'any' for now, represents ItemContent variant
    nftId?: string; // Store the Arweave ID for NFTs
    // Removed transaction: Transaction | null;
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
    
    // For Shelf content, navigate to that shelf (or handle as needed)
    if (isShelfContentSafe(item.content)) {
      if (onViewItem) onViewItem(itemId);
      // Potentially open a different kind of modal or navigate
      console.log("Shelf content clicked, navigating/handling...");
      return;
    }
    
    // Get NFT Arweave ID if it's an NFT
    const nftId = getNftContentSafe(item.content);
    
    // Open modal for content types that should have one (NFTs primarily)
    if (nftId) { // Only open for NFTs for now
      console.log(`Opening modal for NFT: Item ID ${itemId}, Arweave ID ${nftId}`);
      setViewingItemContent({ 
        itemId, 
        content: item.content, // The ItemContent variant (e.g., { Nft: 'arweave_id' })
        nftId: nftId, // Store the Arweave ID
        contentUrls: generateContentUrls(item.content)
      });
    } else {
      // Handle clicks for other types like Markdown if needed
      // Currently, only NFTs open the modal
      console.log(`Content type clicked (Item ID ${itemId}) does not open standard modal.`);
      // If Markdown should open *something*, add logic here.
      // If onViewItem should be called for non-NFTs/Shelves, call it here.
      // if (onViewItem) onViewItem(itemId); 
    }
  };

  const handleAddItemClick = () => {
    setIsAddingItem(true);
  };

  const handleItemSubmit = async (content: string, type: "Nft" | "Markdown" | "Shelf", collectionType?: "NFT" | "SBT") => {
    await onAddItem(content, type, collectionType);
    setIsAddingItem(false);
  };

  const handleCancelAddItem = () => {
    setIsAddingItem(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full bg-background/80 backdrop-blur-sm sticky top-0 z-40 p-4 border-b gap-3 sm:gap-0">
        <ShelfViewHeader 
          shelf={shelf} 
          onBack={onBack} 
        />
        
        <ShelfViewControls
          isOwner={isOwner}
          canAddItem={canAddItem}
          isEditMode={isEditMode}
          isSaving={isSaving}
          settingsButton={settingsButton}
          infoButton={
            <ShelfInformationDialog shelf={shelf} />
          }
          onEnterEditMode={onEnterEditMode}
          onCancelEditMode={onCancelEditMode}
          onSave={handleSave}
          onAddItem={handleAddItemClick}
          shelf={shelf}
          onViewModeChange={handleViewModeChange}
          currentViewMode={viewMode}
        />
      </div>
      
      {/* Inline Item Creator */}
      {isAddingItem && canAddItem && (
        <div className="px-4 pt-4">
          <InlineItemCreator
            onSubmit={handleItemSubmit}
            onCancel={handleCancelAddItem}
            shelf={shelf}
          />
        </div>
      )}
      
      <div className="flex-1 p-4">
        {items.length === 0 ? (
          <ShelfEmptyView 
            canAddItem={canAddItem}
            onAddItem={canAddItem ? handleAddItemClick : () => {}}
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