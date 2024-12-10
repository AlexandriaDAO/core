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
  padding: 16px 20px;
  gap: 40px;
  align-items: flex-start;
  border-radius: 20px;
  border: 1px solid var(--black-grey-400, #CCC);
  background: var(--white, #FFF);
`;

const SearchForm: React.FC = () => {
  return (
    <SearchFormContainer>
      <div className="flex justify-between gap-4 w-full">
        <div className="flex flex-col gap-4 w-1/2">
          <div className="flex gap-4 w-full">
            <AmountSelector />
            <ContentCategorySelector />
          </div>
          <NsfwModelControl />
        </div>
        <ContentTagsSelector />
      </div>
      <DateSelector />
    </SearchFormContainer>
  );
};

export default React.memo(SearchForm);
