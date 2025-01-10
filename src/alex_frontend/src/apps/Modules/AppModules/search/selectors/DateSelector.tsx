import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { Calendar } from '@/lib/components/calendar';
import { CalendarIcon, ShuffleIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/lib/components/popover';
import { Button } from '@/lib/components/button';
import { format, parse, isValid, isFuture } from 'date-fns';

const MIN_DATE = new Date('2019-06-01');
const MAX_DATE = new Date(); // Current date
const DATE_FORMAT = "MM/dd/yyyy HH:mm";

const DateSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);
  
  // Initialize with current timestamp from state or current time
  const [inputValue, setInputValue] = useState(() => {
    const date = searchState.timestamp 
      ? new Date(searchState.timestamp)
      : new Date();
    return format(Math.min(date.getTime(), MAX_DATE.getTime()), DATE_FORMAT);
  });

  const isValidDate = useCallback((date: Date) => {
    if (!date || !isValid(date)) return false;
    
    // Create a new Date object to avoid mutation
    const compareDate = new Date(date);
    
    // Ensure we're comparing dates in UTC
    const minDateUTC = Date.UTC(
      MIN_DATE.getUTCFullYear(),
      MIN_DATE.getUTCMonth(),
      MIN_DATE.getUTCDate()
    );
    const maxDateUTC = Date.UTC(
      MAX_DATE.getUTCFullYear(),
      MAX_DATE.getUTCMonth(),
      MAX_DATE.getUTCDate(),
      23, 59, 59
    );
    const dateUTC = Date.UTC(
      compareDate.getUTCFullYear(),
      compareDate.getUTCMonth(),
      compareDate.getUTCDate(),
      compareDate.getUTCHours(),
      compareDate.getUTCMinutes()
    );

    return dateUTC >= minDateUTC && dateUTC <= maxDateUTC;
  }, []);

  const updateTimestamp = useCallback((date: Date) => {
    if (!isValidDate(date)) {
      console.log('DateSelector - Invalid date:', {
        date,
        isValid: isValid(date),
        dateString: date.toISOString()
      });
      return;
    }

    // Create UTC timestamp ensuring time is preserved
    const timestamp = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      0,
      0
    );

    console.log('DateSelector - Updating timestamp:', {
      inputDate: date.toISOString(),
      timestamp,
      formattedDate: new Date(timestamp).toISOString()
    });

    // Update input value
    setInputValue(format(new Date(timestamp), DATE_FORMAT));
    
    // Update redux state
    dispatch(setSearchState({ timestamp }));
  }, [dispatch, isValidDate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the input value
    try {
      const parsedDate = parse(newValue, DATE_FORMAT, new Date());
      console.log('DateSelector - Parsed input:', {
        input: newValue,
        parsedDate,
        isValid: isValidDate(parsedDate)
      });
      
      if (isValidDate(parsedDate)) {
        updateTimestamp(parsedDate);
      }
    } catch (error) {
      console.debug('Invalid date format');
    }
  }, [updateTimestamp, isValidDate]);

  const handleCalendarSelect = useCallback((date: Date | undefined) => {
    if (!date || !isValidDate(date)) return;
    
    // Preserve the current time when selecting a new date
    const currentTime = searchState.timestamp 
      ? new Date(searchState.timestamp)
      : new Date();

    const newDate = new Date(date);
    newDate.setUTCHours(currentTime.getUTCHours());
    newDate.setUTCMinutes(currentTime.getUTCMinutes());

    if (isValidDate(newDate)) {
      updateTimestamp(newDate);
    }
  }, [searchState.timestamp, updateTimestamp, isValidDate]);

  const generateRandomDateTime = useCallback(() => {
    const randomTimestamp = MIN_DATE.getTime() + 
      Math.random() * (MAX_DATE.getTime() - MIN_DATE.getTime());
    updateTimestamp(new Date(randomTimestamp));
  }, [updateTimestamp]);

  return (
    <div className="flex items-center gap-2 sm:gap-4 w-full p-2 sm:p-[14px] rounded-2xl border border-input bg-background">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={searchState.timestamp ? new Date(searchState.timestamp) : undefined}
            onSelect={handleCalendarSelect}
            disabled={(date) => !isValidDate(date)}
            initialFocus
            className="rounded-md border shadow-md"
          />
        </PopoverContent>
      </Popover>

      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="MM/DD/YYYY HH:mm"
        className="flex-1 bg-transparent border-none outline-none font-['Poppins'] text-sm sm:text-base font-light"
      />

      <Button
        className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-black text-white hover:bg-[#FFEB3B] hover:text-black"
        onClick={generateRandomDateTime}
      >
        <ShuffleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

export default React.memo(DateSelector);
