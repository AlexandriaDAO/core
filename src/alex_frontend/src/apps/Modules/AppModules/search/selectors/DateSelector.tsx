import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { ScrollArea } from '@/lib/components/scroll-area';
import { format, parse, isValid } from 'date-fns';
import { cn } from "@/lib/utils";

// Types
interface TimeSelectionOptions {
  hours: number[];
  minutes: number[];
  ampm: string[];
}

interface DateTimeValidation {
  isValid: boolean;
  value: string;
}

interface TimeInputProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

// Constants
const DATE_FORMAT = "MM/dd/yyyy";
const TIME_FORMAT = "hh:mm aa";
const MIN_DATE = new Date('2019-06-01');
const MAX_DATE = new Date();

const TIME_OPTIONS: TimeSelectionOptions = {
  hours: Array.from({ length: 12 }, (_, i) => i + 1),
  minutes: Array.from({ length: 60 }, (_, i) => i),
  ampm: ["AM", "PM"]
};

// Utility functions
const validateAndFormatDate = (input: string): DateTimeValidation => {
  const cleaned = input.replace(/\D/g, '');
  let formatted = cleaned;
  
  if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  if (cleaned.length > 4) formatted = `${formatted.slice(0, 5)}/${cleaned.slice(4, 8)}`;
  
  try {
    const date = parse(formatted, DATE_FORMAT, new Date());
    return {
      isValid: isValid(date) && date >= MIN_DATE && date <= MAX_DATE,
      value: formatted
    };
  } catch {
    return { isValid: false, value: formatted };
  }
};

