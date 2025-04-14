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

const AlexandrianSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { isLoading, searchParams } = useSelector((state: RootState) => state.library);
  
  // Memoize the AlexandrianLibrary component
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
    toast.info("Search cancelled");
  }, [dispatch]);
  
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
        </div>
      </div>
    </div>
  );
};

export default AlexandrianSelector;