// DriveWeb 프로젝트 더미 데이터

// 운행 일지 목록
export const driveLogData = [
  {
    driving_log_id: 1,
    date: "2024-01-20",
    driving_distance: 245,
    total_income: 185000,
    total_expense: 45000,
    working_hours: "8시간",
  },
  {
    driving_log_id: 2,
    date: "2024-01-19",
    driving_distance: 280,
    total_income: 210000,
    total_expense: 52000,
    working_hours: "10시간",
  },
  {
    driving_log_id: 3,
    date: "2024-01-18",
    driving_distance: 198,
    total_income: 165000,
    total_expense: 38000,
    working_hours: "7시간",
  },
  {
    driving_log_id: 4,
    date: "2024-01-17",
    driving_distance: 312,
    total_income: 245000,
    total_expense: 61000,
    working_hours: "11시간",
  },
  {
    driving_log_id: 5,
    date: "2024-01-16",
    driving_distance: 225,
    total_income: 178000,
    total_expense: 42000,
    working_hours: "8시간",
  },
  {
    driving_log_id: 6,
    date: "2024-01-15",
    driving_distance: 265,
    total_income: 195000,
    total_expense: 48000,
    working_hours: "9시간",
  },
  {
    driving_log_id: 7,
    date: "2024-01-14",
    driving_distance: 188,
    total_income: 152000,
    total_expense: 35000,
    working_hours: "7시간",
  },
  {
    driving_log_id: 8,
    date: "2024-01-13",
    driving_distance: 298,
    total_income: 228000,
    total_expense: 58000,
    working_hours: "10시간",
  },
];

// 운행일지 상세 데이터
export const driveDetailsData = {
  1: {
    date: "2024-01-20T00:00:00",
    memo: "오늘은 강남 지역 중심으로 운행했습니다.",
    driving_records: [
      {
        start_time: "09:00",
        end_time: "18:00",
        working_hours: "1970-01-01T08:00:00",
        driving_distance: 245,
        business_distance: 198,
        fuel_amount: 35,
        total_driving_cases: 18,
        fuel_efficiency: 7.0,
        business_rate: 80.8,
        day_of_week: "Saturday",
      },
    ],
    income_records: {
      card_income: 85000,
      cash_income: 45000,
      kakao_income: 35000,
      onda_income: 15000,
      tada_income: 5000,
      uber_income: 0,
      other_income: 0,
      income_spare_1: 0,
      income_spare_2: 0,
      income_spare_3: 0,
      income_spare_4: 0,
    },
    expense_records: {
      fuel_expense: 35000,
      toll_fee: 5000,
      meal_expense: 5000,
      fine_expense: 0,
      other_expense: 0,
      expense_spare_1: 0,
      expense_spare_2: 0,
      expense_spare_3: 0,
      expense_spare_4: 0,
      kakao_fee: 0,
      tada_fee: 0,
      onda_fee: 0,
      uber_fee: 0,
      iam_fee: 0,
      card_fee: 0,
      etc_fee: 0,
    },
  },
};

// 대시보드 데이터
export const dashboardData = {
  totalIncome: 1558000,
  todayIncome: 185000,
  totalMileage: 2011,
  todayDrivingDistance: 245,
  netProfit: 1191000,
  todayNetProfit: 140000,
};

// 수입 요약 데이터
export const incomeSummaryData = {
  card_income: 580000,
  cash_income: 420000,
  kakao_income: 320000,
  onda_income: 148000,
  tada_income: 65000,
  uber_income: 25000,
  other_income: 0,
  income_spare_1: 0,
  income_spare_2: 0,
  income_spare_3: 0,
  income_spare_4: 0,
};

// 지출 요약 데이터
export const expenseSummaryData = {
  fuel_expense: 285000,
  toll_fee: 42000,
  meal_expense: 38000,
  fine_expense: 2000,
  other_expense: 0,
  expense_spare_1: 0,
  expense_spare_2: 0,
  expense_spare_3: 0,
  expense_spare_4: 0,
  kakao_fee: 0,
  tada_fee: 0,
  onda_fee: 0,
  uber_fee: 0,
  iam_fee: 0,
  card_fee: 0,
  etc_fee: 0,
};

// 혼합 차트 데이터
export const mixChartData = [
  {
    date: "2024-01-20",
    drivingDistance: 245,
    workingHours: 8,
    totalIncome: 185000,
  },
  {
    date: "2024-01-19",
    drivingDistance: 280,
    workingHours: 10,
    totalIncome: 210000,
  },
  {
    date: "2024-01-18",
    drivingDistance: 198,
    workingHours: 7,
    totalIncome: 165000,
  },
  {
    date: "2024-01-17",
    drivingDistance: 312,
    workingHours: 11,
    totalIncome: 245000,
  },
  {
    date: "2024-01-16",
    drivingDistance: 225,
    workingHours: 8,
    totalIncome: 178000,
  },
  {
    date: "2024-01-15",
    drivingDistance: 265,
    workingHours: 9,
    totalIncome: 195000,
  },
  {
    date: "2024-01-14",
    drivingDistance: 188,
    workingHours: 7,
    totalIncome: 152000,
  },
];

// 랭킹 데이터
export const rankingData = {
  jobType: {
    전체: [
      { nickname: "운전왕", totalDrivingTime: 3200 },
      { nickname: "택시고수", totalDrivingTime: 3050 },
      { nickname: "서울택시", totalDrivingTime: 2890 },
      { nickname: "강남운전사", totalDrivingTime: 2750 },
      { nickname: "프로드라이버", totalDrivingTime: 2650 },
    ],
    LPG: [
      { nickname: "LPG마스터", totalDrivingTime: 3100 },
      { nickname: "경제운전", totalDrivingTime: 2950 },
      { nickname: "연비킹", totalDrivingTime: 2800 },
    ],
    전기: [
      { nickname: "전기차왕", totalDrivingTime: 2900 },
      { nickname: "테슬라운전", totalDrivingTime: 2700 },
      { nickname: "아이오닉", totalDrivingTime: 2500 },
    ],
  },
  carType: {
    전체직종: [
      { nickname: "운전왕", netIncome: 4500000 },
      { nickname: "수입왕", netIncome: 4200000 },
      { nickname: "효율운전", netIncome: 3900000 },
      { nickname: "프로택시", netIncome: 3750000 },
      { nickname: "서울1등", netIncome: 3600000 },
    ],
    택시: [
      { nickname: "택시1등", netIncome: 4300000 },
      { nickname: "강남택시", netIncome: 4100000 },
      { nickname: "서울택시", netIncome: 3800000 },
    ],
    배달: [
      { nickname: "배달고수", netIncome: 3500000 },
      { nickname: "배달왕", netIncome: 3300000 },
      { nickname: "효율배달", netIncome: 3100000 },
    ],
  },
  fuelType: {
    전체: [
      { nickname: "연비왕", fuelEfficiency: 15.8 },
      { nickname: "효율운전", fuelEfficiency: 15.2 },
      { nickname: "경제주행", fuelEfficiency: 14.9 },
      { nickname: "에코드라이브", fuelEfficiency: 14.5 },
      { nickname: "친환경운전", fuelEfficiency: 14.2 },
    ],
  },
};
