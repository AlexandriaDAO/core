import React, { useState } from "react";
import styled from 'styled-components';
import EmporiumPageSizeSelector from "./emporiumPageSizeSelector";
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSearchEmporium } from "../emporiumSlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import PriceSort from "./priceSort";

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
  color: hsl(var(--foreground));
  background: hsl(var(--background));


  
`;

const EmporiumSearchForm: React.FC = () => {
  const dispatch = useAppDispatch();

  const [searchMode, setSearchMode] = useState<"principal" | "token">("token");
  const search = useAppSelector((state) => state.emporium.search);

  const handleSearchStateChange = (value: string) => {
    dispatch(setSearchEmporium({ ...search, type: value }));
  }

  //

  return (
    <EmporiumSearchFormContainer >
      <div className="w-full">
        <div className="flex flex-col gap-4 
        ">
          <div className="flex gap-4 w-full lg:justify-between md:justify-between sm:justify-center xs:justify-center flex-wrap">
            <EmporiumPageSizeSelector />
            <div className="flex flex-col">
              <span className="block mb-3 text-lg font-medium font-['Syne'] text-foreground dark:text-white">
                Search by
              </span>
              <ToggleGroup
                type="single"
                value={searchMode}
                onValueChange={(value) => {
                  if (value) setSearchMode(value as "principal" | "token");
                  handleSearchStateChange(value); // Optionally reset the input value on mode change
                }}
                className="mb-4"
              >

                <ToggleGroupItem className="!w-full !py-2 !px-3 !border !rounded-xl data-[state=on]:bg-white data-[state=on]:text-black" value="principal" aria-label="Search by Principal ID">
                  Principal
                </ToggleGroupItem>
                <ToggleGroupItem className="h-5 w-full rounded-xl p-[17px_13px] w-full max-w-full border border-solid data-[state=on]:bg-white data-[state=on]:text-black" value="token" aria-label="Search by Token ID">
                  Token ID
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <PriceSort />
          </div>
        </div>
      </div>

    </EmporiumSearchFormContainer>
  );
};

export default React.memo(EmporiumSearchForm);
