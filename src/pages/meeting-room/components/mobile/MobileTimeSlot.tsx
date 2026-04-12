import { cn } from '../../lib/utils';

interface MobileTimeSlotProps {
  time: string;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (time: string) => void;
}

export function MobileTimeSlot({ time, isSelected, isDisabled, onSelect }: MobileTimeSlotProps) {
  return (
    <button
      onClick={() => !isDisabled && onSelect(time)}
      disabled={isDisabled}
      className={cn(
        'flex items-center justify-center min-h-11 rounded-md text-sm font-medium transition-all',
        isSelected
          ? 'bg-blue-500 text-white shadow-md'
          : isDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
      )}
    >
      {time}
    </button>
  );
}
