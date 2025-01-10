import React from "react";
import NsfwModelControl from './NsfwSelector';
import AmountSelector from './selectors/AmountSelector';
import ContentCategorySelector from './selectors/ContentCategorySelector';
import DateSelector from './selectors/DateSelector';
import ContentTagsSelector from './selectors/ContentTagsSelector';
import styled from 'styled-components';

const SearchFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  padding: 12px;
  gap: 20px;
  align-items: flex-start;
  border-radius: 16px;
  border: 1px solid var(--black-grey-400, #CCC);
  background: var(--white, #FFF);

  @media (min-width: 768px) {
    padding: 16px 20px;
    gap: 40px;
    border-radius: 20px;
  }
`;

const SearchForm: React.FC = () => {
  return (
    <SearchFormContainer>
      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
        <div className="flex flex-col gap-4 w-full sm:w-1/2">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="w-full sm:w-1/2">
              <AmountSelector />
            </div>
            <div className="w-full sm:w-1/2">
              <ContentCategorySelector />
            </div>
          </div>
          <NsfwModelControl />
        </div>
        <div className="w-full sm:w-1/2">
          <ContentTagsSelector />
        </div>
      </div>
      <DateSelector />
    </SearchFormContainer>
  );
};

export default React.memo(SearchForm);
