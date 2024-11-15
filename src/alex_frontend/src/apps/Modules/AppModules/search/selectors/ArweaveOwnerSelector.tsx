import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import styled from 'styled-components';
import { Search } from 'lucide-react';

export const OwnerIcon = styled(Search)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

export const SearchBox = styled.div`
  display: flex;
  width: 100%;
  max-width: 800px;
  height: 60px;
  padding: 16px 20px;
  align-items: center;
  border-radius: 30px;
  border: 1px solid var(--black-grey-400, #CCC);
  background: var(--Colors-LightMode-Text-text-100, #FFF);
  margin-bottom: 24px;
`;

export const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  color: var(--black-grey-300, #808080);
  font-family: Syne;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  &::placeholder {
    color: var(--black-grey-300, #808080);
  }
`;

const ArweaveOwnerSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);

  const handleSearchStateChange = (value: string) => {
    dispatch(setSearchState({ ownerFilter: value }));
  };

  return (
    <SearchBox>
      <OwnerIcon />
      <Input
        value={searchState.ownerFilter}
        onChange={(e) => handleSearchStateChange(e.target.value)}
        placeholder="Enter owner address or principal ID"
      />
    </SearchBox>
  );
};

export default ArweaveOwnerSelector;
