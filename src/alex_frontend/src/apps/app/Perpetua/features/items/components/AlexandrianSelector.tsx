import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { SearchContainer } from '@/apps/Modules/shared/components/SearchContainer';
import { AlexandrianLibrary } from "@/apps/Modules/LibModules/nftSearch";
import { performSearch, updateSearchParams } from '@/apps/Modules/shared/state/librarySearch/libraryThunks';
import { resetSearch } from '@/apps/Modules/shared/state/librarySearch/librarySlice';
import { toast } from 'sonner';
import { clearNfts } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { clearAllTransactions } from '@/apps/Modules/shared/state/transactions/transactionThunks';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import ContentRenderer from '@/apps/Modules/AppModules/safeRender/ContentRenderer';
import { cn } from "@/lib/utils";
import { Transaction } from '@/apps/Modules/shared/types/queries';

interface AlexandrianSelectorProps {
  onSelect: (nftId: string, collectionType: "NFT" | "SBT") => void;
}

// Create a custom grid component that supports selection
const SelectableGrid: React.FC<{
  onSelect: (transactionId: string) => void;
  selectedTransactionId: string | null;
}> = ({ onSelect, selectedTransactionId }) => {
  const transactions = useSelector((state: RootState) => state.transactions.transactions); 
  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  
  const handleRenderError = useCallback((transactionId: string) => {
    // No need to implement this fully for demonstration
    console.log("Error rendering transaction", transactionId);
  }, []);
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex justify-center items-center p-6 text-muted-foreground">
        No NFTs found. Try searching for NFTs.
      </div>
    );
  }
  
  return (
    <ContentGrid>
      {transactions.map((transaction: Transaction) => {
        const content = contentData ? contentData[transaction.id] : undefined;
        const isSelected = selectedTransactionId === transaction.id;
        
        return (
          <div 
            key={transaction.id}
            className={cn(
              "relative cursor-pointer", 
              isSelected && "after:content-[''] after:absolute after:inset-0 after:border-2 after:border-primary after:rounded-md after:pointer-events-none"
            )}
            onClick={() => onSelect(transaction.id)}
          >
            <ContentGrid.Item 
              id={transaction.id}
              owner={transaction.owner || ""}
            >
              <div className="w-full h-full flex items-center justify-center bg-muted/10">
                {content ? (
                  <ContentRenderer
                    transaction={transaction}
                    content={content}
                    contentUrls={{
                      thumbnailUrl: null,
                      coverUrl: null,
                      fullUrl: transaction?.assetUrl || `https://arweave.net/${transaction.id}`
                    }}
                    handleRenderError={handleRenderError}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                    <span className="text-xs text-center">{transaction.id.slice(0, 8)}...</span>
                  </div>
                )}
              </div>
            </ContentGrid.Item>
          </div>
        );
      })}
    </ContentGrid>
  );
};

const AlexandrianSelector: React.FC<AlexandrianSelectorProps> = ({ onSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { isLoading, searchParams, collection } = useSelector((state: RootState) => state.library);
  const { arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  
  // Local state
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedNumericId, setSelectedNumericId] = useState<string | null>(null);
  
  // Memoize the AlexandrianLibrary component, wrap it to stop click propagation, and ensure high z-index
  const alexandrianLibraryComponent = useMemo(() => (
    <div onClick={(e) => e.stopPropagation()} className="relative z-10">
      <AlexandrianLibrary
        defaultCategory="all"
        defaultPrincipal="self"
        showPrincipalSelector={true}
        showCollectionSelector={true}
        showTagsSelector={true}
      />
    </div>
  ), []);
  
  // Handle search
  const handleSearch = useCallback(async () => {
    try {
      await dispatch(resetSearch());
      await dispatch(performSearch());
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    }
  }, [dispatch]);
  
  // Handle showing more results
  const handleShowMore = useCallback(async () => {
    try {
      const newStart = searchParams.end;
      const newEnd = newStart + searchParams.pageSize;
      await dispatch(updateSearchParams({ start: newStart, end: newEnd }));
      await dispatch(performSearch());
    } catch (error) {
      console.error("Failed to load more results:", error);
      toast.error("Failed to load more results");
    }
  }, [dispatch, searchParams]);
  
  // Handle canceling search
  const handleCancelSearch = useCallback(() => {
    dispatch(resetSearch());
    dispatch(clearNfts());
    dispatch(clearAllTransactions());
    setSelectedTransactionId(null);
    setSelectedNumericId(null);
    toast.info("Search cancelled");
  }, [dispatch]);
  
  // Update selected NFT when a transaction is clicked
  useEffect(() => {
    if (selectedTransactionId) {
      const numericId = arweaveToNftId[selectedTransactionId];
      if (numericId) {
        setSelectedNumericId(numericId);
      } else {
        // If we can't find the numeric ID, clear selection
        setSelectedNumericId(null);
      }
    } else {
      setSelectedNumericId(null);
    }
  }, [selectedTransactionId, arweaveToNftId]);
  
  // Handle transaction selection
  const handleTransactionSelect = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
  }, []);
  
  // Handle final selection confirmation
  const handleConfirmSelection = useCallback(() => {
    if (!selectedNumericId) {
      toast.error("Please select an NFT first");
      return;
    }
    
    onSelect(selectedNumericId, collection as "NFT" | "SBT");
  }, [selectedNumericId, collection, onSelect]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div>
          <SearchContainer
            title="Select NFT"
            description="Search for an NFT to add to your shelf"
            onSearch={handleSearch}
            onShowMore={handleShowMore}
            onCancel={handleCancelSearch}
            isLoading={isLoading}
            filterComponent={alexandrianLibraryComponent}
            showMoreEnabled={true}
            dataSource="transactions"
          />
          
          {/* Custom grid that handles selection */}
          <div className="mt-4">
            <SelectableGrid 
              onSelect={handleTransactionSelect} 
              selectedTransactionId={selectedTransactionId}
            />
          </div>
        </div>
      </div>
      
      {/* Selection confirmation bar */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Selected NFT</p>
            <p className="text-xs text-muted-foreground">
              {selectedNumericId ? `ID: ${selectedNumericId.substring(0, 15)}...` : "No NFT selected"}
            </p>
          </div>
          <Button 
            onClick={handleConfirmSelection}
            disabled={!selectedNumericId}
            className="px-4"
          >
            Select NFT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlexandrianSelector;