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
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.$isOpen ? '8px' : '0'};
  position: relative;

  @media (min-width: 768px) {
    gap: 16px;
    margin-bottom: ${props => props.$isOpen ? '12px' : '0'};
  }
`;

export const FiltersButton = styled.button<{ $isOpen?: boolean }>`
  display: flex;
  width: 48px;
  min-width: 48px;
  height: 48px;
  padding: 0;
  justify-content: center;
  align-items: center;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  @media (min-width: 768px) {
    width: 56px;
    min-width: 56px;
    height: 56px;
    border-radius: 28px;
  }
  
  ${({ $isOpen }) => $isOpen ? `
    background: var(--balancebox, #2A2620);
    color: var(--brightyellow);
    border: none;
  ` : `
    background: var(--balancebox, #2A2620);
    color: var(--brightyellow);
    border: none;
    
    &:hover {
      transform: translateY(-1px);
      background: hsl(var(--background));
      color: hsl(var(--foreground));
      border: 1px solid hsl(var(--border));
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
`;

export const SearchButton = styled.button`
  display: flex;
  height: 48px;
  padding: 8px 24px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1;
  border-radius: 24px;
  background: var(--balancebox, #3A3630);
  border: none;
  color: var(--brightyellow);
  cursor: pointer;
  font-family: Syne;
  font-size: 16px;
  box-shadow: 0px 0px 13px 4px rgba(171, 189, 219, 0.54);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (min-width: 768px) {
    height: 56px;
    border-radius: 28px;
    font-size: 18px;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #2A2620;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const SearchFormContainer = styled.div<{ $isOpen: boolean }>`
  height: ${props => props.$isOpen ? 'auto' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  margin: 0;
  padding: ${props => props.$isOpen ? '0.1rem 0 0.5rem 0' : '0'};
  width: 100%;
  max-width: 800px;

  @media (min-width: 768px) {
    padding: ${props => props.$isOpen ? '0.2rem 0 1rem 0' : '0'};
  }
`; 