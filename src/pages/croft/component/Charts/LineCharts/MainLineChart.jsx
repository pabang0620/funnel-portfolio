import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';
import { useChartData } from '../../utils/api/Charts/ChartAPI';

const MainLineChart = ({ APIoption, ChartName, registerChart, chartKey }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const { data, isLoading, error } = useChartData(
    `/api/v1/farms/measurement/day?data_type=${APIoption}`,
    `chartData-${APIoption}`
  );

  useEffect(() => {
    if (isLoading || error || !data?.data || !containerRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const values = data.data.map((item) => item.value);
    const maxValue = Math.max(...values);
    const max = Math.ceil(maxValue * 1.1);
    const interval = Math.ceil(max / 5);

    const xLabels = data.data.map((item) => {
      const date = new Date(item.kr_time);
      return `${date.getHours().toString().padStart(2, '0')}:00`;
    });

    const option = {
      grid: { top: 40, right: 15, bottom: 35, left: 45 },
      title: { text: ChartName, top: 8, left: 10, textStyle: { fontSize: 14, fontWeight: 600 } },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: xLabels,
        axisLabel: { fontSize: 10, interval: 'auto' },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        max,
        interval,
        axisLabel: { fontSize: 10 },
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      },
      series: [{
        name: ChartName,
        type: 'line',
        data: values,
        showSymbol: false,
        lineStyle: { color: 'transparent' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(69, 69, 255, 0.6)' },
            { offset: 1, color: 'rgba(69, 69, 255, 0.1)' },
          ]),
        },
        markArea: {
          silent: true,
          itemStyle: { color: 'rgba(79, 254, 35, 0.15)' },
          data: [[{ yAxis: 12 }, { yAxis: 15 }]],
        },
      }],
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
  }, [data, isLoading, error, ChartName, APIoption, registerChart, chartKey]);

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

export default MainLineChart;
