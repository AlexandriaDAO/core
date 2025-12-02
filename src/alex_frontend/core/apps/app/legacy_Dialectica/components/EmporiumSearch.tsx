import React from 'react';
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSearchEmporium } from '@/apps/app/Emporium/emporiumSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/select";
import styled from 'styled-components';

const SearchFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  padding: 12px;
  gap: 20px;
  align-items: flex-start;
  border-radius: 16px;
  border: 1px solid var(--black-grey-400, #CCC);
  background: var(--white, #FFF);

  @media (min-width: 768px) {
    padding: 16px 20px;
    gap: 40px;
    border-radius: 20px;
  }
`;

const EmporiumSearch: React.FC = () => {
  const dispatch = useAppDispatch();
  const emporium = useAppSelector((state) => state.emporium);

  const handleSortChange = (value: string) => {
    dispatch(setSearchEmporium({ ...emporium.search, sort: value }));
  };

  const handlePageSizeChange = (value: string) => {
    dispatch(setSearchEmporium({ ...emporium.search, pageSize: parseInt(value) }));
  };

  return (
    <SearchFormContainer>
      <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
        <div className="flex flex-col gap-4 w-full sm:w-1/2">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="w-full sm:w-1/2">
              <Select
                value={emporium.search.sort}
                onValueChange={handleSortChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="date_asc">Date: Oldest First</SelectItem>
                  <SelectItem value="date_desc">Date: Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-1/2">
              <Select
                value={emporium.search.pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </SearchFormContainer>
  );
};

export default EmporiumSearch; 