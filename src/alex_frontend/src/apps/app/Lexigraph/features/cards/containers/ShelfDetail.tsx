import React from 'react';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Edit, Plus, X } from "lucide-react";
import { renderBreadcrumbs, isNftContent, isShelfContent, isMarkdownContent } from "../../../utils";
import { ShelfDetailUIProps } from '../types/types';
import { PrincipalDisplay } from '@/apps/Modules/shared/components/PrincipalDisplay';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
import { loadContentForTransactions, addTransaction } from "@/apps/Modules/shared/state/transactions/transactionThunks";
import { clearTransactionContent, setContentData } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { useEffect } from "react";
import { natToArweaveId } from '@/utils/id_convert';

export const ShelfDetailUI: React.FC<ShelfDetailUIProps> = ({
  shelf,
  orderedSlots,
  isEditMode,
  editedSlots,
  isPublic,
  onBack,
  onAddSlot,
  onViewSlot,
  onEnterEditMode,
  onCancelEditMode,
  onSaveSlotOrder,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  settingsButton
}) => {
  const backButtonLabel = "Back";
  const breadcrumbItems = [
    { label: backButtonLabel, onClick: onBack },
    { label: shelf.title }
  ];

  const slots = isEditMode ? editedSlots : orderedSlots;
  const [isSaving, setIsSaving] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  
  // Track content loading state to prevent infinite loops
  const [loadingContentIds, setLoadingContentIds] = React.useState<Set<string>>(new Set());
  const [loadedContentIds, setLoadedContentIds] = React.useState<Set<string>>(new Set());
  const [contentLoadAttempts, setContentLoadAttempts] = React.useState<Record<string, number>>({});
  const MAX_LOAD_ATTEMPTS = 2;
  
  // Get real transaction data for NFT slots and user info for ownership checks
  const { transactions, contentData } = useSelector((state: RootState) => state.transactions);
  const { user } = useSelector((state: RootState) => state.auth);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const { predictions } = useSelector((state: RootState) => state.arweave);
  
  // Helper function to convert NFT ID to Arweave ID
  const getArweaveId = (nftId: string): string => {
    // If already in Arweave format, use it directly
    if (/^[a-zA-Z0-9_-]{43}$/.test(nftId)) {
      return nftId;
    }
    
    // If it's an NFT ID (numeric), convert it using natToArweaveId
    if (/^\d+$/.test(nftId)) {
      try {
        return natToArweaveId(BigInt(nftId));
      } catch (error) {
        console.error(`Failed to convert NFT ID ${nftId} to Arweave ID:`, error);
      }
    }
    
    // Look through the arweaveToNftId mapping to find the inverse
    const mappedEntry = Object.entries(arweaveToNftId).find(([_, id]) => id === nftId);
    return mappedEntry ? mappedEntry[0] : nftId;
  };

  // Create a direct transaction and content entry - borrowed from SlotDetail approach
  const createDirectNftTransaction = React.useCallback(async (contentId: string, arweaveId: string) => {
    // Create a complete transaction with the correct ID and URL
    const transaction: Transaction = {
      id: arweaveId,
      owner: "",
      tags: [{ name: "Content-Type", value: "image/png" }],
      assetUrl: `https://arweave.net/${arweaveId}`
    };
    
    // Add the transaction directly to Redux
    await dispatch(addTransaction(transaction));
    
    // Create content data with proper URLs
    const content = {
      url: `https://arweave.net/${arweaveId}`,
      textContent: null,
      imageObjectUrl: null,
      thumbnailUrl: null,
      error: null,
      urls: {
        thumbnailUrl: null,
        coverUrl: null,
        fullUrl: `https://arweave.net/${arweaveId}`
      }
    };
    
    // Add content directly to Redux
    dispatch(setContentData({
      id: arweaveId,
      content
    }));
    
    return { transaction, content };
  }, [dispatch]);

  // Transform slots to transactions
  const slotTransactions = React.useMemo(() => {
    return slots.map(([slotKey, slot]) => {
      // For NFT content, use the actual transaction
      if (isNftContent(slot.content)) {
        const nftId = (slot.content as any).Nft;
        // Convert to Arweave ID for proper URL construction
        const arweaveId = getArweaveId(nftId);
        const existingTransaction = transactions.find(t => t.id === arweaveId);
        
        if (existingTransaction) {
          return {
            ...existingTransaction,
            slotKey, // Add slotKey for drag-drop identification
            slotData: slot // Keep original slot data for special handling
          };
        }
        
        // Fallback if transaction not found
        return {
          id: arweaveId, // Use Arweave ID for transaction ID
          owner: "",
          tags: [{ name: "Content-Type", value: "text/plain" }],
          slotKey,
          slotData: slot
        } as Transaction & { slotKey: number; slotData: any };
      }
      
      // For other content types, create a synthetic transaction
      return {
        id: `slot-${slotKey}`,
        owner: shelf.owner.toString(),
        tags: [
          { name: "Content-Type", value: isShelfContent(slot.content) 
            ? "application/vnd.alexandrian.shelf" 
            : "text/markdown" 
          },
          { name: "Slot-Type", value: isShelfContent(slot.content) ? "shelf" : "markdown" }
        ],
        slotKey,
        slotData: slot
      } as Transaction & { slotKey: number; slotData: any };
    });
  }, [slots, transactions, shelf.owner]);

  // Load content for NFT slots
  useEffect(() => {
    const loadContent = async () => {
      // Get all NFT transactions that need content loading
      const nftSlotsToLoad = slots
        .filter(([_, slot]) => {
          if (!isNftContent(slot.content)) return false;
          
          const nftId = (slot.content as any).Nft;
          const arweaveId = getArweaveId(nftId);
          
          // Skip if content is already loaded
          if (contentData[arweaveId]) return false;
          
          // Skip if we're already loading this content
          if (loadingContentIds.has(arweaveId)) return false;
          
          // Skip if we've already tried loading this content too many times
          const attempts = contentLoadAttempts[arweaveId] || 0;
          if (attempts >= MAX_LOAD_ATTEMPTS) {
            console.warn(`Exceeded max load attempts (${MAX_LOAD_ATTEMPTS}) for Arweave ID: ${arweaveId}`);
            return false;
          }
          
          // Skip if we've already loaded this content
          if (loadedContentIds.has(arweaveId)) return false;
          
          return true;
        });
      
      // If we have NFT slots without content, load them
      if (nftSlotsToLoad.length > 0) {
        // Update loading state
        const newLoadingIds = new Set(loadingContentIds);
        const newAttempts = {...contentLoadAttempts};
        
        console.log(`Loading content for ${nftSlotsToLoad.length} NFT slots`);
        
        try {
          // Process each NFT slot one by one with the direct approach
          for (const [slotKey, slot] of nftSlotsToLoad) {
            const nftId = (slot.content as any).Nft;
            const arweaveId = getArweaveId(nftId);
            
            newLoadingIds.add(arweaveId);
            newAttempts[arweaveId] = (newAttempts[arweaveId] || 0) + 1;
            
            try {
              // Use the direct transaction creation approach that works in SlotDetail
              await createDirectNftTransaction(nftId, arweaveId);
              
              // Mark as loaded
              const newLoadedIds = new Set(loadedContentIds);
              newLoadedIds.add(arweaveId);
              setLoadedContentIds(newLoadedIds);
              
              console.log(`Successfully loaded content for NFT: ${nftId} (${arweaveId})`);
            } catch (err) {
              console.error(`Error loading content for NFT: ${nftId}`, err);
            } finally {
              // Remove from loading state
              newLoadingIds.delete(arweaveId);
            }
          }
          
          setLoadingContentIds(newLoadingIds);
          setContentLoadAttempts(newAttempts);
        } catch (error) {
          console.error("Error in batch loading content:", error);
        }
      }
    };
    
    loadContent();
  }, [slots, contentData, dispatch, loadingContentIds, loadedContentIds, contentLoadAttempts, getArweaveId, createDirectNftTransaction]);

  // Update loaded content IDs when contentData changes
  useEffect(() => {
    const newLoadedIds = new Set(loadedContentIds);
    
    Object.keys(contentData).forEach(id => {
      if (contentData[id]) {
        newLoadedIds.add(id);
      }
    });
    
    if (newLoadedIds.size !== loadedContentIds.size) {
      setLoadedContentIds(newLoadedIds);
    }
  }, [contentData, loadedContentIds]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSlotOrder();
    } finally {
      setIsSaving(false);
    }
  };

  // Handle render errors for ContentRenderer
  const handleRenderError = (id: string) => {
    console.error("Error rendering content:", id);
    dispatch(clearTransactionContent(id));
  };

  // Handle drag-drop for edit mode
  const renderDraggableCard = (transaction: Transaction & { slotKey: number; slotData: any }, index: number) => {
    const { slotKey, slotData: slot } = transaction;
    // Directly check for ownership in the render function, not in useMemo
    const isOwned = (() => {
      if (isNftContent(slot.content)) {
        const nftId = (slot.content as any).Nft;
        const arweaveId = getArweaveId(nftId);
        const tokenId = arweaveToNftId[arweaveId];
        return user && tokenId && nfts[tokenId]?.principal === user.principal ? true : false;
      }
      return false;
    })();

    return (
      <div 
        key={`slot-${slotKey}`}
        className="slot-card" 
        draggable={isEditMode}
        onDragStart={isEditMode ? () => handleDragStart(index) : undefined}
        onDragOver={isEditMode ? (e) => handleDragOver(e, index) : undefined}
        onDragEnd={isEditMode ? handleDragEnd : undefined}
        onDrop={isEditMode ? (e) => handleDrop(e, index) : undefined}
      >
        <ContentCard
          onClick={() => {}}
          id={isNftContent(slot.content) ? (slot.content as any).Nft : transaction.id}
          owner={transaction.owner}
          isOwned={isOwned}
          component="Lexigraph"
          predictions={isNftContent(slot.content) ? predictions[(slot.content as any).Nft] : undefined}
        >
          {isEditMode && (
            <div className="absolute top-0 left-0 z-40 bg-black/50 text-white p-1 text-xs">
              Slot #{slotKey}
              <div 
                className="slot-drag-handle ml-2 inline-block text-gray-400 p-1 rounded hover:bg-gray-700 cursor-grab"
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
          
          <div className="w-full h-full">
            {/* NFT Content */}
            {isNftContent(slot.content) && (
              <div className="w-full h-full flex items-center justify-center">
                {(() => {
                  const nftId = (slot.content as any).Nft;
                  const arweaveId = getArweaveId(nftId);
                  const isLoading = loadingContentIds.has(arweaveId);
                  const hasExceededRetries = (contentLoadAttempts[arweaveId] || 0) >= MAX_LOAD_ATTEMPTS;
                  
                  if (contentData[arweaveId]) {
                    return (
                      <ContentRenderer
                        transaction={transactions.find(t => t.id === arweaveId) || {
                          id: arweaveId,
                          owner: transaction.owner || "",
                          tags: [{ name: "Content-Type", value: "text/plain" }],
                          assetUrl: `https://arweave.net/${arweaveId}`
                        }}
                        content={contentData[arweaveId]}
                        contentUrls={contentData[arweaveId]?.urls || {
                          thumbnailUrl: null,
                          coverUrl: null,
                          fullUrl: `https://arweave.net/${arweaveId}`
                        }}
                        handleRenderError={() => handleRenderError(arweaveId)}
                      />
                    );
                  } else if (isLoading) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                        <svg className="animate-spin h-8 w-8 mb-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs text-center">Loading content...</span>
                      </div>
                    );
                  } else if (hasExceededRetries) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2 text-red-500">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span className="text-xs text-center">Failed to load content</span>
                        <span className="text-xs text-center mt-1">{arweaveId.slice(0, 8)}...</span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2">
                          <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <path d="M20.4 14.5 16 10 4 20"></path>
                        </svg>
                        <span className="text-xs text-center">{nftId.slice(0, 8)}...</span>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
            
            {/* Shelf Content */}
            {isShelfContent(slot.content) && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold">Shelf</div>
                  <div className="text-sm text-gray-500">{slot.content.Shelf}</div>
                </div>
              </div>
            )}
            
            {/* Markdown Content */}
            {isMarkdownContent(slot.content) && (
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <div className="p-4 prose dark:prose-invert max-w-none line-clamp-6">
                  {slot.content.Markdown}
                </div>
              </div>
            )}
            
            {/* Fallback for unknown content */}
            {!isNftContent(slot.content) && !isShelfContent(slot.content) && !isMarkdownContent(slot.content) && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">Unknown content</div>
              </div>
            )}
          </div>
        </ContentCard>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="self-start flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        {renderBreadcrumbs(breadcrumbItems)}
      </div>
      
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{shelf.title}</h2>
            <p className="text-muted-foreground">{shelf.description}</p>
            <div className="mt-2 flex items-center gap-2">
              {isPublic && (
                <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                  Public
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Owner: <PrincipalDisplay principal={shelf.owner} />
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditMode && !isPublic && settingsButton}
            
            {!isEditMode && !isPublic && (
              <Button
                variant="outline"
                className="flex items-center gap-1"
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
                  className="flex items-center gap-1"
                  onClick={onCancelEditMode}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                
                <Button
                  variant="primary"
                  className="flex items-center gap-1"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Order'}
                </Button>
              </>
            )}
            
            {!isPublic && onAddSlot && (
              <Button
                variant="primary"
                className="flex items-center gap-1"
                onClick={() => onAddSlot(shelf)}
              >
                <Plus className="w-4 h-4" />
                Add Slot
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          {slots.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              This shelf is empty.
              {!isPublic && onAddSlot && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 mx-auto"
                    onClick={() => onAddSlot(shelf)}
                  >
                    <Plus className="w-4 h-4" />
                    Add First Slot
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <ContentGrid>
              {slotTransactions.map((transaction, index) => (
                renderDraggableCard(transaction, index)
              ))}
            </ContentGrid>
          )}
        </div>
      </div>
    </div>
  );
}; 