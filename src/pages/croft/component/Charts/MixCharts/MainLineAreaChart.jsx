import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { format, subDays } from "date-fns";
import { useChartData } from "../../utils/api/Charts/ChartAPI";

const MainLineAreaChart = ({ ChartName, registerChart, chartKey }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const formattedToday = format(new Date(), "MM.dd");
  const formattedYesterday = format(subDays(new Date(), 1), "MM.dd");

  const { data, isLoading, error } = useChartData(
    `gh_data_item?group_by=hour`,
    `chartData0-218`
  );

  useEffect(() => {
    if (isLoading || error || !data?.data || !containerRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const yesterdayData = data.data.filter((item) => item.kr_time.startsWith(yesterday));
    const todayData = data.data.filter((item) => item.kr_time.startsWith(today));

    const xLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
    const yesterdayAvg = yesterdayData.map((item) => item.avg);
    const todayAvg = todayData.map((item) => item.avg);

    const option = {
      grid: { top: 60, right: 15, bottom: 30, left: 50 },
      title: { text: `${ChartName}`, top: 8, left: 10, textStyle: { fontSize: 14, fontWeight: 600 } },
      tooltip: { trigger: "axis" },
      legend: {
        data: [formattedYesterday, formattedToday],
        top: 30,
        left: 10,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 11 },
      },
      xAxis: {
        type: "category",
        data: xLabels,
        axisLabel: { fontSize: 10, interval: 'auto' },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: { fontSize: 10 },
        splitLine: { lineStyle: { type: "dashed", color: "#eee" } },
      },
      series: [
        {
          name: formattedYesterday,
          type: "line",
          data: yesterdayAvg,
          lineStyle: { color: "#AEAEAE", width: 1.5 },
          showSymbol: false,
        },
        {
          name: formattedToday,
          type: "line",
          data: todayAvg,
          lineStyle: { color: "#4545FF", width: 2 },
          areaStyle: { color: "rgba(69, 69, 255, 0.15)" },
          showSymbol: false,
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
  }, [data, isLoading, error, ChartName, today, yesterday, formattedToday, formattedYesterday, registerChart, chartKey]);

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

export default MainLineAreaChart;
