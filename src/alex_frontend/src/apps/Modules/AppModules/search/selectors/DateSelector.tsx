import React, { useState, useRef } from 'react';
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
import { format, parse } from 'date-fns';

const DATE_FORMAT = "MM/dd/yyyy hh:mm aa";

const formatDateInput = (input: string): string => {
  // Allow direct editing but clean up when losing focus
  return input;
};

const formatTimeInput = (input: string): string => {
  // Allow direct editing but clean up when losing focus
  return input;
};

const cleanAndValidateDate = (dateStr: string): string => {
  // Remove all non-digits
  const numbers = dateStr.replace(/\D/g, '');

  // Format as MM/DD/YYYY
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

const cleanAndValidateTime = (timeStr: string): string => {
  // Remove non-digits and convert to uppercase
  const cleaned = timeStr.toUpperCase();
  const numbers = cleaned.replace(/[^0-9AP]/g, '');
  const ampm = cleaned.match(/[AP]M?$/)?.[0] || '';

  let formatted = '';
  if (numbers.length > 0) {
    const hours = numbers.slice(0, 2);
    formatted += hours;
    if (numbers.length > 2) {
      formatted += ':' + numbers.slice(2, 4);
    }
  }

  if (ampm) {
    formatted += ' ' + (ampm.length === 1 ? ampm + 'M' : ampm);
  }

  return formatted;
};

const isValidDate = (dateStr: string): boolean => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;

  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  return month >= 1 && month <= 12 &&
    day >= 1 && day <= 31 &&
    year >= 1900 && year <= 9999;
};

