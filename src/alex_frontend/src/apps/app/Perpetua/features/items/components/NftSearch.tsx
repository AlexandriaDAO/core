import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { performSearch, updateSearchParams, togglePrincipalSelection, changeCollection } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
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

interface NftSearchDialogProps {
  onSelect: (nftId: string, collectionType: 'NFT' | 'SBT') => void;
}

const NftSearchDialog: React.FC<NftSearchDialogProps> = ({ onSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, searchParams, collection } = useSelector((state: RootState) => state.library);
  const { transactions, contentData } = useSelector((state: RootState) => state.transactions);
  const { arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal?.toString());
  
  const [selectedNft, setSelectedNft] = useState<string | null>(null);
  const [selectedNumericId, setSelectedNumericId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string, assetUrl: string } | null>(null);

  // Search handler - Maintains user principal during search
  const handleSearch = useCallback(async () => {
    try {
      await dispatch(resetSearch());
      if (userPrincipal) {
        await dispatch(togglePrincipalSelection(userPrincipal));
      }
      await dispatch(performSearch());
    } catch (error) {
      toast.error('Search failed');
    }
  }, [dispatch, userPrincipal]);

  // Handle showing more results
  const handleShowMore = useCallback(async () => {
    try {
      const newStart = searchParams.end;
      const newEnd = newStart + searchParams.pageSize;
      await dispatch(updateSearchParams({ start: newStart, end: newEnd }));
      
      if (userPrincipal) {
        await dispatch(togglePrincipalSelection(userPrincipal));
      }
      
      await dispatch(performSearch());
    } catch (error) {
      toast.error('Failed to load more results');
    }
  }, [dispatch, searchParams, userPrincipal]);

  // Reset search state
  const handleCancelSearch = useCallback(() => {
    dispatch(resetSearch());
    dispatch(clearNfts());
    dispatch(clearAllTransactions());
    setSelectedNft(null);
    setSelectedNumericId(null);
    toast.info("Search cancelled");
  }, [dispatch]);

  // Handle collection type changes (NFT or SBT)
  const handleCollectionChange = useCallback((value: string) => {
    if (value === 'NFT' || value === 'SBT') {
      dispatch(changeCollection(value as 'NFT' | 'SBT'));
    }
  }, [dispatch]);

  // Select an NFT from the results
  const handleNftSelect = useCallback((arweaveId: string, transaction: Transaction) => {
    const numericNftId = arweaveToNftId[arweaveId];
    
    if (!numericNftId) {
      toast.error("Cannot find numeric NFT ID for this asset");
      return;
    }
    
    setSelectedNft(arweaveId);
    setSelectedNumericId(numericNftId);
    
    const contentType = transaction.tags.find((tag: Tag) => 
      tag.name === "Content-Type")?.value || "application/octet-stream";
    
    setSelectedContent({ 
      id: arweaveId, 
      type: contentType,
      assetUrl: transaction.assetUrl || ""
    });
  }, [arweaveToNftId]);

  // Complete the selection of an NFT
  const handleAddNft = useCallback(() => {
    if (!selectedNumericId) {
      toast.error("Please select an NFT first");
      return;
    }
    
    onSelect(selectedNumericId, collection as 'NFT' | 'SBT');
    toast.success("NFT selected");
  }, [selectedNumericId, collection, onSelect]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedContent(null);
  }, []);

  const handleRenderError = useCallback((transactionId: string) => {
    dispatch(clearTransactionContent(transactionId));
  }, [dispatch]);

  return (
    <div className="flex flex-col h-full">
      {/* Search controls */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={collection}
            onValueChange={handleCollectionChange}
            className="flex h-9"
          >
            <ToggleGroupItem value="NFT" variant="outline" className="px-3 text-xs font-medium">NFTs</ToggleGroupItem>
            <ToggleGroupItem value="SBT" variant="outline" className="px-3 text-xs font-medium">SBTs</ToggleGroupItem>
          </ToggleGroup>

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
            ) : "Search"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleCancelSearch}
            scale="sm"
            className="h-9 w-9 p-0"
            aria-label="Reset search"
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

      {/* Results grid */}
      <div className="flex-1 overflow-auto p-2">
        {transactions.length > 0 ? (
          <ContentGrid>
            {transactions.map((transaction) => {
              const arweaveId = transaction.id;
              const isSelected = selectedNft === arweaveId;
              const content = contentData[arweaveId];
              
              return (
                <div 
                  key={arweaveId}
                  className={cn(
                    "relative", 
                    isSelected && "after:content-[''] after:absolute after:inset-0 after:border-2 after:border-primary after:rounded-md after:pointer-events-none"
                  )}
                >
                  <ContentGrid.Item 
                    id={arweaveId}
                    owner={transaction.owner}
                    onClick={() => handleNftSelect(arweaveId, transaction)}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-muted/10">
                      {content ? (
                        <ContentRenderer
                          transaction={transaction}
                          content={content}
                          contentUrls={content?.urls || {
                            thumbnailUrl: null,
                            coverUrl: null,
                            fullUrl: transaction?.assetUrl || `https://arweave.net/${arweaveId}`
                          }}
                          handleRenderError={handleRenderError}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                          <FileImage className="h-8 w-8 mb-2" />
                          <span className="text-xs text-center">{arweaveId.slice(0, 8)}...</span>
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

      {/* Selection footer */}
      {selectedNft && (
        <div className="p-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Selected NFT</p>
              <p className="text-xs text-muted-foreground">ID: {selectedNumericId?.substring(0, 15)}...</p>
            </div>
            <Button 
              onClick={handleAddNft}
              className="px-4"
            >
              Select NFT
            </Button>
          </div>
        </div>
      )}

      {/* Content preview dialog */}
      <Dialog open={!!selectedContent} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-auto h-auto max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-background">
          <DialogTitle className="sr-only">Content Viewer</DialogTitle>
          
          {selectedContent && contentData[selectedContent.id] && (
            <ContentRenderer
              key={selectedContent.id}
              transaction={transactions.find(t => t.id === selectedContent.id)!}
              content={contentData[selectedContent.id]}
              contentUrls={contentData[selectedContent.id]?.urls || {
                thumbnailUrl: null,
                coverUrl: null,
                fullUrl: contentData[selectedContent.id]?.url || selectedContent.assetUrl || `https://arweave.net/${selectedContent.id}`
              }}
              inModal={true}
              handleRenderError={handleRenderError}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NftSearchDialog; 