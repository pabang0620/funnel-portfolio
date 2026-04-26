import { getMonth, getISOWeek } from "date-fns";
import { PercentUpDown, ResourceIcon, TempResource } from "../../utils/Data/SingleResourceData";

const TotalResourceChart = () => {
  const today = new Date();

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl p-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold">자원 사용량 총합</span>
        <span className="text-xs text-gray-500">
          {getMonth(today) + 1}월 {getISOWeek(today)}주차
        </span>
      </div>

      {/* 자원 카드들 */}
      <div className="flex-1 grid grid-cols-4 gap-2">
        {TempResource.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2"
          >
            <div className="mb-1">{ResourceIcon(28)[idx]}</div>
            <div className="text-sm font-bold">{item.temp}</div>
            <div className={`text-xs font-medium ${item.percentUp ? "text-red-500" : "text-[#124946]"}`}>
              {PercentUpDown(item.percentUp)} {item.percentNum}%
            </div>
          </div>
        ))}
      </div>

      {/* 하단 링크 */}
      <div className="text-[#124946] text-xs text-right pt-2 cursor-pointer hover:underline">
        전체 사용량 보기
      </div>
    </div>
  );
};

export default TotalResourceChart;
