import styled from "styled-components";
import { SlidersHorizontal } from "lucide-react";
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
  width: 100%;
  @media (max-width: 1399px) {
    max-width: 670px;
  }
  @media (max-width: 768px) {
    max-width: 440px;
  }
  @media (max-width: 640px) {
    padding: 40px 20px 15px;
    gap: 14px;
  }
`;

export const Title = styled.h1`
  color: hsl(var(--foreground));
  text-align: center;
  font-family: Syne;
  font-size: 48px;
  font-weight: 700;
  margin: 0;
`;

export const Description = styled.p`
  color: hsl(var(--foreground));
  text-align: center;
  font-family: Syne;
  font-size: 24px;
  font-weight: 400;
  margin: 0;
`;

export const Hint = styled.p`
  color: hsl(var(--muted-foreground));
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
  margin-bottom: ${(props) => (props.$isOpen ? "24px" : "0")};
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 640px) {
    margin-bottom: 10px;
  }
`;

export const FiltersButton = styled.button<{ $isOpen?: boolean }>`
  display: flex;
  min-width: 120px;
  height: 50px;
  padding: 10px var(--Fonts-Size-h2, 24px);
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: Syne;
  font-size: 16px;

  ${({ $isOpen }) =>
    $isOpen
      ? `
    background: var(--balancebox, #3A3630);
  color: #fff;
    border: none;
    box-shadow: 0px 0px 4px 0px rgba(32, 0, 213, 0.25), 0px 0px 0px 4px rgba(197, 207, 249, 0.35);
  `
      : `
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
  `}
  @media(max-width:1399px) {
    min-width: 100px;
  }
  @media (max-width: 768px) {
    min-width: 90px;
    height: 40px;
  }
`;

export const SearchButton = styled.button`
  display: flex;
  height: 50px;
  padding: 10px 15px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  min-width: 600px;
  border-radius: 10px;
  background: var(--balancebox, #3a3630);
  border: none;
  color: #fff;
  cursor: pointer;
  font-family: Syne;
  font-size: 16px;
  @media (max-width: 1399px) {
    min-width: 400px;
  }
  @media (max-width: 768px) {
    @media (max-width: 1399px) {
      min-width: 230px;
      height: 40px;
    }
  }
`;

export const SearchFormContainer = styled.div<{ $isOpen: boolean }>`
  height: ${(props) => (props.$isOpen ? "auto" : "0")};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  margin: 0;
  padding: ${(props) => (props.$isOpen ? "1rem 0" : "0")};
  width: 100%;
  max-width: 800px;
`;

export const Paginate = styled.div<{ $isOpen?: boolean }>`
  .pagination {
    display: flex;
    list-style: none;
    justify-content: center;
    padding: 0;
  }

  .pagination li {
    margin: 0 5px;
  }

  .pagination li a {
    padding: 8px 12px;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    color: #0F172A
    background:white
    text-decoration: none;
    cursor: pointer;
    @media (max-width: 767px) {
      font-size: 11px;
      padding: 5px 7px;
    }
  }

 

  .pagination .selected a {
    background: #353230;
    color: #fff;
  }
    .dark .pagination .selected a{
      background: white;
      color: #0f172A;
     } 


  .pagination .disabled a {
    color: hsl(var(--muted-foreground));
    cursor: not-allowed;
  }

  .previous a {
    border: none !important;
  }

`;


