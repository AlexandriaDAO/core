import React from 'react';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Edit, Plus, X, Grid, List, Home, User } from "lucide-react";
import { renderBreadcrumbs, isNftContent, isShelfContent, isMarkdownContent } from "../../../utils";
import { ShelfDetailViewProps } from '../types/types';
import { Item } from "@/../../declarations/perpetua/perpetua.did";
import { PrincipalDisplay } from '@/apps/Modules/shared/components/PrincipalDisplay';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
import { clearTransactionContent, setContentData } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { useState } from "react";
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import { Badge } from "@/lib/components/badge";
import { parsePathInfo } from "../../../routes";
import { buildRoutes } from "../../../routes";

// Import our extracted components
import NftDisplay from '../components/NftDisplay';
import { ShelfContentDisplay, MarkdownContentDisplay, BlogMarkdownDisplay } from '../components/ContentDisplays';
import { ShelfCardActionMenu } from './ShelfCardActionMenu';
import ShelfViewHeader from './ShelfViewHeader';
import ShelfViewControls, { useViewMode } from './ShelfViewControls';
import ShelfContentModal from './ShelfContentModal';
import ShelfGridView from './ShelfGridView';
import ShelfBlogView from './ShelfBlogView';
import ShelfEmptyView from './ShelfEmptyView';

// Import utility functions
import { 
  isShelfContentSafe, 
  isMarkdownContentSafe, 
  getMarkdownContentSafe,
  getNftContentSafe,
  generateContentUrls
} from '../utils/ShelfViewUtils';

// Define a fallback function for optional callbacks
const noop = () => { console.warn("Callback is not defined"); };

// Main ShelfDetailView component
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
  // Check if we're in a user-specific view
  const pathInfo = parsePathInfo(window.location.pathname);
  const isUserView = pathInfo.isUserView;
  const userId = pathInfo.userId;
  const backButtonLabel = pathInfo.backButtonLabel;
  
  const items = isEditMode ? editedItems : orderedItems;
  const [isSaving, setIsSaving] = React.useState(false);
  const { viewMode, handleViewModeChange } = useViewMode();
  
  // Ensure we have a non-undefined version of onAddItem
  const safeOnAddItem = onAddItem || noop;
  
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
  
  // Navigate to owner's shelves
  const goToOwnerShelves = () => {
    // If we're already in a user view, use that user ID
    const targetUser = isUserView && userId ? userId : shelf.owner.toString();
    window.location.href = buildRoutes.user(targetUser);
  };
  
  // Get the user ID to display in the breadcrumb
  const breadcrumbUserId = isUserView && userId ? userId : shelf.owner.toString();
  const breadcrumbUserLabel = isUserView && userId ? `User ${userId.slice(0, 8)}...` : `${shelf.owner.toString().slice(0, 8)}...`;
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveItemOrder();
    } finally {
      setIsSaving(false);
    }
  };

  // For viewing content in modal
  const handleNftDetails = async (tokenId: string) => {
    // For NFTs, we no longer need to set viewingItemContent since the modal is handled in NftDisplay
    // We still want to call onViewItem if provided, for other side effects
    if (onViewItem) {
      // Find the item key for this NFT
      const itemEntry = items.find(([_, item]: [number, Item]) => 
        item.content && 'Nft' in item.content && item.content.Nft === tokenId
      );
      
      if (itemEntry) {
        onViewItem(itemEntry[0]);
      }
    }
  };

  // Handle clicking an item to view content
  const handleContentClick = (itemId: number) => {
    // Find the item with this id
    const itemEntry = items.find(([key, _]: [number, Item]) => key === itemId);
    if (!itemEntry) return;
    
    const [_, item] = itemEntry;
    
    // Make sure item.content exists
    if (!item.content) {
      console.error("Item content is undefined for item ID:", itemId);
      return;
    }
    
    // If this is a shelf item, navigate to that shelf instead of showing modal
    if (isShelfContentSafe(item.content)) {
      if (onViewItem) {
        onViewItem(itemId);
      } else {
        console.error("onViewItem callback is not defined");
      }
      return;
    }
    
    // For markdown content, create a temporary transaction-like object with proper URLs
    if (isMarkdownContentSafe(item.content)) {
      const markdownTransaction: Transaction = {
        id: `markdown-${itemId}`,
        owner: shelf.owner.toString(),
        tags: []  // Required empty array of tags
      };
      
      setViewingItemContent({
        itemId,
        content: {
          type: 'markdown',
          textContent: getMarkdownContentSafe(item.content),
          urls: {
            fullUrl: `data:text/markdown;charset=utf-8,${encodeURIComponent(getMarkdownContentSafe(item.content))}`,
            coverUrl: null,
            thumbnailUrl: null
          }
        },
        transaction: markdownTransaction
      });
      return;
    }
    
    // For other content types, set up basic viewing content with default contentUrls
    setViewingItemContent({ 
      itemId, 
      content: item.content,
      transaction: null,
      contentUrls: generateContentUrls(item.content)
    });
  };

  // Handler for rendering error
  const handleRenderError = (id: string) => {
    console.error("Error rendering content:", id);
    ContentService.clearTransaction(id);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setViewingItemContent(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full bg-background/80 backdrop-blur-sm sticky top-0 z-10">
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
      
      <div className="flex-1 px-4 pb-4">
        {items.length === 0 ? (
          <ShelfEmptyView 
            hasEditAccess={hasEditAccess} 
            onAddItem={safeOnAddItem} 
            shelf={shelf} 
          />
        ) : (
          <div className="w-full">
            {viewMode === 'grid' ? (
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
        )}
      </div>
      
      {/* Content Viewing Modal */}
      <ShelfContentModal 
        viewingItemContent={viewingItemContent}
        onClose={handleCloseModal}
        shelfOwner={shelf.owner.toString()}
      />
    </div>
  );
};

// Export default as well
export default ShelfDetailView; 