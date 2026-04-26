import { format } from 'date-fns';
import InnerIconChart from './InnerIconChart';
import { CriticalOrWarn } from '../../utils/Icons';

const TotalReportChart = ({ title }) => {
  const currentTime = format(new Date(), 'HH:mm');
  const criticalAndWarning = {
    critical: { temp: true, humidity: false, solar: false, co2: false },
    warning: false,
  };

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold">{title}</span>
          <span className="text-sm text-[#124946]">{currentTime}</span>
        </div>
        <div>
          {CriticalOrWarn(true, criticalAndWarning.critical, criticalAndWarning.warning)}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <InnerIconChart />
      </div>
      <div className="text-[#124946] text-xs text-right pt-2 cursor-pointer hover:underline">
        자세히보기
      </div>
    </div>
  );
};

export default TotalReportChart;
