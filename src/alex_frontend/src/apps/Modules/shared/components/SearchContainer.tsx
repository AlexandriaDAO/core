import React, { useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { wipe } from '@/apps/Modules/shared/state/wiper';
import Grid, { GridDataSource } from "@/apps/Modules/AppModules/contentGrid/Grid";
import {
  PageContainer,
  ControlsContainer,
  FiltersButton,
  SearchButton,
  FiltersIcon,
  SearchFormContainer,
  Title,
  Description,
  Hint,
} from "../../../app/Permasearch/styles";
import { ArrowUp, LoaderPinwheel, RotateCcw, RotateCw } from "lucide-react";
import { Button } from '@/lib/components/button';

interface SearchContainerProps {
  title: string;
  description?: string;
  hint?: string;
  onSearch: (continueFromTimestamp?: number) => Promise<void> | void;
  onShowMore?: () => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  topComponent?: ReactNode;
  filterComponent?: ReactNode;
  showMoreEnabled?: boolean;
  dataSource?: GridDataSource;
  preserveState?: boolean;
}

export function SearchContainer({
  title,
  description,
  hint,
  onSearch,
  onShowMore,
  onCancel,
  isLoading = false,
  topComponent,
  filterComponent,
  showMoreEnabled = true,
  dataSource,
  preserveState = false
}: SearchContainerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const hasContentRef = useRef(false);
  
  // Select transactions from the appropriate state slice based on dataSource
  const transactions = useSelector((state: RootState) => {
    // Always use the new unified transactions state
    return state.transactions.transactions;
  });
  
  // Track if content has been loaded to prevent wiping it
  if (transactions.length > 0 && !hasContentRef.current) {
    hasContentRef.current = true;
  }

  const handleSearchClick = useCallback(async () => {
    if (!isLoading) {
      await onSearch();
    }
  }, [isLoading, onSearch, dispatch]);

  const handleResetClick = useCallback(() => {
    if (isLoading && onCancel) {
      onCancel();
    } else if (onCancel) {
      onCancel();
    }
  }, [isLoading, onCancel, dispatch]);

  const handleShowMoreClick = useCallback(() => {
    if (!isLoading && onShowMore) {
      onShowMore();
    }
  }, [isLoading, onShowMore]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (
      event.target instanceof HTMLInputElement || 
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (event.key === 'Enter' && !isLoading) {
      handleSearchClick();
    }
  }, [isLoading, handleSearchClick]);

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      
      // Only wipe state on unmount if:
      // 1. preserveState is false (default behavior)
      // 2. AND no content has been loaded
      // This prevents wiping state after assets have loaded
      if (!preserveState && !hasContentRef.current) {
        dispatch(wipe());
      }
    };
  }, [handleKeyPress, preserveState, dispatch]);

  return (
    <>
      <PageContainer>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
        {hint && <Hint>{hint}</Hint>}
        {topComponent}
        <ControlsContainer $isOpen={isFiltersOpen}>
          <FiltersButton 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            $isOpen={isFiltersOpen}
            title="Toggle Filters"
          >
            {isFiltersOpen ? <ArrowUp size={20} /> : <FiltersIcon />}
          </FiltersButton>
          <SearchButton 
            onClick={handleSearchClick}
          >
            {isLoading ? (
              <LoaderPinwheel className="animate-spin" />
            ) : (
              'Search'
            )}
          </SearchButton>
          <FiltersButton 
            onClick={handleResetClick}
            title="Reset Search"
          >
            <RotateCw
              size={20} 
              className={isLoading ? "animate-spin" : "hover:text-gray-600"}
            />
          </FiltersButton>
        </ControlsContainer>
        {filterComponent && (
          <SearchFormContainer $isOpen={isFiltersOpen}>
            {filterComponent}
          </SearchFormContainer>
        )}
      </PageContainer>
      <Grid dataSource={dataSource} />
      {showMoreEnabled && transactions.length > 0 && (
        <div className="flex justify-center mt-6 mb-8">
          <Button
            onClick={handleShowMoreClick}
            disabled={isLoading}
            className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-[#454545] transition-colors"
          >
            {isLoading ? (
              <LoaderPinwheel className="animate-spin mr-2" />
            ) : null}
            Show More
          </Button>
        </div>
      )}
    </>
  );
} 