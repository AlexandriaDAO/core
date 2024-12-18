import styled from "styled-components";
import { SlidersHorizontal } from "lucide-react";

export const FiltersIcon = styled(SlidersHorizontal)`
  transform: rotate(90deg);
  width: 18px;
  height: var(--Fonts-Size-body, 16px);
  flex-shrink: 0;
`;

export const PageContainer = styled.div`
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  background: var(--Colors-LightMode-Text-text-100, #fff);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
`;

export const Title = styled.h1`
  width: 100%;
  max-width: 1328px;
  color: var(--Colors-LightMode-Text-text-500, #000);
  text-align: center;
  font-family: Syne;
  font-size: 54px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-bottom: 24px;
`;

export const Description = styled.p`
  color: var(--Colors-LightMode-Text-text-500, #000);
  text-align: center;
  font-family: Poppins;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  margin-bottom: 16px;
`;

export const Hint = styled(Description)`
  font-weight: 700;
  margin-bottom: 32px;
`;

export const ControlsContainer = styled.div<{ $isOpen?: boolean }>`
  display: flex;
  gap: 1rem;
  margin-bottom: ${(props) => (props.$isOpen ? "1rem" : "0")};
  width: 100%;
  max-width: 800px;
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

  ${({ $isOpen }) =>
    $isOpen
      ? `
    background: var(--black-grey-100, #353535);
    color: #F3F3F3;
    border: none;
    box-shadow: 0px 0px 4px 0px rgba(32, 0, 213, 0.25), 0px 0px 0px 4px rgba(197, 207, 249, 0.35);
  `
      : `
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
    border: 1px solid #000000;
    border-radius: 8px;
    color: #000000;
    text-decoration: none;
    cursor: pointer;
  }

  .pagination li a:hover {
    background-color: #000000;
    color: #ffffff;
  }

  .pagination .selected a {
    background-color: #000000;
    color: white;
    border-color: #000000;
  }

  .pagination .disabled a {
    color:rgba(0, 0, 0, 0.35);
    cursor: not-allowed;
  }
    .previous a {
      border: none !importatn;
    }
`;

