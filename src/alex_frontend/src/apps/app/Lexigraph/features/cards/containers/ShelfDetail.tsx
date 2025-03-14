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
import { clearTransactionContent, setContentData } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import { useEffect, useState } from "react";
import { natToArweaveId } from '@/utils/id_convert';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { fetchTransactionById } from '@/apps/Modules/LibModules/arweaveSearch/api/directArweaveClient';
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import { Badge } from "@/lib/components/badge";
import { toast } from "sonner";
import { Principal } from '@dfinity/principal';
import { ALEX } from '../../../../../../../../declarations/ALEX';
import { LBRY } from '../../../../../../../../declarations/LBRY';
import { nft_manager } from '../../../../../../../../declarations/nft_manager';
import { updateNftBalances, setNFTs } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { copyToClipboard } from '@/apps/Modules/AppModules/contentGrid/utils/clipboard';
import { Check, Link, Database, Copy, User, Heart } from "lucide-react";
import { getNftOwnerInfo } from '@/apps/Modules/shared/utils/nftOwner';
import { formatPrincipal, formatBalance, convertE8sToToken } from '@/apps/Modules/shared/utils/tokenUtils';
import { createTokenAdapter, determineTokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
// Import SingleTokenView component for direct reuse if needed
import SingleTokenView from '@/apps/Modules/AppModules/blinks/SingleTokenView';

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

// NFT Token Display Component - extracted from SingleTokenView
const NftDisplay = ({ tokenId, onViewDetails, inShelf = false }: { 
  tokenId: string; 
  onViewDetails?: (tokenId: string) => void;
  inShelf?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [contentUrls, setContentUrls] = useState<any>(null);
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);

  // Load NFT data on component mount
  useEffect(() => {
    let mounted = true;

    async function loadNFTData() {
      if (!tokenId) return;

      try {
        setIsLoading(true);
        console.log('Loading NFT data for tokenId:', tokenId);
        
        const tokenType = determineTokenType(tokenId);
        const tokenAdapter = createTokenAdapter(tokenType);
        const nftId = BigInt(tokenId);
        
        let ogId: bigint;
        if (tokenType === 'SBT') {
          ogId = await nft_manager.scion_to_og_id(nftId);
        } else {
          ogId = nftId;
        }
        
        // Get Arweave ID for this token
        const arweaveId = await tokenAdapter.tokenToNFTData(nftId, '').then(data => data.arweaveId);
        console.log('Converted to arweaveId:', arweaveId);
        
        // Fetch transaction data from Arweave
        const txData = await fetchTransactionById(arweaveId);
        console.log('Fetched transaction data:', txData);
        
        if (!txData) {
          console.error('Transaction not found for arweaveId:', arweaveId);
          toast.error('Transaction not found');
          return;
        }
        
        if (mounted) {
          setTransaction(txData);
          
          // Load content and URLs
          const content = await ContentService.loadContent(txData);
          const urls = await ContentService.getContentUrls(txData, content);
          setContentUrls(urls);
          
          // Set content in Redux store
          dispatch(setContentData({ 
            id: txData.id, 
            content: {
              ...content,
              urls
            }
          }));
          
          // Get NFT owner info
          const info = await getNftOwnerInfo(tokenId);
          setOwnerInfo(info);
        }

        // Get balances for this NFT
        const subaccount = await nft_manager.to_nft_subaccount(nftId);
        const balanceParams = {
          owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
          subaccount: [Array.from(subaccount)] as [number[]]
        };

        const [alexBalance, lbryBalance] = await Promise.all([
          ALEX.icrc1_balance_of(balanceParams),
          LBRY.icrc1_balance_of(balanceParams)
        ]);

        if (mounted) {
          const alexTokens = convertE8sToToken(alexBalance);
          const lbryTokens = convertE8sToToken(lbryBalance);

          // Update NFT data in Redux store
          dispatch(setNFTs({
            [tokenId]: {
              collection: tokenType,
              principal: ownerInfo?.principal || '',
              arweaveId: arweaveId,
              balances: { alex: alexTokens, lbry: lbryTokens }
            }
          }));
          
          dispatch(updateNftBalances({
            tokenId,
            alex: alexTokens,
            lbry: lbryTokens,
            collection: tokenType
          }));
        }
      } catch (error) {
        console.error('Failed to load NFT:', error);
        if (mounted) {
          toast.error('Failed to load NFT data');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    
    loadNFTData();
    
    return () => {
      mounted = false;
    };
  }, [tokenId, dispatch]);

  // Error handler for ContentRenderer
  const handleRenderError = (transactionId?: string) => {
    if (transaction) {
      ContentService.clearTransaction(transactionId || transaction.id);
    }
  };

  // Copy handlers
  const handleCopyPrincipal = async (e: React.MouseEvent, principal: string) => {
    e.stopPropagation();
    const copied = await copyToClipboard(principal);
    if (copied) {
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const lbryUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:8080/nft/${tokenId}` 
      : `https://lbry.app/nft/${tokenId}`;
    const copied = await copyToClipboard(lbryUrl);
    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyTokenId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const copied = await copyToClipboard(tokenId);
    if (copied) {
      setCopiedTokenId(true);
      setTimeout(() => setCopiedTokenId(false), 2000);
    }
  };

  if (isLoading || !transaction || !contentUrls) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <svg className="animate-spin h-8 w-8 mb-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs text-center">Loading NFT...</span>
      </div>
    );
  }

  const nftData = nfts[tokenId];
  const content = contentData[transaction.id];
  
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        Content not found
      </div>
    );
  }

  const isOwned = !!(user && nftData?.principal === user.principal);
  const collectionType = nftData?.collection || 'NFT';

  // NFT Footer - now a reusable component
  const NftFooter = () => (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
      <Badge 
        variant="secondary" 
        className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
        onClick={handleCopyLink}
      >
        {copiedLink ? (
          <Check className="h-2.5 w-2.5" />
        ) : (
          <Link className="h-2.5 w-2.5" />
        )}
      </Badge>
      
      {nftData?.principal && (
        <Badge 
          variant="secondary" 
          className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
          onClick={(e) => handleCopyPrincipal(e, nftData.principal)}
        >
          {formatPrincipal(nftData.principal)}
          {copiedPrincipal ? (
            <Check className="h-2.5 w-2.5" />
          ) : (
            <Copy className="h-2.5 w-2.5" />
          )}
        </Badge>
      )}
      
      {ownerInfo?.username && (
        <Badge 
          variant="secondary" 
          className="text-[10px] py-0.5 px-1"
        >
          @{ownerInfo.username}
        </Badge>
      )}
      
      <Badge 
        variant={collectionType === 'NFT' ? 'warning' : 'info'} 
        className="text-[10px] py-0.5 px-1"
      >
        {collectionType}
      </Badge>
      
      <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
        ALEX: {formatBalance(nftData?.balances?.alex?.toString())}
      </Badge>
      
      <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
        LBRY: {formatBalance(nftData?.balances?.lbry?.toString())}
      </Badge>
      
      {/* Token ID badge */}
      <Badge 
        variant="secondary" 
        className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
        onClick={handleCopyTokenId}
        title={`Token ID: ${tokenId}`}
      >
        <Database className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-600 dark:text-gray-400">
          {tokenId.length <= 4 ? tokenId : `${tokenId.slice(0, 2)}...${tokenId.slice(-2)}`}
        </span>
        {copiedTokenId ? (
          <Check className="h-2.5 w-2.5 text-green-500" />
        ) : (
          <Copy className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
        )}
      </Badge>
    </div>
  );

  // Handle click to open modal
  const handleCardClick = () => {
    setShowModal(true);
    // Still call the original handler if provided (for other functionality)
    if (onViewDetails) {
      onViewDetails(tokenId);
    }
  };

  // Render the NFT Card
  return (
    <>
      <ContentCard
        id={transaction.id}
        onClick={handleCardClick}
        owner={transaction.owner}
        isOwned={isOwned}
        component="Lexigraph"
        footer={<NftFooter />}
      >
        <ContentRenderer
          transaction={transaction}
          content={content}
          contentUrls={contentUrls}
          handleRenderError={handleRenderError}
          inModal={false}
        />
      </ContentCard>

      {/* Modal Dialog for viewing NFT - similar to SingleTokenView */}
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Content Viewer</DialogTitle>

          <div className="w-full h-full overflow-y-auto">
            <div className="p-6">
              {content && transaction && (
                <ContentRenderer
                  key={transaction.id}
                  transaction={transaction}
                  content={content}
                  contentUrls={contentUrls}
                  inModal={true}
                  handleRenderError={() => handleRenderError(transaction.id)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Custom content display components for non-NFT content
const ShelfContentDisplay = ({ shelfId, owner, onClick }: { shelfId: string, owner: string, onClick: () => void }) => (
  <ContentCard
    id={`shelf-${shelfId}`}
    onClick={onClick}
    owner={owner}
    component="Lexigraph"
    footer={
      <div className="flex flex-wrap items-center gap-1">
        <Badge variant="secondary" className="text-[10px] py-0.5 px-1">
          Shelf
        </Badge>
        <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
          {shelfId}
        </Badge>
      </div>
    }
  >
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center p-4">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-lg font-semibold">Shelf</div>
        <div className="text-sm text-gray-500">{shelfId}</div>
      </div>
    </div>
  </ContentCard>
);

const MarkdownContentDisplay = ({ content, owner, onClick }: { content: string, owner: string, onClick: () => void }) => {
  const preview = content.substring(0, 30) + (content.length > 30 ? '...' : '');
  
  return (
    <ContentCard
      id={`markdown-${preview}`}
      onClick={onClick}
      owner={owner}
      component="Lexigraph"
      footer={
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="outline" className="text-[10px] py-0.5 px-1">
            Markdown
          </Badge>
          <Badge variant="outline" className="text-[10px] py-0.5 px-1 max-w-[150px] truncate">
            {preview}
          </Badge>
        </div>
      }
    >
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <div className="p-4 prose dark:prose-invert max-w-none line-clamp-6">
          {content}
        </div>
      </div>
    </ContentCard>
  );
};

// Main ShelfDetailUI component
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
  const [isSaving, setIsSaving] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{
    id: string;
    transaction: Transaction | null;
    content: any;
  } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSlotOrder();
    } finally {
      setIsSaving(false);
    }
  };

  // For viewing content in modal
  const handleNftDetails = async (tokenId: string) => {
    // For NFTs, we no longer need to set selectedContent since the modal is handled in NftDisplay
    // We still want to call onViewSlot if provided, for other side effects
    if (onViewSlot) {
      // Find the slot key for this NFT
      const slotEntry = slots.find(([_, slot]) => 
        isNftContent(slot.content) && slot.content.Nft === tokenId
      );
      
      if (slotEntry) {
        onViewSlot(slotEntry[0]);
      }
    }
  };

  // Handle non-NFT content clicks
  const handleContentClick = (slotKey: number) => {
    if (onViewSlot) {
      onViewSlot(slotKey);
      
      // For non-NFT content, we still want to handle modal display here
      // Find the slot for this key
      const slotEntry = slots.find(([key, _]) => key === slotKey);
      
      if (slotEntry && !isNftContent(slotEntry[1].content)) {
        // For now we'll use the existing selectedContent state for markdown content
        if (isMarkdownContent(slotEntry[1].content)) {
          // Create a temporary transaction-like object for markdown content
          const markdownTransaction: Transaction = {
            id: `markdown-${slotKey}`,
            owner: shelf.owner.toString(),
            tags: []  // Required empty array of tags
          };
          
          setSelectedContent({
            id: String(slotKey),
            transaction: markdownTransaction,
            content: {
              type: 'markdown',
              text: slotEntry[1].content.Markdown,
              urls: {} // Provide any URLs needed for rendering
            }
          });
        }
        
        // Add handling for other non-NFT content types as needed
      }
    }
  };

  // Handler for rendering error
  const handleRenderError = (id: string) => {
    console.error("Error rendering content:", id);
    ContentService.clearTransaction(id);
  };

  // Render a card for each slot
  const renderCard = (slotKey: number, slot: any, index: number) => {
    // Wrap the card content in a draggable container if in edit mode
    const renderDraggableWrapper = (content: React.ReactNode) => (
      <div 
        key={`slot-${slotKey}`}
        className="slot-card" 
        draggable={isEditMode}
        onDragStart={isEditMode ? () => handleDragStart(index) : undefined}
        onDragOver={isEditMode ? (e) => handleDragOver(e, index) : undefined}
        onDragEnd={isEditMode ? handleDragEnd : undefined}
        onDrop={isEditMode ? (e) => handleDrop(e, index) : undefined}
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
        {content}
      </div>
    );

    // For NFT content - Use the NftDisplay component
    if (isNftContent(slot.content)) {
      const nftId = slot.content.Nft;
      
      return renderDraggableWrapper(
        <NftDisplay 
          tokenId={nftId} 
          onViewDetails={handleNftDetails}
          inShelf={true}
        />
      );
    }
    
    // For shelf content
    if (isShelfContent(slot.content)) {
      return renderDraggableWrapper(
        <ShelfContentDisplay 
          shelfId={slot.content.Shelf} 
          owner={shelf.owner.toString()}
          onClick={() => handleContentClick(slotKey)}
        />
      );
    }
    
    // For markdown content 
    if (isMarkdownContent(slot.content)) {
      return renderDraggableWrapper(
        <MarkdownContentDisplay 
          content={slot.content.Markdown} 
          owner={shelf.owner.toString()}
          onClick={() => handleContentClick(slotKey)}
        />
      );
    }
    
    // Fallback for unknown content
    return renderDraggableWrapper(
      <ContentCard
        id={`unknown-${slotKey}`}
        onClick={() => handleContentClick(slotKey)}
        owner={shelf.owner.toString()}
        component="Lexigraph"
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

  return (
    <>
      <div className="px-4 pt-4 flex flex-col gap-4 mb-6">
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
      
      <div className="px-4 mx-auto max-w-screen-2xl">
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
                {slots.map(([slotKey, slot], index) => (
                  renderCard(slotKey, slot, index)
                ))}
              </ContentGrid>
            )}
          </div>
        </div>
      </div>
      
      {/* Content dialog for non-NFT content */}
      {selectedContent && (
        <Dialog open={!!selectedContent} onOpenChange={(open) => !open && setSelectedContent(null)}>
          <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
            <DialogTitle className="sr-only">Content Viewer</DialogTitle>
            
            <div className="w-full h-full overflow-y-auto">
              <div className="p-6">
                {selectedContent.content && selectedContent.transaction && (
                  <ContentRenderer
                    key={selectedContent.transaction.id}
                    transaction={selectedContent.transaction}
                    content={selectedContent.content}
                    contentUrls={selectedContent.content.urls || {
                      thumbnailUrl: null,
                      coverUrl: null,
                      fullUrl: `https://arweave.net/${selectedContent.transaction.id}`
                    }}
                    inModal={true}
                    handleRenderError={() => handleRenderError(selectedContent.transaction?.id || '')}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}; 