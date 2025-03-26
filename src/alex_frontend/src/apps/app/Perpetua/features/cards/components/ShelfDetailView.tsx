import React from 'react';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Edit, Plus, X, Grid, List, Home, User } from "lucide-react";
import { renderBreadcrumbs, isNftContent, isShelfContent, isMarkdownContent } from "../../../utils";
import { ShelfDetailViewProps } from '../types/types';
import { Item } from "../../../../../../../../declarations/perpetua/perpetua.did";
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
  settingsButton
}) => {
  // Check if we're in a user-specific view
  const pathInfo = parsePathInfo(window.location.pathname);
  const isUserView = pathInfo.isUserView;
  const userId = pathInfo.userId;
  const backButtonLabel = pathInfo.backButtonLabel;
  
  const items = isEditMode ? editedItems : orderedItems;
  const [isSaving, setIsSaving] = useState(false);
  const [viewingItemContent, setViewingItemContent] = useState<{
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
  
  // Initialize view mode from localStorage or default to 'grid'
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
        isNftContent(item.content) && item.content.Nft === tokenId
      );
      
      if (itemEntry) {
        onViewItem(itemEntry[0]);
      }
    }
  };

  // Make sure onViewItem is properly typed to handle potential undefined
  const handleShelfContent = (itemId: number) => {
    if (onViewItem) {
      onViewItem(itemId);
    } else {
      console.error("onViewItem callback is not defined");
    }
  };

  // Handle clicking a item to view content
  const handleContentClick = (itemId: number) => {
    // Find the item with this id
    const itemEntry = items.find(([key, item]: [number, Item]) => key === itemId);
    if (!itemEntry) return;
    
    const [_, item] = itemEntry;
    
    // Make sure item.content exists
    if (!item.content) {
      console.error("Item content is undefined for item ID:", itemId);
      return;
    }
    
    // If this is a shelf item, navigate to that shelf instead of showing modal
    if (isShelfContentSafe(item.content)) {
      handleShelfContent(itemId);
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
    const nftId = getNftContentSafe(item.content);
    setViewingItemContent({ 
      itemId, 
      content: item.content,
      transaction: null,
      contentUrls: {
        fullUrl: nftId 
          ? `https://arweave.net/${nftId}` 
          : `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(item.content, null, 2))}`,
        coverUrl: null,
        thumbnailUrl: null
      }
    });
  };

  // Handler for rendering error
  const handleRenderError = (id: string) => {
    console.error("Error rendering content:", id);
    ContentService.clearTransaction(id);
  };

  // Safe type checking functions to handle potential undefined values
  const isMarkdownContentSafe = (content: any): boolean => {
    return content && typeof content === 'object' && 'Markdown' in content;
  };
  
  const isShelfContentSafe = (content: any): boolean => {
    return content && typeof content === 'object' && 'Shelf' in content;
  };
  
  const getNftContentSafe = (content: any): string | null => {
    return content && typeof content === 'object' && 'Nft' in content ? content.Nft : null;
  };
  
  const getMarkdownContentSafe = (content: any): string => {
    return content && typeof content === 'object' && 'Markdown' in content ? content.Markdown : '';
  };

  // Render a card for each item
  const renderCard = (itemKey: number, item: any, index: number) => {
    // Wrap the card content in a draggable container if in edit mode
    const renderDraggableWrapper = (content: React.ReactNode) => (
      <div 
        key={`item-${itemKey}`}
        className="item-card" 
        draggable={isEditMode}
        onDragStart={isEditMode ? () => handleDragStart(index) : undefined}
        onDragOver={isEditMode ? (e) => handleDragOver(e, index) : undefined}
        onDragEnd={isEditMode ? handleDragEnd : undefined}
        onDrop={isEditMode ? (e) => handleDrop(e, index) : undefined}
      >
        {isEditMode && (
          <div className="absolute top-0 left-0 z-40 bg-black/50 text-white p-1 text-xs">
            Item #{itemKey}
            <div 
              className="item-drag-handle ml-2 inline-block text-gray-400 p-1 rounded hover:bg-gray-700 cursor-grab"
              onMouseDown={(e) => {
                // Prevent the click event on the parent div
                e.stopPropagation();
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
              </svg>
            </div>
          </div>
        )}
        {content}
      </div>
    );

    // For NFT content - Use the NftDisplay component
    if (isNftContent(item.content)) {
      const nftId = item.content.Nft;
      
      return renderDraggableWrapper(
        <div className="relative">
          {/* Replace buttons with action menu */}
          <ShelfCardActionMenu
            contentId={nftId}
            contentType="Nft"
            currentShelfId={shelf.shelf_id}
            parentShelfId={shelf.shelf_id}
            itemId={itemKey}
          />
          
          <NftDisplay 
            tokenId={nftId} 
            onViewDetails={handleNftDetails}
            inShelf={true}
          />
        </div>
      );
    }
    
    // For shelf content
    if (isShelfContent(item.content)) {
      return renderDraggableWrapper(
        <div className="relative">
          {/* ShelfContentDisplay already has the ShelfCardActionMenu */}
          <ShelfContentDisplay 
            shelfId={item.content.Shelf} 
            owner={shelf.owner.toString()}
            onClick={() => handleContentClick(itemKey)}
            parentShelfId={shelf.shelf_id}
            itemId={itemKey}
          />
        </div>
      );
    }
    
    // For markdown content 
    if (isMarkdownContent(item.content)) {
      return renderDraggableWrapper(
        <div className="relative">
          {/* Replace buttons with action menu */}
          <ShelfCardActionMenu
            contentId={item.content.Markdown}
            contentType="Markdown"
            currentShelfId={shelf.shelf_id}
            parentShelfId={shelf.shelf_id}
            itemId={itemKey}
          />
          <MarkdownContentDisplay 
            content={item.content.Markdown} 
            owner={shelf.owner.toString()}
            onClick={() => handleContentClick(itemKey)}
            parentShelfId={shelf.shelf_id}
            itemId={itemKey}
          />
        </div>
      );
    }
    
    // Fallback for unknown content
    return renderDraggableWrapper(
      <ContentCard
        id={`unknown-${itemKey}`}
        onClick={() => handleContentClick(itemKey)}
        owner={shelf.owner.toString()}
        component="Perpetua"
        footer={
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="default" className="text-[10px] py-0.5 px-1">
              Unknown
            </Badge>
          </div>
        }
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">Unknown content</div>
        </div>
      </ContentCard>
    );
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setViewingItemContent(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 flex justify-between items-center w-full bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center">
          <div className="flex items-center h-8 rounded-md border border-input bg-background overflow-hidden">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="flex items-center gap-1 h-8 rounded-r-none border-r px-3 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {backButtonLabel}
            </Button>
            <div className="flex items-center px-3 text-sm">
              <Button
                variant="ghost"
                onClick={goToOwnerShelves}
                className="ml-1 p-0 h-auto text-sm hover:bg-transparent"
                title={`View all shelves by ${breadcrumbUserId}`}
              >
                <User className="w-3 h-3 mr-1" />
                {breadcrumbUserLabel}
              </Button>
              
              <span className="mx-1">/</span>
              <span className="font-medium">{shelf.title}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden mr-2">
            <Button
              variant="outline"
              className={`rounded-none h-8 px-3 ${viewMode === 'grid' ? 'bg-primary/10' : ''}`}
              onClick={() => handleViewModeChange('grid')}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className={`rounded-none h-8 px-3 ${viewMode === 'blog' ? 'bg-primary/10' : ''}`}
              onClick={() => handleViewModeChange('blog')}
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
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Order'}
              </Button>
            </>
          )}
          
          {hasEditAccess && onAddItem && (
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
      </div>
      
      <div className="px-4 py-2">
        <div className="mb-3">
          <h2 className="text-2xl font-bold">{shelf.title}</h2>
          <p className="text-muted-foreground">{shelf.description}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Owner: <PrincipalDisplay principal={shelf.owner} />
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-4 pb-4">
        {items.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground h-full flex flex-col items-center justify-center">
            <p className="mb-2">This shelf is empty.</p>
            {hasEditAccess && onAddItem && (
              <Button
                variant="outline"
                className="flex items-center gap-1 mx-auto"
                onClick={() => onAddItem(shelf)}
              >
                <Plus className="w-4 h-4" />
                Add First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full">
            {viewMode === 'grid' ? (
              // Grid View Layout
              <ContentGrid>
                {items.map(([itemKey, item]: [number, Item], index: number) => (
                  renderCard(itemKey, item, index)
                ))}
              </ContentGrid>
            ) : (
              // Blog View Layout
              <div className="blog-view-layout max-w-4xl mx-auto">
                {/* Group content by type - markdown vs. non-markdown */}
                {(() => {
                  // Define types
                  type BlogItemType = [number, any, number]; // [itemKey, item, index]
                  type SectionType = 'markdown' | 'visual' | null;
                  type BlogSection = { type: SectionType; items: BlogItemType[] };
                  
                  // Group consecutive markdown items together
                  const blogSections: BlogSection[] = [];
                  let currentGroup: BlogItemType[] = [];
                  let currentType: SectionType = null; // 'markdown' or 'visual'
                  
                  // Process all items and group them
                  items.forEach(([itemKey, item]: [number, Item], index: number) => {
                    const isMarkdown = isMarkdownContent(item.content);
                    const currentContentType: SectionType = isMarkdown ? 'markdown' : 'visual';
                    
                    // Start a new group if type changes
                    if (currentType !== null && currentType !== currentContentType) {
                      blogSections.push({ type: currentType, items: [...currentGroup] });
                      currentGroup = [];
                    }
                    
                    // Add to current group
                    currentGroup.push([itemKey, item, index]);
                    currentType = currentContentType;
                  });
                  
                  // Add the final group
                  if (currentGroup.length > 0 && currentType !== null) {
                    blogSections.push({ type: currentType, items: [...currentGroup] });
                  }
                  
                  // Render all sections
                  return blogSections.map((section, sectionIndex) => (
                    <div key={`section-${sectionIndex}`} className="mb-12">
                      {section.type === 'markdown' ? (
                        // Render markdown content in a vertical flow
                        <div className="prose dark:prose-invert max-w-none">
                          {section.items.map(([itemKey, item, originalIndex]: [number, Item, number]) => (
                            <div 
                              key={`item-${itemKey}`} 
                              className={`item-card mb-8 ${isEditMode ? 'relative border border-dashed border-border p-6 rounded-md bg-muted/5' : ''}`}
                              draggable={isEditMode}
                              onDragStart={isEditMode ? () => handleDragStart(originalIndex) : undefined}
                              onDragOver={isEditMode ? (e) => handleDragOver(e, originalIndex) : undefined}
                              onDragEnd={isEditMode ? handleDragEnd : undefined}
                              onDrop={isEditMode ? (e) => handleDrop(e, originalIndex) : undefined}
                            >
                              {isEditMode && (
                                <div className="absolute top-2 right-2 z-40 bg-background text-foreground px-2 py-1 text-xs rounded-md border border-border">
                                  Item #{itemKey}
                                  <div 
                                    className="item-drag-handle ml-2 inline-block text-gray-400 p-1 rounded hover:bg-gray-700 cursor-grab"
                                    onMouseDown={(e) => { e.stopPropagation(); }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                                    </svg>
                                  </div>
                                </div>
                              )}
                              <BlogMarkdownDisplay 
                                content={(item.content as any).Markdown} 
                                onClick={() => handleContentClick(itemKey)} 
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Render visual content (NFTs/Shelves) in a horizontal grid
                        <div className="visual-content-row mb-8">
                          <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-4 font-semibold">Visual Content</h3>
                          <ContentGrid>
                            {section.items.map(([itemKey, item, originalIndex]: [number, Item, number]) => (
                              renderCard(itemKey, item, originalIndex)
                            ))}
                          </ContentGrid>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Shared Modal for Viewing Content */}
      {viewingItemContent && (
        <Dialog open={!!viewingItemContent} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
            <DialogTitle className="sr-only">Content Viewer</DialogTitle>
            
            <div className="w-full h-full overflow-y-auto">
              <div className="p-6">
                {viewingItemContent.transaction && (
                  <ContentRenderer
                    key={viewingItemContent.transaction.id}
                    transaction={viewingItemContent.transaction}
                    content={viewingItemContent.content}
                    contentUrls={
                      (viewingItemContent.content?.urls) || {
                        fullUrl: `data:text/markdown;charset=utf-8,${encodeURIComponent(
                          isMarkdownContentSafe(viewingItemContent.content) 
                            ? getMarkdownContentSafe(viewingItemContent.content)
                            : JSON.stringify(viewingItemContent.content || {}, null, 2)
                        )}`,
                        thumbnailUrl: null,
                        coverUrl: null
                      }
                    }
                    handleRenderError={() => handleRenderError(viewingItemContent.transaction?.id || '')}
                    inModal={true}
                  />
                )}
                {!viewingItemContent.transaction && isMarkdownContentSafe(viewingItemContent.content) && (
                  <BlogMarkdownDisplay
                    content={getMarkdownContentSafe(viewingItemContent.content)}
                    onClick={() => {}}
                  />
                )}
                {!viewingItemContent.transaction && !isMarkdownContentSafe(viewingItemContent.content) && viewingItemContent.contentUrls && (
                  <ContentRenderer
                    key={`item-${viewingItemContent.itemId}`}
                    transaction={{
                      id: `generic-${viewingItemContent.itemId}`,
                      owner: shelf.owner.toString(),
                      tags: []
                    }}
                    content={viewingItemContent.content}
                    contentUrls={viewingItemContent.contentUrls}
                    handleRenderError={() => console.error("Error rendering non-transaction content")}
                    inModal={true}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Export default as well
export default ShelfDetailView; 