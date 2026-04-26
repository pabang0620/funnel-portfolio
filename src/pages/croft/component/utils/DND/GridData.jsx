import React from 'react';
import { format, subDays } from 'date-fns';
import MainSliderDiv from '../../Graphs/MainSliderDiv';
import MainBarChartLine from '../../Charts/BarCharts/MainBarChartLine';
import MainBarChart from '../../Charts/BarCharts/MainBarChart';
import MainLineChart from '../../Charts/LineCharts/MainLineChart';
import MainSmoothedLineChart from '../../Charts/LineCharts/MainSmoothedLineChart';
import MainLineAreaChart from '../../Charts/MixCharts/MainLineAreaChart';
import MainBarLine2Chart from '../../Charts/MixCharts/MainBarLine2Chart';
import TotalReportChart from '../../Charts/TotalReportChart/TotalReportChart';
import GreenhouseScore from '../../Charts/GreenhouseScore';
import CroftGuide from '../../Charts/CroftGuide/CroftGuide';
import TotalResourceChart from '../../Charts/TotalResourceChart/TotalResourceChart';

// 12컬럼 그리드, 깔끔한 배치
// Row 0: 온실환경종합(5) + 스코어(2) + 가이드(5) = 12
// Row 2: RTR(2) + PP(2) + VPD(2) + 자원(6) = 12
// Row 4: 급수데이터(6) + 평균온도(6) = 12
// Row 8: 온도(3) + 습도(3) + CO2(3) + DLI(3) = 12

const positionMap = {
  // Row 0-1: 상단 종합 정보
  0: { x: 0, y: 0, w: 5, h: 2 },  // 온실 환경 종합
  1: { x: 5, y: 0, w: 2, h: 2 },  // 종합 스코어
  2: { x: 7, y: 0, w: 5, h: 2 },  // 크로프트 가이드

  // Row 2-3: 슬라이더 + 자원
  3: { x: 0, y: 2, w: 2, h: 2 },  // RTR
  4: { x: 2, y: 2, w: 2, h: 2 },  // Photo Period
  5: { x: 4, y: 2, w: 2, h: 2 },  // VPD
  6: { x: 6, y: 2, w: 6, h: 2 },  // 자원 사용량

  // Row 4-7: 큰 차트 2개
  7: { x: 0, y: 4, w: 6, h: 4 },  // 급수 데이터
  8: { x: 6, y: 4, w: 6, h: 4 },  // 평균 온도

  // Row 8-9: 작은 라인 차트 4개
  9: { x: 0, y: 8, w: 3, h: 2 },   // 온실 온도
  10: { x: 3, y: 8, w: 3, h: 2 },  // 온실 습도
  11: { x: 6, y: 8, w: 3, h: 2 },  // 온실 CO2
  12: { x: 9, y: 8, w: 3, h: 2 },  // DLI
};

const GridData = [
  {
    chartID: 'GreenhouseTotal',
    id: 0,
    component: (
      <TotalReportChart title="온실 환경 종합" time="10:25" size={50} />
    ),
    layout: positionMap[0],
  },
  {
    chartID: 'TotalScore',
    id: 1,
    component: <GreenhouseScore />,
    layout: positionMap[1],
  },
  {
    chartID: 'CroftGuide',
    id: 2,
    component: <CroftGuide />,
    layout: positionMap[2],
  },
  {
    chartID: 'RTR',
    id: 3,
    component: (
      <MainSliderDiv
        dataName="avg_temp"
        queryName="rtr"
        title="RTR"
        absData1="0"
        absData2="1.2"
        absData3="1.5"
        absData4="3"
        absData5="영양"
        absData6="균형"
        absData7="생식"
        absData8="생식생장 상태"
      />
    ),
    layout: positionMap[3],
  },
  {
    chartID: 'PHOTOPERIOD',
    id: 4,
    component: (
      <MainSliderDiv
        dataName="photo_period_hour"
        queryName="photo_period"
        title="Photo Period"
        absData1="0"
        absData2="6"
        absData3="10"
        absData4="16"
        absData5="최저"
        absData6="권장"
        absData7="고권장"
        absData8="광주기 상태"
      />
    ),
    layout: positionMap[4],
  },
  {
    chartID: 'VPD',
    id: 5,
    component: (
      <MainSliderDiv
        dataName="vpd"
        queryName="vpd"
        title="VPD"
        absData1="0"
        absData2="0.8"
        absData3="1.2"
        absData4="2"
        absData5="축적"
        absData6="균형"
        absData7="증산"
        absData8="VPD 상태"
      />
    ),
    layout: positionMap[5],
  },
  {
    chartID: 'ResourceTotal',
    id: 6,
    component: <TotalResourceChart />,
    layout: positionMap[6],
  },
  {
    chartID: 'DailyWaterSupply',
    id: 7,
    component: (
      <MainLineAreaChart
        APIoption="218"
        ChartName="급수 데이터"
      />
    ),
    layout: positionMap[7],
  },
  {
    chartID: 'DailyTempChange',
    id: 8,
    component: (
      <MainBarLine2Chart
        ChartName="평균 온도"
        locate="dash"
        startDate={format(subDays(new Date(), 7), 'yyyy-MM-dd')}
        endDate={format(subDays(new Date(), -1), 'yyyy-MM-dd')}
      />
    ),
    layout: positionMap[8],
  },
  {
    chartID: 'Temperature',
    id: 9,
    component: (
      <MainSmoothedLineChart
        APIoption="198"
        ChartName="온실 온도"
        unit="℃"
      />
    ),
    layout: positionMap[9],
  },
  {
    chartID: 'Humidity',
    id: 10,
    component: (
      <MainSmoothedLineChart
        APIoption="199"
        ChartName="온실 습도"
        unit="%"
      />
    ),
    layout: positionMap[10],
  },
  {
    chartID: 'CO2',
    id: 11,
    component: (
      <MainSmoothedLineChart
        APIoption="225"
        ChartName="온실 CO2"
        unit="ppm"
      />
    ),
    layout: positionMap[11],
  },
  {
    chartID: 'DLI',
    id: 12,
    component: (
      <MainLineChart
        APIoption="220"
        ChartName="DLI"
      />
    ),
    layout: positionMap[12],
  },
];

export default GridData;
