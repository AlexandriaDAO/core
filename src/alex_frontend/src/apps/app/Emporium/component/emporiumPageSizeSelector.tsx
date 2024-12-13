import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchEmoprium } from '../emporiumSlice';

const EmporiumPageSizeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const search = useSelector((state: RootState) => state.emporium.search);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSearchEmoprium({ ...search, pageSize: e.target.value }));
  };

  return (
    <div>
      <span className="block mb-2 text-lg font-medium font-['Syne'] text-foreground">
        Results per page
      </span>
      <div className="flex items-center p-[14px] rounded-2xl border border-input bg-background relative">
        <select
          value={search.pageSize}
          onChange={handlePageSizeChange}
          className="w-full bg-transparent border-none outline-none text-black font-['Poppins'] text-base font-light appearance-none cursor-pointer"
        >
          {[6, 12, 20, 30, 40, 50].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-[14px]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8721 4.25939C15.8721 4.12502 15.8189 3.9875 15.7158 3.88437C15.5096 3.67812 15.1721 3.67812 14.9658 3.88437L7.90645 10.9437L0.950195 3.9875C0.743945 3.78125 0.406446 3.78125 0.200195 3.9875C-0.00605488 4.19375 -0.00605488 4.53125 0.200195 4.7375L7.53145 12.0719C7.7377 12.2781 8.0752 12.2781 8.28145 12.0719L15.7158 4.6375C15.8221 4.53125 15.8721 4.39689 15.8721 4.25939Z" fill="black" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default EmporiumPageSizeSelector;
