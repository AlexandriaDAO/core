import React from "react";
import NsfwModelControl from './NsfwSelector';
import AmountSelector from './selectors/AmountSelector';
import ContentCategorySelector from './selectors/ContentCategorySelector';
import DateSelector from './selectors/DateSelector';
import ArweaveOwnerSelector from './selectors/ArweaveOwnerSelector';
import ContentTagsSelector from './selectors/ContentTagsSelector';
import styled from 'styled-components';

const SearchFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 440px;
  padding: 24px;
  gap: 24px;
  border-radius: 20px;
  border: 1px solid #CCC;
  background: white;
`;

const SearchForm: React.FC = () => {
  return (
    <SearchFormContainer>
      <ArweaveOwnerSelector />
      <AmountSelector />
      <DateSelector />
      <ContentCategorySelector />
      <ContentTagsSelector />
      <NsfwModelControl />
    </SearchFormContainer>
  );
};

export default React.memo(SearchForm);
