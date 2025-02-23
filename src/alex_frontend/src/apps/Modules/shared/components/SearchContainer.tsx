import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { wipe } from '@/apps/Modules/shared/state/wiper';
import Grid from "@/apps/Modules/AppModules/contentGrid/Grid";
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
  showMoreEnabled = true
}: SearchContainerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);

  const handleSearchClick = useCallback(async () => {
    if (!isLoading) {
      await dispatch(wipe());
      await onSearch();
    }
  }, [isLoading, onSearch, dispatch]);

  const handleResetClick = useCallback(() => {
    if (isLoading && onCancel) {
      onCancel();
    } else if (onCancel) {
      onCancel();
      dispatch(wipe());
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
    };
  }, [handleKeyPress]);

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
      <Grid />
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