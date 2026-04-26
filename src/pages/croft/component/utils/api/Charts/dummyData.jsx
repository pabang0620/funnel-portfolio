// dummyData.js - Croft 프로젝트 더미 데이터
import { format, subDays, subHours } from 'date-fns';

// 시간별 데이터 생성 (kr_time 형식)
const generateHourlyMeasurement = (hours = 24, baseValue = 25, variance = 5) => {
  const data = [];
  for (let i = hours; i >= 0; i--) {
    const date = subHours(new Date(), i);
    data.push({
      kr_time: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      value: Math.round((baseValue + (Math.random() - 0.5) * variance * 2) * 10) / 10,
      avg: Math.round((baseValue + (Math.random() - 0.5) * variance * 2) * 10) / 10,
    });
  }
  return data;
};

// 일별 데이터 생성 (바 차트용)
const generateDailyBarData = (days = 7) => {
  const data = [];
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, "yyyy-MM-dd'T'00:00:00");

    // 온실 온도 (data_type_id: 198)
    const tempAvg = 23 + Math.random() * 4;
    data.push({
      kr_time: dateStr,
      data_type_id: 198,
      avg: Math.round(tempAvg * 10) / 10,
      high: Math.round((tempAvg + 3 + Math.random() * 2) * 10) / 10,
      low: Math.round((tempAvg - 3 - Math.random() * 2) * 10) / 10,
    });

    // 외부 온도 (data_type_id: 227)
    data.push({
      kr_time: dateStr,
      data_type_id: 227,
      avg: Math.round((18 + Math.random() * 8) * 10) / 10,
      high: Math.round((25 + Math.random() * 5) * 10) / 10,
      low: Math.round((10 + Math.random() * 5) * 10) / 10,
    });
  }
  return data;
};

// 급수 데이터 생성 (어제/오늘 비교용)
const generateWaterData = () => {
  const data = [];
  const today = new Date();
  const yesterday = subDays(today, 1);

  // 어제 데이터
  for (let h = 0; h < 24; h++) {
    const date = new Date(yesterday);
    date.setHours(h, 0, 0, 0);
    data.push({
      kr_time: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      avg: Math.round((30 + Math.random() * 40) * 10) / 10,
    });
  }

  // 오늘 데이터
  for (let h = 0; h <= new Date().getHours(); h++) {
    const date = new Date(today);
    date.setHours(h, 0, 0, 0);
    data.push({
      kr_time: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      avg: Math.round((30 + Math.random() * 40) * 10) / 10,
    });
  }

  return data;
};

export const dummyData = {
  // 컨테이너 목록
  "container-list": {
    success: true,
    data: [
      { id: 1, name: "1동 온실", temp: 25.5, humidity: 65, radiation: 15000, co2: 800, status: "normal" },
      { id: 2, name: "2동 온실", temp: 24.2, humidity: 68, radiation: 14500, co2: 780, status: "normal" },
      { id: 3, name: "3동 온실", temp: 22.8, humidity: 70, radiation: 13000, co2: 750, status: "warning" },
      { id: 4, name: "4동 온실", temp: 23.5, humidity: 66, radiation: 14000, co2: 820, status: "normal" },
      { id: 5, name: "5동 온실", temp: 26.0, humidity: 62, radiation: 16000, co2: 850, status: "critical" },
    ],
    msg: "success"
  },

  // 온실 스코어 (GreenhouseScore)
  "status": {
    success: true,
    data: {
      score: 4,
      title: "좋음",
      description: "온실 환경이 양호한 상태입니다."
    }
  },

  // RTR 현재값
  "rtr-current": {
    success: true,
    data: {
      avg_temp: 1.35,
      status: "균형"
    }
  },

  // Photo Period 현재값
  "photo_period-current": {
    success: true,
    data: {
      photo_period_hour: 12.5,
      status: "권장"
    }
  },

  // VPD 현재값
  "vpd-current": {
    success: true,
    data: {
      vpd: 1.25,
      status: "균형"
    }
  },

  // 온도 차트 (MainSmoothedLineChart - APIoption 198)
  "chartData-198": {
    success: true,
    data: generateHourlyMeasurement(24, 25, 3)
  },

  // 습도 차트 (APIoption 199)
  "chartData-199": {
    success: true,
    data: generateHourlyMeasurement(24, 65, 8)
  },

  // 급수 데이터 (MainLineAreaChart - APIoption 218)
  "chartData0-218": {
    success: true,
    data: generateWaterData()
  },

  // DLI 데이터 (APIoption 220)
  "chartData-220": {
    success: true,
    data: generateHourlyMeasurement(24, 20, 5)
  },

  // CO2 데이터 (APIoption 225)
  "chartData-225": {
    success: true,
    data: generateHourlyMeasurement(24, 800, 100)
  },

  // 외부 광량 데이터 (APIoption 244)
  "chartData-244": {
    success: true,
    data: generateHourlyMeasurement(24, 15000, 5000)
  },

  // 평균 온도 바+라인 차트 (MainBarLine2Chart)
  "temp-bar-line": {
    success: true,
    data: generateDailyBarData(7)
  },

  // VPD 차트
  "vpd-chart": {
    success: true,
    data: generateHourlyMeasurement(24, 1.2, 0.4).map(d => ({
      ...d,
      vpd: d.value,
      temp: 24 + Math.random() * 4,
      humidity: 60 + Math.random() * 15
    }))
  },

  // 기본 대시보드 데이터
  "dashboard": {
    success: true,
    data: {
      temperature: 25.5,
      humidity: 65,
      co2: 800,
      light: 15000,
      vpd: 1.25,
      dli: 22.5
    }
  },

  // RTR 바 차트
  "rtr-bar": {
    success: true,
    data: Array.from({ length: 12 }, (_, i) => ({
      time: `${String(i * 2).padStart(2, '0')}:00`,
      value: 1.0 + Math.random() * 1.0
    }))
  },

  // DLI 바라인 차트
  "dli-bar": {
    success: true,
    data: Array.from({ length: 7 }, (_, i) => ({
      date: format(subDays(new Date(), 6 - i), 'MM.dd'),
      value: 18 + Math.random() * 8,
      target: 20
    }))
  },

  // Photo Period 바 차트
  "photo_period-bar": {
    success: true,
    data: Array.from({ length: 7 }, (_, i) => ({
      date: format(subDays(new Date(), 6 - i), 'MM.dd'),
      value: 10 + Math.random() * 4
    }))
  },

  // 물 사용량 (MainFootLineChart)
  "water-usage": {
    success: true,
    data: generateHourlyMeasurement(24, 80, 30)
  },

  // 자원 사용량
  "resource": {
    success: true,
    data: {
      water: { today: 1500, yesterday: 1400, unit: "L" },
      electricity: { today: 350, yesterday: 320, unit: "kWh" },
      gas: { today: 80, yesterday: 75, unit: "m³" },
      co2: { today: 120, yesterday: 110, unit: "kg" }
    }
  }
};
