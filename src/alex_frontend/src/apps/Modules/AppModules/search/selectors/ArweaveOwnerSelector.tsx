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

// Add validation helper
const isValidArweaveAddress = (address: string): boolean => {
  // Remove any whitespace and check if it's a valid Arweave address
  const cleanAddress = address.trim();
  const base64urlRegex = /^[a-zA-Z0-9_-]{43}$/;
  return base64urlRegex.test(cleanAddress);
};

const ArweaveOwnerSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);
  const [isValid, setIsValid] = React.useState(true);

  const handleSearchStateChange = (value: string) => {
    const cleanValue = value.trim();
    
    // Update the store with the cleaned value instead of the original
    dispatch(setSearchState({ ownerFilter: cleanValue }));
    
    // Only validate if there's actual input
    if (cleanValue) {
      setIsValid(isValidArweaveAddress(cleanValue));
    } else {
      setIsValid(true); // Reset validation when input is empty
    }
  };

  // Update the styled Input component to show validation state
  const StyledInput = styled(Input)<{ isValid: boolean }>`
    color: ${props => props.isValid ? 'var(--black-grey-300, #808080)' : '#ff4444'};
  `;

  return (
    <SearchBox>
      <OwnerIcon />
      <StyledInput
        isValid={isValid}
        value={searchState.ownerFilter}
        onChange={(e) => handleSearchStateChange(e.target.value)}
        placeholder="Enter owner address or principal ID"
        title={!isValid ? "Please enter a valid Arweave address (43 characters)" : ""}
      />
    </SearchBox>
  );
};

export default ArweaveOwnerSelector;
