import React from 'react';
import { useDispatch } from 'react-redux';
import { setSearchEmporium } from '../emporiumSlice';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/select';

const EmporiumPageSizeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const search = useAppSelector((state) => state.emporium.search);

  const handlePageSizeChange = (value: string): void => {
    dispatch(setSearchEmporium({ ...search, pageSize: Number(value) }));
  };

  return (
    <div>
      <span className="block mb-2 text-lg mb-3 font-medium font-['Syne'] text-foreground dark:text-white">
        Results per page
      </span>
      <div className="flex items-center border-input bg-background relative">
        <Select
          value={search.pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-full p-[14px] rounded-2xl">
            <SelectValue placeholder="Select Page" />
          </SelectTrigger>

          <SelectContent>
            {[8, 12, 20, 30, 40, 50].map((value) => (
              <SelectItem
                key={value}
                value={value.toString()}
              >
                {value}
              </SelectItem>
            ))}
          </SelectContent>

        </Select>

        <div className="pointer-events-none absolute right-[14px] hidden">
          <svg className='    
'  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8721 4.25939C15.8721 4.12502 15.8189 3.9875 15.7158 3.88437C15.5096 3.67812 15.1721 3.67812 14.9658 3.88437L7.90645 10.9437L0.950195 3.9875C0.743945 3.78125 0.406446 3.78125 0.200195 3.9875C-0.00605488 4.19375 -0.00605488 4.53125 0.200195 4.7375L7.53145 12.0719C7.7377 12.2781 8.0752 12.2781 8.28145 12.0719L15.7158 4.6375C15.8221 4.53125 15.8721 4.39689 15.8721 4.25939Z" fill="hsl(var(--primary))" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default EmporiumPageSizeSelector;
