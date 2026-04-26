import React, { useState, useEffect } from 'react';
import StackedBarLineChart from '../Charts/MixCharts/StackedBarLineChart';
import { useChartData } from '../utils/api/Charts/ChartAPI';
import IncreaseUpDown from './IncreaseUpDownAndCost';

const TotalCost = ({ years }) => {
  const { data, isLoading } = useChartData(
    `${
      process.env.REACT_APP_BASE_API_KEY
    }/v1/farms/revenue-expense?period=yearly&year=${years - 1}`,
    `revenue-expense-yearly-${years}}`
  );
  const [totalData, SetTotalData] = useState([
    { title: '총 매출액', cost: '21,358,210', last: 0, current: 0 },
    { title: '순수익', cost: '6,358,210', last: 0, current: 0 },
    { title: '비용', cost: '15,000,000', last: 0, current: 0 },
  ]);
  useEffect(() => {
    if (!isLoading) {
      const filteredData = data?.data.filter((item) =>
        item.year.includes(years)
      );
      const lastFilteredData = data?.data.filter((item) =>
        item.year.includes(years - 1)
      );
      if (filteredData.length > 0) {
        const {
          revenue,
          profit,
          personnel_expense,
          fixed_cost,
          resource_bill,
        } = filteredData[0];
        const TempTotal = personnel_expense + fixed_cost + resource_bill;
        const lastTempTotal =
          lastFilteredData[0].personnel_expense +
          lastFilteredData[0].fixed_cost +
          lastFilteredData[0].resource_bill;
        SetTotalData([
          {
            title: '총 매출액',
            cost: `${revenue?.toLocaleString('ko-KR')}`,
            last: lastFilteredData[0].revenue,
            current: revenue,
          },
          {
            title: '순수익',
            cost: `${profit?.toLocaleString('ko-KR')}`,
            last: lastFilteredData[0].profit,
            current: profit,
          },
          {
            title: '비용',
            cost: `${TempTotal?.toLocaleString('ko-KR')}`,
            last: lastTempTotal,
            current: TempTotal,
          },
        ]);
      } else {
        console.log('No data');
      }
    }
  }, [isLoading, years]);

  //temp 데이터 타입에 따라 구조 변환 예정

  return (
    <div className="flex flex-col gap-6 py-6 px-7 w-[61.25rem] h-[42.5rem] bg-white rounded-[10px]">
      <div className="flex gap-[55px]">
        {totalData.map((item) => (
          <div className="flex flex-col gap-[6px]" key={item.title}>
            <div className="text-lg font-bold mb-[5px]">{item.title}</div>
            <div className="text-2xl">{item.cost}원</div>
            {/* 나중에 마이너스이면으로 바꾸기 */}

            {!isLoading && (
              <IncreaseUpDown
                last={item.last ? item.last : 1}
                current={item.current ? item.current : 0}
              />
            )}
          </div>
        ))}
      </div>
      {/* bar2갠데 하나가 3색인거  */}
      <div className="w-[822px] h-[523px] bg-white rounded-[10px]">
        <StackedBarLineChart years={years} />
      </div>
    </div>
  );
};

export default TotalCost;