const isValidTime = (timeStr: string): boolean => {
  const match = timeStr.match(/^(0?[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/i);
  return match !== null;
};

const DateSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (searchState.filterDate && searchState.filterTime) {
      return new Date(`${searchState.filterDate}T${searchState.filterTime}`);
    }
    return new Date();
  });
  const [dateInputValue, setDateInputValue] = useState(() =>
    format(selectedDate || new Date(), "MM/dd/yyyy")
  );
  const [timeInputValue, setTimeInputValue] = useState(() =>
    format(selectedDate || new Date(), "hh:mm aa")
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleDateTimeChange = (date: Date) => {
    dispatch(setSearchState({
      filterDate: date.toISOString().split('T')[0],
      filterTime: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }));
    setSelectedDate(date);
    setDateInputValue(format(date, "MM/dd/yyyy"));
    setTimeInputValue(format(date, "hh:mm aa"));
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatDateInput(e.target.value);
    setDateInputValue(newValue);

    if (newValue.length === 10 && isValidDate(newValue)) {
      try {
        const currentTime = selectedDate ? format(selectedDate, "hh:mm aa") : format(new Date(), "hh:mm aa");
        const parsedDate = parse(`${newValue} ${currentTime}`, DATE_FORMAT, new Date());

        if (!isNaN(parsedDate.getTime())) {
          handleDateTimeChange(parsedDate);
        }
      } catch (error) {
        // Invalid date
      }
    }
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatTimeInput(e.target.value);
    setTimeInputValue(newValue);

    if (isValidTime(newValue)) {
      try {
        const currentDate = selectedDate ? format(selectedDate, "MM/dd/yyyy") : format(new Date(), "MM/dd/yyyy");
        const parsedDate = parse(`${currentDate} ${newValue}`, DATE_FORMAT, new Date());

        if (!isNaN(parsedDate.getTime())) {
          handleDateTimeChange(parsedDate);
        }
      } catch (error) {
        // Invalid time
      }
    }
  };

  const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string) => {
    const currentDate = selectedDate || new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    handleDateTimeChange(newDate);
  };

  const generateRandomDateTime = () => {
    const start = new Date('2019-06-01').getTime();
    const end = Date.now();
    const randomDate = new Date(start + Math.random() * (end - start));
    handleDateTimeChange(randomDate);
  };

  const getButtonVariant = (isSelected: boolean) => {
    return isSelected ? "primary" : "ghost";
  };

  const handleDateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const cleanedValue = cleanAndValidateDate(e.target.value);
    setDateInputValue(cleanedValue);

    if (cleanedValue.length === 10 && isValidDate(cleanedValue)) {
      try {
        const currentTime = selectedDate ? format(selectedDate, "hh:mm aa") : format(new Date(), "hh:mm aa");
        const parsedDate = parse(`${cleanedValue} ${currentTime}`, DATE_FORMAT, new Date());

        if (!isNaN(parsedDate.getTime())) {
          handleDateTimeChange(parsedDate);
        }
      } catch (error) {
        // Invalid date - revert to previous valid date
        if (selectedDate) {
          setDateInputValue(format(selectedDate, "MM/dd/yyyy"));
        }
      }
    }
  };

  const handleTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const cleanedValue = cleanAndValidateTime(e.target.value);
    setTimeInputValue(cleanedValue);

    if (isValidTime(cleanedValue)) {
      try {
        const currentDate = selectedDate ? format(selectedDate, "MM/dd/yyyy") : format(new Date(), "MM/dd/yyyy");
        const parsedDate = parse(`${currentDate} ${cleanedValue}`, DATE_FORMAT, new Date());

        if (!isNaN(parsedDate.getTime())) {
          handleDateTimeChange(parsedDate);
        }
      } catch (error) {
        // Invalid time - revert to previous valid time
        if (selectedDate) {
          setTimeInputValue(format(selectedDate, "hh:mm aa"));
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between gap-4">
        {/* Date Section */}
        <div className="flex-1">
          <span className="block mb-2 text-lg font-medium font-['Syne'] text-foreground">
            Select Date
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
                    defaultMonth={selectedDate || new Date()}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date);
                        if (selectedDate) {
                          newDate.setHours(selectedDate.getHours());
                          newDate.setMinutes(selectedDate.getMinutes());
                        }
                        handleDateTimeChange(newDate);
                      }
                      setIsOpen(false);
                    }}
                    initialFocus
                  />
                  <div className="flex flex-col h-[300px] divide-y">
                    <ScrollArea className="w-auto">
                      <div className="flex flex-col p-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                          <Button
                            key={hour}
                            variant={getButtonVariant(
                              selectedDate ? selectedDate.getHours() % 12 === hour % 12 : false
                            )}
                            className="w-full"
                            onClick={() => handleTimeChange("hour", hour.toString())}
                          >
                            {hour}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                    <ScrollArea className="w-auto">
                      <div className="flex flex-col p-2">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                          <Button
                            key={minute}
                            variant={getButtonVariant(
                              selectedDate ? selectedDate.getMinutes() === minute : false
                            )}
                            className="w-full"
                            onClick={() => handleTimeChange("minute", minute.toString())}
                          >
                            {minute.toString().padStart(2, '0')}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-2">
                      {["AM", "PM"].map((ampm) => (
                        <Button
                          key={ampm}
                          variant={getButtonVariant(
                            selectedDate
                              ? (ampm === "AM" && selectedDate.getHours() < 12) ||
                              (ampm === "PM" && selectedDate.getHours() >= 12)
                              : false
                          )}
                          className="w-full"
                          onClick={() => handleTimeChange("ampm", ampm)}
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
              onBlur={handleDateBlur}
              className="flex-1 bg-transparent border-none outline-none text-black font-['Poppins'] text-base font-light"
              placeholder="MM/DD/YYYY"
              maxLength={10}
            />
          </div>
        </div>

        {/* Time Section */}
        <div className="flex-1">
          <span className="block mb-2 text-lg font-medium font-['Syne'] text-foreground">
            Select Time
          </span>
          <div className="flex items-center p-[14px] rounded-2xl border border-input bg-background">
            <input
              type="text"
              value={timeInputValue}
              onChange={handleTimeInputChange}
              onBlur={handleTimeBlur}
              className="flex-1 bg-transparent border-none outline-none text-black font-['Poppins'] text-base font-light"
              placeholder="hh:mm AA"
              maxLength={8}
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

export default DateSelector;
