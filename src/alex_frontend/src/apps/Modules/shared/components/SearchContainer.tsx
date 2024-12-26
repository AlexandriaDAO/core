import React, { useState, useEffect, useRef, ReactNode } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { wipe } from '@/apps/Modules/shared/state/wiper';
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";
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
import { ArrowUp, LoaderPinwheel } from "lucide-react";
import { Button } from '@/lib/components/button';

interface SearchContainerProps {
  title: string;
  description?: string;
  hint?: string;
  onSearch: (continueFromTimestamp?: number) => Promise<void> | void;
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
  isLoading = false,
  topComponent,
  filterComponent,
  showMoreEnabled = true
}: SearchContainerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const searchInProgress = useRef(false);

  const handleSearchClick = async () => {
    if (searchInProgress.current) return;
    
    try {
      searchInProgress.current = true;
      console.log('Initial Search clicked');
      await dispatch(wipe());
      await new Promise(resolve => setTimeout(resolve, 100));
      await onSearch();
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      searchInProgress.current = false;
    }
  };

  const handleShowMore = async () => {
    if (searchInProgress.current || transactions.length === 0 || isLoading) return;

    const earliestTransaction = transactions[transactions.length - 1];
    
    if (earliestTransaction?.block?.timestamp) {
      try {
        searchInProgress.current = true;
        await onSearch(earliestTransaction.block.timestamp);
      } catch (error) {
        console.error('Show more error:', error);
      } finally {
        searchInProgress.current = false;
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if target is an input or textarea
      if (
        event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === 'Enter' && !isLoading) {
        handleSearchClick();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [isLoading, handleSearchClick]);

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
          >
            Filters
            {isFiltersOpen ? <ArrowUp size={20} /> : <FiltersIcon />}
          </FiltersButton>
          <SearchButton 
            onClick={handleSearchClick}
            disabled={isLoading}
          >
            {isLoading ? <LoaderPinwheel className="animate-spin" /> : 'Search'}
          </SearchButton>
        </ControlsContainer>
        {filterComponent && (
          <SearchFormContainer $isOpen={isFiltersOpen}>
            {filterComponent}
          </SearchFormContainer>
        )}
      </PageContainer>
      <div ref={contentRef}>
        <ContentDisplay />
        {showMoreEnabled && transactions.length > 0 && (
          <div className="flex justify-center mt-6 mb-8">
            <Button
              onClick={handleShowMore}
              disabled={isLoading}
              className="bg-[#353535] text-white px-8 py-3 rounded-full hover:bg-[#454545] transition-colors"
            >
              {isLoading ? (
                <LoaderPinwheel className="animate-spin mr-2" />
              ) : null}
              Show More
            </Button>
          </div>
        )}
      </div>
    </>
  );
} 