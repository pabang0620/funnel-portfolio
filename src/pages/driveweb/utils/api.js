// DriveWeb 프로젝트 API 함수 (더미 데이터 반환)
import {
  driveLogData,
  driveDetailsData,
  dashboardData,
  incomeSummaryData,
  expenseSummaryData,
  mixChartData,
  rankingData,
} from "../data/mockData";

// 운행일지 목록 조회
export const getDrive = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(driveLogData);
    }, 500);
  });
};

// 운행일지 상세 조회
export const getDriveDetails = async (drivingLogId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(driveDetailsData[drivingLogId] || driveDetailsData[1]);
    }, 500);
  });
};

// 마이페이지 데이터 조회
export const getMypage = async (startDate, endDate) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dashboardData);
    }, 500);
  });
};

// 수입 요약 데이터 조회
export const getMypageIncomeSummary = async (startDate, endDate) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(incomeSummaryData);
    }, 500);
  });
};

// 지출 요약 데이터 조회
export const getMypageExpenseSummary = async (startDate, endDate) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(expenseSummaryData);
    }, 500);
  });
};

// 혼합 차트 데이터 조회
export const getMypageMix = async (startDate, endDate) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mixChartData);
    }, 500);
  });
};

// 랭킹 데이터 조회 - 운행시간
export const postRankTopUsers = async ({ jobtype }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(rankingData.jobType[jobtype] || rankingData.jobType["전체"]);
    }, 500);
  });
};

// 랭킹 데이터 조회 - 총 운송수입금
export const postRankTopNetIncome = async ({ carType }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(rankingData.carType[carType] || rankingData.carType["전체직종"]);
    }, 500);
  });
};

// 랭킹 데이터 조회 - 연비
export const postRankTopFuelEfficiency = async ({ fuelType }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(rankingData.fuelType["전체"]);
    }, 500);
  });
};
