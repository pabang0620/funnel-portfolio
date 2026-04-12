import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { getRoomColor, CEO_COLOR } from '../../lib/theme';
import type { Room } from '../../types';
import { cn } from '../../lib/utils';

interface CalendarSidebarProps {
  rooms: Room[];
  visibleRoomIds: Set<string>;
  onRoomToggle: (roomId: string) => void;
  ceoVisible?: boolean;
  onCeoToggle?: () => void;
}

export function CalendarSidebar({
  rooms,
  visibleRoomIds,
  onRoomToggle,
  ceoVisible = true,
  onCeoToggle,
}: CalendarSidebarProps) {
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);

  return (
    <aside className="w-48 md:w-56 lg:w-64 border-r border-[#DADCE0] bg-white flex flex-col">
      {/* My Calendars Section */}
      <div className="px-1.5 md:px-2 py-3 md:py-4">
        <button
          onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
          className="flex items-center gap-1 w-full px-1.5 md:px-2 py-1 hover:bg-[#F1F3F4] rounded"
        >
          {isCalendarExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#5F6368]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#5F6368]" />
          )}
          <span className="text-sm font-semibold text-[#3C4043]">내 캘린더</span>
        </button>

        {isCalendarExpanded && (
          <div className="mt-1 space-y-0.5">
            {/* CEO Checkbox */}
            {onCeoToggle && (
              <label
                className="flex items-center gap-1.5 md:gap-2 px-4 md:px-5 lg:px-6 py-0.5 md:py-1 hover:bg-[#F1F3F4] rounded cursor-pointer"
              >
                <Checkbox
                  checked={ceoVisible}
                  onCheckedChange={onCeoToggle}
                  className={cn(
                    'h-3.5 w-3.5 md:h-4 md:w-4 rounded-sm border-0',
                    ceoVisible ? 'opacity-100' : 'opacity-40'
                  )}
                  style={{
                    backgroundColor: ceoVisible ? CEO_COLOR : '#E8EAED',
                  }}
                />
                <span className="text-sm font-normal text-[#3C4043] truncate">CEO</span>
              </label>
            )}
            {/* Room Checkboxes */}
            {(Array.isArray(rooms) ? rooms : []).map((room, index) => (
              <label
                key={room.id}
                className="flex items-center gap-1.5 md:gap-2 px-4 md:px-5 lg:px-6 py-0.5 md:py-1 hover:bg-[#F1F3F4] rounded cursor-pointer"
              >
                <Checkbox
                  checked={visibleRoomIds.has(room.id)}
                  onCheckedChange={() => onRoomToggle(room.id)}
                  className={cn(
                    'h-3.5 w-3.5 md:h-4 md:w-4 rounded-sm border-0',
                    visibleRoomIds.has(room.id) ? 'opacity-100' : 'opacity-40'
                  )}
                  style={{
                    backgroundColor: visibleRoomIds.has(room.id)
                      ? getRoomColor(index)
                      : '#E8EAED',
                  }}
                />
                <span className="text-sm font-normal text-[#3C4043] truncate">{room.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
