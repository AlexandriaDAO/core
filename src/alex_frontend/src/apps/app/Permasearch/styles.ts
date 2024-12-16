import styled from "styled-components";
import { Search } from "lucide-react";

export const FiltersIcon = styled(Search)`
  width: 20px;
  height: 20px;
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

export const Title = styled.h1`
  color: var(--black-grey-100, #353535);
  text-align: center;
  font-family: Syne;
  font-size: 48px;
  font-weight: 700;
  margin: 0;
`;

export const Description = styled.p`
  color: var(--black-grey-100, #353535);
  text-align: center;
  font-family: Syne;
  font-size: 24px;
  font-weight: 400;
  margin: 0;
`;

export const Hint = styled.p`
  color: var(--black-grey-300, #808080);
  text-align: center;
  font-family: Syne;
  font-size: 18px;
  font-weight: 400;
  margin: 0;
`;

export const ControlsContainer = styled.div<{ $isOpen: boolean }>`
  display: flex;
  width: 100%;
  gap: 16px;
  margin-bottom: ${props => props.$isOpen ? '24px' : '0'};
`;

export const FiltersButton = styled.button<{ $isOpen?: boolean }>`
  display: flex;
  width: 180px;
  height: 60px;
  padding: 10px var(--Fonts-Size-h2, 24px);
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: Syne;
  font-size: 16px;
  
  ${({ $isOpen }) => $isOpen ? `
    background: var(--black-grey-100, #353535);
    color: #F3F3F3;
    border: none;
    box-shadow: 0px 0px 4px 0px rgba(32, 0, 213, 0.25), 0px 0px 0px 4px rgba(197, 207, 249, 0.35);
  ` : `
    background: white;
    color: #353535;
    border: 1px solid #353535;
  `}
`;

export const SearchButton = styled.button`
  display: flex;
  height: 60px;
  padding: 10px 24px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  min-width: 280px;
  border-radius: 30px;
  background: var(--black-grey-100, #353535);
  border: none;
  color: white;
  cursor: pointer;
  font-family: Syne;
  font-size: 16px;
`;

export const SearchFormContainer = styled.div<{ $isOpen: boolean }>`
  height: ${props => props.$isOpen ? 'auto' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  margin: 0;
  padding: ${props => props.$isOpen ? '1rem 0' : '0'};
  width: 100%;
  max-width: 800px;
`; 