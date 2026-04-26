// ChartAPI.js - 더미 데이터 버전
import { useQuery } from "@tanstack/react-query";
import { dummyData } from "./dummyData";

const fetchData = async (apiPath, queryKey) => {
  // 네트워크 딜레이 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 100));

  // 1. queryKey로 직접 찾기
  if (queryKey && dummyData[queryKey]) {
    return dummyData[queryKey];
  }

  // 2. API 경로 파싱
  const url = apiPath.includes('http') ? new URL(apiPath) : null;
  const params = url ? Object.fromEntries(url.searchParams) : {};

  // 3. /v1/status -> status
  if (apiPath.includes('/status')) {
    return dummyData["status"];
  }

  // 4. /v1/farms/{queryName}/current
  if (apiPath.includes('/farms/') && apiPath.includes('/current')) {
    const match = apiPath.match(/\/farms\/([^/]+)\/current/);
    if (match) {
      const key = `${match[1]}-current`;
      if (dummyData[key]) return dummyData[key];
    }
  }

  // 5. /v1/farms/containers -> container-list
  if (apiPath.includes('/containers')) {
    return dummyData["container-list"];
  }

  // 6. gh_data_item API (바+라인 차트)
  if (apiPath.includes('gh_data_item') && params.group_by === 'day') {
    return dummyData["temp-bar-line"];
  }

  // 7. gh_data_item API (시간별 - 급수 데이터)
  if (apiPath.includes('gh_data_item') && params.group_by === 'hour') {
    return dummyData["chartData0-218"];
  }

  // 8. measurement/day API (MainSmoothedLineChart)
  if (apiPath.includes('measurement/day')) {
    const dataType = params.data_type;
    if (dataType && dummyData[`chartData-${dataType}`]) {
      return dummyData[`chartData-${dataType}`];
    }
  }

  // 9. 기본 응답
  return {
    success: true,
    data: [],
    msg: "더미 데이터"
  };
};

export const useChartData = (apiPath, queryKey) => {
  return useQuery({
    queryKey: [queryKey || apiPath],
    queryFn: () => fetchData(apiPath, queryKey),
    staleTime: 60000,
    retry: false,
  });
};
