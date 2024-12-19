import React, { useState, useEffect, useRef, ReactNode } from "react";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
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

interface SearchContainerProps {
  title: string;
  description?: string;
  hint?: string;
  onSearch: () => Promise<void> | void;
  isLoading?: boolean;
  topComponent?: ReactNode;
  filterComponent?: ReactNode;
}

export function SearchContainer({
  title,
  description,
  hint,
  onSearch,
  isLoading = false,
  topComponent,
  filterComponent
}: SearchContainerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSearchClick = async () => {
    await dispatch(wipe());
    onSearch();
  };

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [isLoading]);

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
      </div>
    </>
  );
} 