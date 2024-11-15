import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { Calendar } from '@/lib/components/calendar';
import { CalendarIcon } from 'lucide-react';

const DateSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleDateTimeChange = (type: 'date' | 'time', value: string) => {
    dispatch(setSearchState({ [type === 'date' ? 'filterDate' : 'filterTime']: value }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateRandomDate = () => {
    const start = new Date('2019-06-01').getTime();
    const end = Date.now();
    const randomDate = new Date(start + Math.random() * (end - start));
    return randomDate.toISOString().split('T')[0];
  };

  const generateRandomTime = () => {
    const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const ShuffleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="ph:shuffle-light">
      <path id="Vector" d="M18.4562 14.0437C18.544 14.1316 18.5933 14.2508 18.5933 14.375C18.5933 14.4992 18.544 14.6184 18.4562 14.7062L16.5812 16.5812C16.4924 16.664 16.3749 16.7091 16.2534 16.707C16.132 16.7048 16.0161 16.6556 15.9302 16.5698C15.8444 16.4839 15.7952 16.368 15.793 16.2466C15.7909 16.1251 15.8359 16.0076 15.9187 15.9187L16.9937 14.8437H15.6984C14.8276 14.8432 13.9695 14.6353 13.1951 14.2371C12.4207 13.8388 11.7523 13.2619 11.2453 12.5539L7.98672 7.9914C7.56722 7.40526 7.01418 6.92743 6.37336 6.59744C5.73254 6.26745 5.02236 6.09479 4.30156 6.09375H2.5C2.37568 6.09375 2.25645 6.04436 2.16854 5.95645C2.08064 5.86854 2.03125 5.74932 2.03125 5.625C2.03125 5.50068 2.08064 5.38145 2.16854 5.29354C2.25645 5.20563 2.37568 5.15625 2.5 5.15625H4.30156C5.17235 5.15676 6.03048 5.36473 6.80489 5.76294C7.57929 6.16114 8.24768 6.73812 8.75469 7.44609L12.0133 12.0086C12.4328 12.5947 12.9858 13.0726 13.6266 13.4025C14.2675 13.7325 14.9776 13.9052 15.6984 13.9062H16.9937L15.9187 12.8312C15.8359 12.7424 15.7909 12.6249 15.793 12.5034C15.7952 12.382 15.8444 12.2661 15.9302 12.1802C16.0161 12.0943 16.132 12.0452 16.2534 12.043C16.3749 12.0409 16.4924 12.0859 16.5812 12.1687L18.4562 14.0437ZM11.2641 8.23046C11.3431 8.28768 11.4383 8.31832 11.5359 8.31796C11.6106 8.31808 11.6843 8.30035 11.7507 8.26624C11.8172 8.23213 11.8745 8.18263 11.918 8.12187L12.0109 7.9914C12.4307 7.40494 12.9841 6.92691 13.6253 6.59691C14.2666 6.2669 14.9772 6.09442 15.6984 6.09375H16.9937L15.9187 7.16875C15.8727 7.21166 15.8358 7.26341 15.8101 7.32091C15.7845 7.37841 15.7707 7.44048 15.7696 7.50342C15.7685 7.56636 15.7801 7.62888 15.8037 7.68724C15.8272 7.74561 15.8623 7.79863 15.9068 7.84314C15.9514 7.88766 16.0044 7.92275 16.0628 7.94632C16.1211 7.9699 16.1836 7.98148 16.2466 7.98037C16.3095 7.97925 16.3716 7.96548 16.4291 7.93986C16.4866 7.91424 16.5383 7.8773 16.5812 7.83124L18.4562 5.95625C18.544 5.86835 18.5933 5.74921 18.5933 5.625C18.5933 5.50078 18.544 5.38164 18.4562 5.29375L16.5812 3.41875C16.4924 3.33595 16.3749 3.29087 16.2534 3.29301C16.132 3.29515 16.0161 3.34435 15.9302 3.43023C15.8444 3.51611 15.7952 3.63198 15.793 3.75342C15.7909 3.87486 15.8359 3.99239 15.9187 4.08125L16.9937 5.15625H15.6984C14.8276 5.15676 13.9695 5.36473 13.1951 5.76294C12.4207 6.16114 11.7523 6.73812 11.2453 7.44609L11.1547 7.57812C11.083 7.67922 11.0542 7.80462 11.0747 7.92687C11.0952 8.04913 11.1633 8.15829 11.2641 8.23046ZM8.73594 11.7695C8.63482 11.6972 8.50912 11.668 8.3865 11.6884C8.26387 11.7088 8.15435 11.777 8.08203 11.8781L7.98906 12.0086C7.56933 12.5951 7.01592 13.0731 6.37466 13.4031C5.7334 13.7331 5.02275 13.9056 4.30156 13.9062H2.5C2.37568 13.9062 2.25645 13.9556 2.16854 14.0435C2.08064 14.1314 2.03125 14.2507 2.03125 14.375C2.03125 14.4993 2.08064 14.6185 2.16854 14.7065C2.25645 14.7944 2.37568 14.8437 2.5 14.8437H4.30156C5.17235 14.8432 6.03048 14.6353 6.80489 14.2371C7.57929 13.8388 8.24768 13.2619 8.75469 12.5539L8.84766 12.4234C8.8833 12.3732 8.90868 12.3164 8.92236 12.2563C8.93604 12.1962 8.93774 12.1341 8.92736 12.0733C8.91698 12.0126 8.89474 11.9545 8.86189 11.9024C8.82904 11.8502 8.78624 11.8051 8.73594 11.7695Z" fill="black"/>
      </g>
    </svg>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <span className="text-[#000] font-['Syne'] text-[20px] font-medium">
        Date & Time
      </span>
      
      <div className="grid grid-cols-2 gap-2 w-full">
        {/* Date Selector */}
        <div className="relative" ref={calendarRef}>
          <div className="flex h-[50px] px-3 items-center rounded-[30px] border border-[#F3F3F3] bg-white w-full">
            <input
              type="text"
              value={searchState.filterDate ? formatDate(searchState.filterDate) : ''}
              readOnly
              className="min-w-0 flex-1 text-black font-['Poppins'] text-base font-light bg-transparent border-none outline-none cursor-pointer"
            />
            <button
              onClick={() => setShowCalendar(true)}
              className="mr-2 w-5 h-5 flex-shrink-0 flex items-center justify-center"
              type="button"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDateTimeChange('date', generateRandomDate());
              }}
              className="w-5 h-5 flex-shrink-0 flex items-center justify-center"
              type="button"
            >
              <ShuffleIcon />
            </button>
          </div>
          {showCalendar && (
            <div className="absolute top-[52px] left-0 mt-2 z-50">
              <Calendar
                mode="single"
                selected={searchState.filterDate ? new Date(searchState.filterDate) : undefined}
                defaultMonth={searchState.filterDate ? new Date(searchState.filterDate) : new Date()}
                onSelect={(date) => {
                  if (date) {
                    handleDateTimeChange('date', date.toISOString().split('T')[0]);
                    setShowCalendar(false);
                  }
                }}
                initialFocus
              />
            </div>
          )}
        </div>

        {/* Time Selector */}
        <div>
          <div className="flex h-[50px] px-3 items-center rounded-[30px] border border-[#F3F3F3] bg-white w-full">
            <input
              type="time"
              value={searchState.filterTime}
              onChange={(e) => handleDateTimeChange('time', e.target.value)}
              className="min-w-0 flex-1 text-black font-['Poppins'] text-base font-light bg-transparent border-none outline-none"
            />
            <button
              onClick={() => handleDateTimeChange('time', generateRandomTime())}
              className="ml-2 w-5 h-5 flex-shrink-0 flex items-center justify-center"
              type="button"
            >
              <ShuffleIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelector;
