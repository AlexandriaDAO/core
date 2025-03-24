import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { performSearch, updateSearchParams, togglePrincipalSelection } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
import { resetSearch } from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import { toast } from 'sonner';
import { Button } from "@/lib/components/button";
import { LoaderPinwheel, RotateCcw, FileImage } from "lucide-react";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { cn } from "@/lib/utils";
import { clearNfts } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { clearAllTransactions } from '@/apps/Modules/shared/state/transactions/transactionThunks';
import { clearTransactionContent } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import ContentRenderer from '@/apps/Modules/AppModules/safeRender/ContentRenderer';
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import { Transaction, Tag } from '@/apps/Modules/shared/types/queries';
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";
import { changeCollection } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';

interface NftSearchDialogProps {
  onSelect: (nftId: string) => void;
}

const NftSearchDialog: React.FC<NftSearchDialogProps> = ({ onSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, searchParams, collection } = useSelector((state: RootState) => state.library);
  const { transactions, contentData } = useSelector((state: RootState) => state.transactions);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedNft, setSelectedNft] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string, assetUrl: string } | null>(null);
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal?.toString());

  // Error handler for search operations
  const handleSearchError = useCallback((error: any, message: string) => {
    console.error(`${message}:`, error);
    toast.error(message);
  }, []);

  // Maintain self principal when searching
  const handleSearch = useCallback(async () => {
    try {
      // Make sure we reset state but keep principal set to 'self' (user's principal)
      await dispatch(resetSearch());
      
      // Ensure principal is set to the user's principal
      if (userPrincipal) {
        await dispatch(togglePrincipalSelection(userPrincipal));
      }
      
      await dispatch(performSearch());
    } catch (error) {
      handleSearchError(error, 'Search failed');
    }
  }, [dispatch, handleSearchError, userPrincipal]);

  const handleShowMore = useCallback(async () => {
    try {
      const newStart = searchParams.end;
      const newEnd = newStart + searchParams.pageSize;
      await dispatch(updateSearchParams({ start: newStart, end: newEnd }));
      
      // Make sure principal is still self when loading more
      if (userPrincipal) {
        await dispatch(togglePrincipalSelection(userPrincipal));
      }
      
      await dispatch(performSearch());
    } catch (error) {
      handleSearchError(error, 'Failed to load more results');
    }
  }, [dispatch, searchParams, handleSearchError, userPrincipal]);

  const handleCancelSearch = useCallback(() => {
    dispatch(resetSearch());
    dispatch(clearNfts());
    dispatch(clearAllTransactions());
    setSelectedNft(null);
    toast.info("Search cancelled");
  }, [dispatch]);

  const handleCollectionChange = (value: string) => {
    if (value === 'NFT' || value === 'SBT') {
      dispatch(changeCollection(value as 'NFT' | 'SBT'));
    }
  };

  const handleNftSelect = (nftId: string, transaction: Transaction) => {
    setSelectedNft(nftId);
    onSelect(nftId);
    
    // Get content type for modal view
    const contentType = transaction.tags.find((tag: Tag) => tag.name === "Content-Type")?.value || "application/octet-stream";
    setSelectedContent({ 
      id: nftId, 
      type: contentType,
      assetUrl: transaction.assetUrl || ""
    });
  };

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelectedContent(null);
    }
  }, []);

  const handleRenderError = useCallback((transactionId: string) => {
    dispatch(clearTransactionContent(transactionId));
  }, [dispatch]);

  return (
    <div className="flex flex-col h-full">
      {/* Simplified search controls in a horizontal layout */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          {/* Collection selector */}
          <ToggleGroup
            type="single"
            value={collection}
            onValueChange={handleCollectionChange}
            className="flex h-9"
          >
            <ToggleGroupItem
              value="NFT"
              variant="outline"
              className="px-3 text-xs font-medium rounded-md"
            >
              NFTs
            </ToggleGroupItem>
            <ToggleGroupItem
              value="SBT"
              variant="outline" 
              className="px-3 text-xs font-medium rounded-md"
            >
              SBTs
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Search/Reset buttons */}
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            scale="sm"
            className="h-9 flex-1"
          >
            {isLoading ? (
              <>
                <LoaderPinwheel className="mr-2 h-3 w-3 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleCancelSearch}
            scale="sm"
            className="h-9 flex-none px-2"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          
          {!isLoading && transactions.length > 0 && (
            <Button 
              variant="outline"
              scale="sm" 
              onClick={handleShowMore} 
              className="h-9"
            >
              Load More
            </Button>
          )}
        </div>
      </div>

      {/* Content grid - takes all remaining space */}
      <div className="flex-1 overflow-auto p-2">
        {transactions.length > 0 ? (
          <ContentGrid>
            {transactions.map((transaction: Transaction) => {
              const nftId = transaction.id;
              const content = contentData[nftId];
              const contentType = transaction.tags.find((tag: Tag) => tag.name === "Content-Type")?.value || "application/octet-stream";
              
              // Check if this NFT is owned by the current user
              const tokenNftId = arweaveToNftId[nftId];
              const nftData = tokenNftId ? nfts[tokenNftId] : undefined;
              const isOwned = user && nftData?.principal === user.principal;
              
              return (
                <div 
                  key={nftId}
                  className={cn(
                    "relative", 
                    selectedNft === nftId && "after:content-[''] after:absolute after:inset-0 after:border-2 after:border-primary after:rounded-md after:pointer-events-none"
                  )}
                >
                  <ContentGrid.Item 
                    id={nftId}
                    owner={transaction.owner}
                    isOwned={isOwned || false}
                    onClick={() => handleNftSelect(nftId, transaction)}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-muted/10">
                      {content ? (
                        <ContentRenderer
                          transaction={transaction}
                          content={content}
                          contentUrls={content?.urls || {
                            thumbnailUrl: null,
                            coverUrl: null,
                            fullUrl: transaction?.assetUrl || `https://arweave.net/${nftId}`
                          }}
                          handleRenderError={handleRenderError}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                          <FileImage className="h-8 w-8 mb-2" />
                          <span className="text-xs text-center">{nftId.slice(0, 8)}...</span>
                        </div>
                      )}
                    </div>
                  </ContentGrid.Item>
                </div>
              );
            })}
          </ContentGrid>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg mb-2">No NFTs found</p>
            <p className="text-sm">Use the search filters above to find NFTs</p>
          </div>
        )}
      </div>

      {/* Content dialog for viewing content in modal */}
      <Dialog open={!!selectedContent} onOpenChange={handleDialogOpenChange}>
        <DialogContent 
          className="w-auto h-auto max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-background"
          closeIcon={selectedContent?.type === "application/epub+zip" ? null : undefined}
        >
          <DialogTitle className="sr-only">
            {selectedContent?.type.split('/')[0].toUpperCase()} Content Viewer
          </DialogTitle>
          
          {selectedContent && contentData[selectedContent.id] && (
            <div className="w-full h-full">
              <ContentRenderer
                key={selectedContent.id}
                transaction={transactions.find((t: Transaction) => t.id === selectedContent.id)!}
                content={contentData[selectedContent.id]}
                contentUrls={contentData[selectedContent.id]?.urls || {
                  thumbnailUrl: null,
                  coverUrl: null,
                  fullUrl: contentData[selectedContent.id]?.url || selectedContent?.assetUrl || `https://arweave.net/${selectedContent.id}`
                }}
                inModal={true}
                handleRenderError={handleRenderError}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NftSearchDialog; 