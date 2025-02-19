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
  padding: 20px 16px;
  gap: 16px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
  border-radius: 16px;

  @media (min-width: 768px) {
    padding: 40px 20px;
    gap: 24px;
    border-radius: 20px;
  }
`;

export const Title = styled.h1`
  color: hsl(var(--foreground));
  text-align: center;
  font-family: Syne;
  font-size: 32px;
  font-weight: 700;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 48px;
  }
`;

export const Description = styled.p`
  color: hsl(var(--foreground));
  text-align: center;
  font-family: Syne;
  font-size: 18px;
  font-weight: 400;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

export const Hint = styled.p`
  color: hsl(var(--muted-foreground));
  text-align: center;
  font-family: Syne;
  font-size: 14px;
  font-weight: 400;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

export const ControlsContainer = styled.div<{ $isOpen: boolean }>`
  display: flex;
  width: 100%;
  gap: 8px;
  flex-direction: column;
  margin-bottom: ${props => props.$isOpen ? '16px' : '0'};

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 16px;
    margin-bottom: ${props => props.$isOpen ? '24px' : '0'};
  }
`;

export const FiltersButton = styled.button<{ $isOpen?: boolean }>`
  display: flex;
  width: 100%;
  height: 50px;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: Syne;
  font-size: 14px;
  
  @media (min-width: 768px) {
    width: 180px;
    height: 60px;
    padding: 10px 24px;
    font-size: 16px;
    border-radius: 30px;
  }
  
  ${({ $isOpen }) => $isOpen ? `
    background: var(--balancebox, #3A3630);
    color: var(--brightyellow);
    border: none;
  ` : `
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
    &:hover {
      background: var(--balancebox, #3A3630);
      color: var(--brightyellow);
    }
  `}
`;

export const SearchButton = styled.button`
  display: flex;
  height: 50px;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  border-radius: 25px;
  background: var(--balancebox, #3A3630);
  border: none;
  color: var(--brightyellow);
  cursor: pointer;
  font-family: Syne;
  font-size: 14px;
  box-shadow: 0px 0px 13px 4px rgba(171, 189, 219, 0.54);
  transition: all 0.3s ease;

  @media (min-width: 768px) {
    height: 60px;
    padding: 10px 24px;
    font-size: 16px;
    flex: 1 0 0;
    min-width: 280px;
    border-radius: 30px;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #2A2620;
  }
`;

export const SearchFormContainer = styled.div<{ $isOpen: boolean }>`
  height: ${props => props.$isOpen ? 'auto' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  margin: 0;
  padding: ${props => props.$isOpen ? '0.5rem 0' : '0'};
  width: 100%;
  max-width: 800px;

  @media (min-width: 768px) {
    padding: ${props => props.$isOpen ? '1rem 0' : '0'};
  }
`; 