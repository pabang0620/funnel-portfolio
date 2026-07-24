// 1. React 및 React 내장 훅 (가장 먼저 로드)
import React, { useCallback } from "react";

// 2. 외부 라이브러리
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons";

// 엑셀 다운로드 컴포넌트
const ExcelTemp = React.memo(({ excelFetchData, filters }) => {
  const exportToExcel = useCallback(async () => {
    const excelCustomer_db = await excelFetchData(filters);

    if (!excelCustomer_db || excelCustomer_db.length === 0) {
      alert("다운로드할 No data.");
      return;
    }

    const formattedData = excelCustomer_db.map((customer) => ({
      병원명: customer.hospital_name,
      매체: customer.advertising_company,
      광고제목: customer.ad_title,
      이벤트명: customer.event_name,
      이름: customer.name,
      번호: customer.phone,
      ip: customer.ip,
      일자: new Date(customer.date).toISOString().replace("T", " ").slice(0, 19),
      설문: customer.customer_option || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer_db");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "customer_db.xlsx");
  }, [excelFetchData, filters]);

  return (
    <button className="excel-download-button" onClick={exportToExcel}>
      <FontAwesomeIcon icon={faFileArrowDown} />
      <span>엑셀 다운로드</span>
    </button>
  );
});

export default ExcelTemp;