const createUTCDate = (date: Date): Date => {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    0,
    0
  ));
};

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, className }) => {
  const [time, setTime] = useState(() => ({
    hour: (value.getUTCHours() % 12 || 12).toString(),
    minutes: value.getUTCMinutes().toString().padStart(2, '0'),
    period: value.getUTCHours() >= 12 ? 'PM' : 'AM'
  }));

  const updateTime = useCallback((newTime: typeof time) => {
    const newDate = new Date(value);
    
    let hours = parseInt(newTime.hour);
    if (newTime.period === 'PM' && hours !== 12) hours += 12;
    if (newTime.period === 'AM' && hours === 12) hours = 0;
    
    newDate.setHours(hours);
    newDate.setMinutes(parseInt(newTime.minutes));
    
    onChange(newDate);
  }, [value, onChange]);

  // Update handlers to work directly with input values
  const onHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTime = { ...time, hour: e.target.value };
    setTime(newTime);
    updateTime(newTime);
  };

  const onMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTime = { ...time, minutes: e.target.value };
    setTime(newTime);
    updateTime(newTime);
  };

  const onPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTime = { ...time, period: e.target.value as 'AM' | 'PM' };
    setTime(newTime);
    updateTime(newTime);
  };

  // Only update local state when value prop changes significantly
  useEffect(() => {
    const newHour = (value.getUTCHours() % 12 || 12).toString();
    const newMinutes = value.getUTCMinutes().toString().padStart(2, '0');
    const newPeriod = value.getUTCHours() >= 12 ? 'PM' : 'AM';

    if (
      newHour !== time.hour ||
      newMinutes !== time.minutes ||
      newPeriod !== time.period
    ) {
      setTime({
        hour: newHour,
        minutes: newMinutes,
        period: newPeriod
      });
    }
  }, [value]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <select 
        value={time.hour}
        onChange={onHourChange}
        className="bg-transparent border-none outline-none cursor-pointer"
      >
        {TIME_OPTIONS.hours.map(hour => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <span>:</span>
      <select
        value={time.minutes}
        onChange={onMinuteChange}
        className="bg-transparent border-none outline-none cursor-pointer"
      >
        {TIME_OPTIONS.minutes.map(minute => (
          <option key={minute} value={minute.toString().padStart(2, '0')}>
            {minute.toString().padStart(2, '0')}
          </option>
        ))}
      </select>
      <select
        value={time.period}
        onChange={onPeriodChange}
        className="bg-transparent border-none outline-none cursor-pointer"
      >
        {TIME_OPTIONS.ampm.map(period => (
          <option key={period} value={period}>{period}</option>
        ))}
      </select>
    </div>
  );
};

const DateSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);
  
  // Initialize with UTC date
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (searchState.filterDate && searchState.filterTime) {
      const date = new Date(`${searchState.filterDate}T${searchState.filterTime}Z`);
      return isValid(date) ? date : new Date();
    }
    return new Date();
  });

  const [isOpen, setIsOpen] = useState(false);
  const [dateInputValue, setDateInputValue] = useState(() => 
    format(selectedDate, DATE_FORMAT)
  );

  const handleDateTimeChange = useCallback((date: Date, allowDateChange: boolean = false) => {
    if (!isValid(date)) return;
    
    // If allowDateChange is true, use the full date, otherwise only update time
    const newDate = allowDateChange ? new Date(date) : new Date(selectedDate);
    if (!allowDateChange) {
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
    }
    
    setSelectedDate(newDate);
    setDateInputValue(format(newDate, DATE_FORMAT));
    
    dispatch(setSearchState({
      filterDate: newDate.toISOString().split('T')[0],
      filterTime: `${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}`
    }));
  }, [dispatch, selectedDate]);

  const handleDateInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow typing by replacing any non-digit with empty string and adding slashes
    const cleaned = input.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    if (cleaned.length > 4) formatted = `${formatted.slice(0, 5)}/${cleaned.slice(4, 8)}`;
    
    setDateInputValue(formatted);
    
    // Only try to parse and update if we have a complete date
    if (cleaned.length === 8) {
      const month = parseInt(cleaned.slice(0, 2));
      const day = parseInt(cleaned.slice(2, 4));
      const year = parseInt(cleaned.slice(4, 8));
      
      const newDate = new Date(selectedDate);
      newDate.setFullYear(year);
      newDate.setMonth(month - 1);
      newDate.setDate(day);
      
      if (isValid(newDate)) {
        // Pass true to allow date changes when typing
        handleDateTimeChange(newDate, true);
      }
    }
  }, [selectedDate, handleDateTimeChange]);

  const generateRandomDateTime = useCallback(() => {
    const randomDate = new Date(
      MIN_DATE.getTime() + Math.random() * (MAX_DATE.getTime() - MIN_DATE.getTime())
    );
    
    // Set random minutes
    const randomMinutes = Math.floor(Math.random() * 60);
    randomDate.setMinutes(randomMinutes);
    
    // Pass true to allow date change for randomizer
    handleDateTimeChange(randomDate, true);
  }, [handleDateTimeChange]);

  const getButtonVariant = useCallback((isSelected: boolean) => 
    isSelected ? "primary" : "ghost"
  , []);

  const handleCalendarSelect = useCallback((date: Date | undefined) => {
    if (date) {
      // Preserve the existing time when selecting a new date
      const newDate = new Date(date);
      newDate.setUTCHours(selectedDate.getUTCHours());
      newDate.setUTCMinutes(selectedDate.getUTCMinutes());
      handleDateTimeChange(newDate);
    }
    setIsOpen(false);
  }, [selectedDate, handleDateTimeChange]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between gap-4">
        {/* Date Input Section */}
        <div className="flex-1">
          <span className="block mb-2 text-lg font-medium font-['Syne'] text-foreground">
            Select Date (UTC)
          </span>
          <div className="flex items-center p-[14px] rounded-2xl border border-input bg-background">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 mr-2"
                  onClick={() => setIsOpen(true)}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                    onSelect={handleCalendarSelect}
                    initialFocus
                  />
                  <div className="flex flex-col h-[300px] divide-y border-l">
                    <ScrollArea className="w-[110px]">
                      <div className="flex flex-col p-2">
                        {TIME_OPTIONS.hours.map((hour) => (
                          <Button
                            key={hour}
                            variant={getButtonVariant(
                              selectedDate ? (selectedDate.getHours() % 12 || 12) === hour : false
                            )}
                            className="w-full"
                            onClick={() => {
                              const currentMinutes = selectedDate.getMinutes();
                              const currentAmPm = selectedDate.getHours() >= 12 ? "PM" : "AM";
                              const hours = hour % 12 + (currentAmPm === "PM" ? 12 : 0);
                              const newDate = new Date(selectedDate);
                              newDate.setHours(hours);
                              handleDateTimeChange(newDate);
                            }}
                          >
                            {hour}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                    <ScrollArea className="w-[110px]">
                      <div className="flex flex-col p-2">
                        {TIME_OPTIONS.minutes.map((minute) => (
                          <Button
                            key={minute}
                            variant={getButtonVariant(
                              selectedDate ? selectedDate.getMinutes() === minute : false
                            )}
                            className="w-full"
                            onClick={() => {
                              const newDate = new Date(selectedDate);
                              newDate.setMinutes(minute);
                              handleDateTimeChange(newDate);
                            }}
                          >
                            {minute.toString().padStart(2, '0')}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-2">
                      {TIME_OPTIONS.ampm.map((ampm) => (
                        <Button
                          key={ampm}
                          variant={getButtonVariant(
                            selectedDate
                              ? (ampm === "AM" && selectedDate.getHours() < 12) ||
                                (ampm === "PM" && selectedDate.getHours() >= 12)
                              : false
                          )}
                          className="w-full"
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            const currentHours = newDate.getHours();
                            const is12Hour = currentHours % 12 === 0;
                            if (ampm === "PM" && currentHours < 12) {
                              newDate.setHours(currentHours + 12);
                            } else if (ampm === "AM" && currentHours >= 12) {
                              newDate.setHours(currentHours - 12);
                            }
                            handleDateTimeChange(newDate);
                          }}
                        >
                          {ampm}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <input
              type="text"
              value={dateInputValue}
              onChange={handleDateInputChange}
              className="flex-1 bg-transparent border-none outline-none text-black font-['Poppins'] text-base font-light"
              placeholder="MM/DD/YYYY"
              maxLength={10}
            />
          </div>
        </div>

        {/* Time Input Section */}
        <div className="flex-1">
          <span className="block mb-2 text-lg font-medium font-['Syne'] text-foreground">
            Select Time (UTC)
          </span>
          <div className="flex items-center p-[14px] rounded-2xl border border-input bg-background">
            <TimeInput
              value={selectedDate}
              onChange={handleDateTimeChange}
              className="flex-1"
            />
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 ml-2"
              onClick={generateRandomDateTime}
            >
              <ShuffleIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DateSelector);
