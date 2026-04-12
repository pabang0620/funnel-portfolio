import { useRef, useEffect, useState, useMemo } from 'react';
import { format, addDays, subDays, isSameDay, isToday, startOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function MobileDatePicker({ selectedDate, onDateChange }: MobileDatePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Base date for generating the date range - only changes when we need to expand
  const [baseDate, setBaseDate] = useState(() => startOfWeek(selectedDate, { weekStartsOn: 0 }));

  // Generate 21 days starting from baseDate (3 weeks)
  const dates = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => addDays(subDays(baseDate, 7), i));
  }, [baseDate]);

  // Check if selectedDate is within visible range, if not, update baseDate
  useEffect(() => {
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    if (selectedDate < firstDate || selectedDate > lastDate) {
      setBaseDate(startOfWeek(selectedDate, { weekStartsOn: 0 }));
    }
  }, [selectedDate, dates]);

  // Scroll to selected date
  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div className="flex items-center gap-2 px-2">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0 active:bg-gray-200"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dates.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const today = isToday(date);
            const dayOfWeek = format(date, 'EEE', { locale: ko });
            const isSunday = date.getDay() === 0;
            const isSaturday = date.getDay() === 6;

            return (
              <button
                key={date.toISOString()}
                data-selected={isSelected}
                onClick={() => onDateChange(date)}
                className={cn(
                  'flex flex-col items-center justify-center min-w-14 h-16 rounded-lg shrink-0 transition-colors duration-150',
                  isSelected
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200',
                  today && !isSelected && 'ring-2 ring-blue-300'
                )}
              >
                <span className={cn(
                  'text-xs font-medium',
                  isSelected ? 'text-blue-100' : isSunday ? 'text-red-500' : isSaturday ? 'text-blue-600' : 'text-gray-500'
                )}>
                  {dayOfWeek}
                </span>
                <span className={cn(
                  'text-lg font-bold',
                  isSelected ? 'text-white' : 'text-gray-900'
                )}>
                  {format(date, 'd')}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0 active:bg-gray-200"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
