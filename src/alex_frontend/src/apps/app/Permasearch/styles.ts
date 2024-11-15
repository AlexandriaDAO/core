import styled from "styled-components";
import { SlidersHorizontal } from "lucide-react";

export const FiltersIcon = styled(SlidersHorizontal)`
  transform: rotate(90deg);
  width: 18px;
  height: var(--Fonts-Size-body, 16px);
  flex-shrink: 0;
`;

export const PageContainer = styled.div`
  max-width: 1440px;
  min-height: 100vh;
  width: 100%;
  margin: 0 auto;
  background: var(--Colors-LightMode-Text-text-100, #FFF);
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

export const ControlsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
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