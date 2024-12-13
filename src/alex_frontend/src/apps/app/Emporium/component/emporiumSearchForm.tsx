import React from "react";
import styled from 'styled-components';
import EmporiumPageSizeSelector from "./emporiumPageSizeSelector";

const EmporiumSearchFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  padding: 16px 20px;
  gap: 40px;
  align-items: flex-start;
  border-radius: 20px;
  border: 1px solid var(--black-grey-400, #CCC);
  background: var(--white, #FFF);
`;

const EmporiumSearchForm: React.FC = () => {
  return (
    <EmporiumSearchFormContainer>
      <div className="flex justify-between gap-4 w-full">
        <div className="flex flex-col gap-4 w-1/2">
          <div className="flex gap-4 w-full">
            <EmporiumPageSizeSelector />
          </div>
        </div>
      </div>

    </EmporiumSearchFormContainer>
  );
};

export default React.memo(EmporiumSearchForm);
