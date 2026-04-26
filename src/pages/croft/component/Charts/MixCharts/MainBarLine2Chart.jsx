import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { format } from "date-fns";
import { useChartData } from "../../utils/api/Charts/ChartAPI";

const MainBarLine2Chart = ({ ChartName, registerChart, chartKey }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const { data, isLoading, error } = useChartData(
    `gh_data_item?group_by=day`,
    `temp-bar-line`
  );

  useEffect(() => {
    if (isLoading || error || !data?.data || !containerRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 데이터 추출
    const uniqueDates = [...new Set(data.data.map((item) => format(new Date(item.kr_time), "MM.dd")))];
    const data227 = data.data.filter((item) => item.data_type_id === 227).map((item) => item.avg);
    const data198 = data.data.filter((item) => item.data_type_id === 198).map((item) => item.avg);
    const data198Max = data.data.filter((item) => item.data_type_id === 198).map((item) => item.high);
    const data198Min = data.data.filter((item) => item.data_type_id === 198).map((item) => item.low);

    const option = {
      grid: { top: 60, right: 15, bottom: 30, left: 45 },
      title: { text: ChartName, top: 8, left: 10, textStyle: { fontSize: 14, fontWeight: 600 } },
      tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
      legend: {
        data: ["온실온도편차", "온실평균온도", "외부평균온도"],
        top: 30,
        left: 10,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 10 },
      },
      xAxis: {
        type: "category",
        data: uniqueDates,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLabel: { fontSize: 10 },
        splitLine: { lineStyle: { type: "dashed", color: "#eee" } },
      },
      series: [
        {
          name: "온실온도최소",
          type: "bar",
          stack: "Total",
          data: data198Min,
          itemStyle: { color: "transparent" },
        },
        {
          name: "온실온도편차",
          type: "bar",
          stack: "Total",
          data: data198Max.map((max, i) => max - (data198Min[i] || 0)),
          itemStyle: { color: "#D95F5F", borderRadius: [4, 4, 0, 0] },
          barWidth: '40%',
        },
        {
          name: "온실평균온도",
          type: "line",
          data: data198,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: "#3F9192", width: 2 },
          itemStyle: { color: "#3F9192" },
          markArea: {
            silent: true,
            itemStyle: { color: "rgba(79, 254, 35, 0.15)" },
            data: [[{ yAxis: 20 }, { yAxis: 25 }]],
          },
        },
        {
          name: "외부평균온도",
          type: "line",
          data: data227,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: "#888", width: 1.5, type: "dashed" },
          itemStyle: { color: "#888" },
        },
      ],
    };

    chartInstance.current.setOption(option);

    if (registerChart) {
      registerChart(chartKey, chartInstance.current);
    }

    const resizeObserver = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [data, isLoading, error, ChartName, registerChart, chartKey]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-white rounded-xl">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white rounded-xl overflow-hidden">
      <div ref={chartRef} className="w-full h-full" />
    </div>
  );
};

export default MainBarLine2Chart;
