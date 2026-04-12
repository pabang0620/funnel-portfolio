import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Settings } from 'lucide-react';

interface MobileHeaderProps {
  selectedDate: Date;
  title?: string;
}

export function MobileHeader({ selectedDate, title }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            {title ? (
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-gray-900">
                  {format(selectedDate, 'yyyy년 M월', { locale: ko })}
                </h1>
                <p className="text-xs text-gray-500">
                  {format(selectedDate, 'EEEE', { locale: ko })}
                </p>
              </>
            )}
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
