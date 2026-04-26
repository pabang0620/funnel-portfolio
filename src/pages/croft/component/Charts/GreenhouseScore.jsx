import { ScoreImg } from '../utils/Data/GreenhouseScoreData';
import { useChartData } from '../utils/api/Charts/ChartAPI';

const GreenhouseScore = () => {
  const { data, isLoading } = useChartData(`/v1/status`, 'status');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-white rounded-xl">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-4 gap-3 rounded-xl bg-white">
      <div className="flex-1 flex items-center justify-center">
        {ScoreImg(data?.data?.score || 3)}
      </div>
      <div className="flex flex-col gap-1 text-center">
        <div className="font-bold text-sm">{data?.data?.title || '양호'}</div>
        <div className="text-xs text-gray-600 line-clamp-2">
          {data?.data?.description || '온실 환경이 양호합니다.'}
        </div>
      </div>
    </div>
  );
};

export default GreenhouseScore;
