import { Clock, MapPin, FileText, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { CEO_COLOR } from '../../lib/theme';
import type { CalendarEvent } from '../../types';

interface CalendarEventDetailProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export function CalendarEventDetail({
  open,
  onClose,
  event,
}: CalendarEventDetailProps) {
  if (!event) return null;

  // Check if event has specific time (not all-day event)
  const hasTime = (isoString: string): boolean => {
    return isoString.includes('T');
  };

  // Parse ISO datetime to time string (HH:mm)
  const parseISOToTime = (isoString: string): string => {
    if (!hasTime(isoString)) {
      return '08:00';
    }
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Parse ISO end time (for all-day events, return 19:00)
  const parseISOToEndTime = (isoString: string): string => {
    if (!hasTime(isoString)) {
      return '19:00';
    }
    return parseISOToTime(isoString);
  };

  // Parse ISO datetime to date string (YYYY-MM-DD)
  const parseISOToDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isAllDay = !hasTime(event.start);
  const startTime = parseISOToTime(event.start);
  const endTime = parseISOToEndTime(event.end);
  const dateStr = parseISOToDate(event.start);

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px] md:max-w-[540px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b" style={{ borderBottomColor: CEO_COLOR }}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: CEO_COLOR }}
            >
              <Calendar className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg md:text-xl font-semibold">
              CEO 일정
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5">
          {/* Title Section */}
          <div className="space-y-1.5">
            <p className="text-base md:text-lg font-semibold text-foreground">
              {event.title}
            </p>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" style={{ color: CEO_COLOR }} />
                <span className="text-xs md:text-sm font-medium">날짜</span>
              </div>
              <p className="text-sm md:text-base pl-6">{dateStr}</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" style={{ color: CEO_COLOR }} />
                <span className="text-xs md:text-sm font-medium">시간</span>
              </div>
              <p className="text-sm md:text-base pl-6">
                {isAllDay ? '종일' : `${startTime} - ${endTime}`}
              </p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" style={{ color: CEO_COLOR }} />
                  <span className="text-xs md:text-sm font-medium">장소</span>
                </div>
                <p className="text-sm md:text-base pl-6">{event.location}</p>
              </div>
            </>
          )}

          {/* Description */}
          {event.description && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" style={{ color: CEO_COLOR }} />
                  <span className="text-xs md:text-sm font-medium">설명</span>
                </div>
                <p className="text-sm md:text-base pl-6 text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
