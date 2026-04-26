import React, { useState, useEffect } from 'react';
import { useChartData } from '../utils/api/Charts/ChartAPI';

const MainSliderDiv = ({
  dataName,
  queryName,
  title,
  absData1,
  absData2,
  absData3,
  absData4,
  absData5,
  absData6,
  absData7,
  absData8,
}) => {
  const [value, setValue] = useState(0);
  const { data, isLoading } = useChartData(
    `/v1/farms/${queryName}/current`,
    `${queryName}-current`
  );

  useEffect(() => {
    if (data?.data) {
      const val = data.data[dataName] || 0;
      setValue(val);
    }
  }, [data, dataName]);

  const maxVal = parseFloat(absData4) || 16;
  const percentage = Math.min((value / maxVal) * 100, 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-white rounded-xl">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl p-4">
      {/* 타이틀 */}
      <div className="text-center mb-auto">
        <span className="text-sm font-bold">{title}</span>
        <span className="text-[#124946] ml-2 font-semibold">{value}</span>
      </div>

      {/* 슬라이더 영역 */}
      <div className="flex-1 flex flex-col justify-center px-2">
        <div className="relative h-6 mb-4">
          {/* 배경 트랙 */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full" />

          {/* 권장 범위 표시 */}
          <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-1/3 h-4 bg-green-200/50 rounded" />

          {/* 구분선 */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-0.5 h-4 bg-gray-300" />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-0.5 h-4 bg-gray-300" />
          <div className="absolute top-1/2 -translate-y-1/2 left-2/3 w-0.5 h-4 bg-gray-300" />
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-0.5 h-4 bg-gray-300" />

          {/* 현재 값 포인터 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#124946] rounded-full shadow-sm"
            style={{ left: `calc(${percentage}% - 6px)` }}
          />
        </div>

        {/* 숫자 레이블 */}
        <div className="relative flex justify-between text-[10px] text-gray-500 mb-1">
          <span>{absData1}</span>
          <span style={{ position: 'absolute', left: '33%', transform: 'translateX(-50%)' }}>{absData2}</span>
          <span style={{ position: 'absolute', left: '66%', transform: 'translateX(-50%)' }}>{absData3}</span>
          <span>{absData4}</span>
        </div>

        {/* 상태 레이블 */}
        <div className="flex justify-around text-[10px] text-gray-600">
          <span>{absData5}</span>
          <span>{absData6}</span>
          <span>{absData7}</span>
        </div>
      </div>

      {/* 하단 상태 */}
      <div className="text-center text-xs text-gray-500 mt-auto pt-2">
        {absData8}
      </div>
    </div>
  );
};

export default MainSliderDiv;
