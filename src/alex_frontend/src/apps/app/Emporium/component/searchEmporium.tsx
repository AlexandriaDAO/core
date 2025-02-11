import React from 'react';
import styled from 'styled-components';
import { Search as icon } from 'lucide-react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { setSearchEmporium } from '../emporiumSlice';

export const OwnerIcon = styled(icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

export const SearchBox = styled.div`
  display: flex;
  width: 100%;
  max-width: 800px;
  height: 50px;
  padding: 16px 20px;
  align-items: center;
  border-radius: 10px;
  border: 1px solid var(--black-grey-400, #CCC);
  background: var(--Colors-LightMode-Text-text-100, #FFF);

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



const SearchEmporium = () => {
  const dispatch=useAppDispatch();
  const emporium =useAppSelector(state=>state.emporium);
  
  const handleSearchStateChange = (value: string) => {
    dispatch(setSearchEmporium({
      ...emporium.search,
      search:value
    }));
  };

  return (
    <SearchBox>
      <OwnerIcon />
      <Input
        value={emporium.search.search}
        onChange={(e) => handleSearchStateChange(e.target.value)}
        placeholder="Search"
      />
    </SearchBox>
  );
};
export default SearchEmporium;

