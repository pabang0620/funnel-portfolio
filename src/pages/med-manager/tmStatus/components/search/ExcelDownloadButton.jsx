import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { getTmList } from "@/data/med-manager/mockService";

const transformToExcelData = (tmList, formatDate, userMap = {}) => {
  return tmList.map((tm) => ({
    콜진행: tm.call_memo_updated_at ? "Y" : "N",
    콜내역: tm.isNewStatus ? `신규/${tm.call_history}` : tm.call_history,
    방문상태: tm.visit_status,
    병원명: tm.hospital_name,
    유입날짜: formatDate(tm.date),
    신청자이름: tm.name || "-",
    전화번호: tm.phone || "-",
    매체: tm.advertising_company_name,
    재통화날짜: formatDate(tm.follow_up_time) || "-",
    예약날짜: formatDate(tm.reservation_date) || "-",
    담당자: userMap[tm.user_id] || "-",
  }));
};

const generateExcelFileName = () => {
  const today = new Date().toISOString().slice(0, 10);
  return `업무_현황_${today}.xlsx`;
};

const ExcelDownloadButton = ({
  apiParams,
  searchField,
  searchKeyword,
  formatDate,
  setIsLoading,
  userList,
}) => {
  const userMap = React.useMemo(() => {
    if (!userList || userList.length === 0) return {};
    return userList.reduce((map, user) => {
      if (user.value !== 0) {
        map[user.value] = user.label;
      }
      return map;
    }, {});
  }, [userList]);

  const handleExcelDownload = useCallback(async () => {
    try {
      setIsLoading(true);

      // 포트폴리오: mockService로 전체 데이터 가져오기
      const result = getTmList({
        hospitalId: apiParams.hospital_id,
        userId: apiParams.user_id,
        startDate: apiParams.date?.startDate,
        endDate: apiParams.date?.endDate,
        searchField: searchField || undefined,
        searchKeyword: searchKeyword || undefined,
        page: 1,
        pageSize: 9999,
      });

      const tmList = result.tmWithDetails;
      const excelData = transformToExcelData(tmList, formatDate, userMap);

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "업무현황");

      const fileName = generateExcelFileName();
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("엑셀 다운로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, [apiParams, searchField, searchKeyword, formatDate, setIsLoading, userMap]);

  return (
    <button className="excel-download-button" onClick={handleExcelDownload}>
      <FontAwesomeIcon icon={faFileArrowDown} />
      <span>엑셀 다운로드</span>
    </button>
  );
};

export default ExcelDownloadButton;
