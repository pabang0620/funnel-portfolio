// 1. React 및 React 내장 훅 (가장 먼저 로드)
import React, { useEffect, useState, useCallback } from "react";

// mock service
import { getDuplicateData } from "@/data/portfolio-solution/mockService";

// 중복 데이터 모달 컴포넌트 - IP/전화번호 중복 데이터 표시
const DuplicateModal = React.memo(({ duplicateModalHandler, isDuplicateValue }) => {
  const [duplicateData, setDuplicateData] = useState([]);

  const getFieldType = useCallback((value) => {
    if (value.includes(".")) {
      return { field: "ip", value };
    } else {
      return { field: "phone", value };
    }
  }, []);

  const fetchDuplicateData = useCallback(() => {
    const fieldType = getFieldType(isDuplicateValue);
    if (!fieldType) return;

    const result = getDuplicateData(fieldType.field, fieldType.value);
    if (result.success && Array.isArray(result.data)) {
      setDuplicateData(result.data);
    } else {
      setDuplicateData([]);
    }
  }, [isDuplicateValue, getFieldType]);

  useEffect(() => {
    if (isDuplicateValue) {
      fetchDuplicateData();
    }
  }, [isDuplicateValue, fetchDuplicateData]);

  return (
    <div className="duplicate-modal-overlay" onClick={duplicateModalHandler}>
      <div
        className="duplicate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="duplicate-modal-close"
          onClick={duplicateModalHandler}
        >
          &times;
        </button>
        <h2 className="duplicate-modal-title">중복된 데이터 목록</h2>
        <table className="duplicate-modal-table">
          <thead>
            <tr>
              <th>병원 이름</th>
              <th>광고 회사</th>
              <th>광고 제목</th>
              <th>이벤트 이름</th>
              <th>이름</th>
              <th>전화번호</th>
              <th>IP</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            {duplicateData.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.hospital_name}</td>
                <td>{customer.advertising_company}</td>
                <td>{customer.ad_title}</td>
                <td>{customer.event_name}</td>
                <td>{customer.name}</td>
                <td>{customer.phone ? customer.phone.split("T")[0] : ""}</td>
                <td>{customer.ip}</td>
                <td>{customer.date ? customer.date.split(".")[0] : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .duplicate-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .duplicate-modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          width: 1200px;
          max-width: 90%;
          position: relative;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          overflow-y: auto;
          max-height: 80vh;
        }
        .duplicate-modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 20px;
          background: none;
          border: none;
          cursor: pointer;
        }
        .duplicate-modal-title {
          margin: 0 0 20px;
          font-size: 1.5em;
          text-align: center;
        }
        .duplicate-modal-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .duplicate-modal-table th,
        .duplicate-modal-table td {
          border: 1px solid #cfcfcf;
          text-align: center;
          height: auto;
          min-height: 20px;
        }
        .duplicate-modal-table thead {
          background: #3b82f6;
        }
        .duplicate-modal-table thead th {
          color: #ffffff;
          font-size: 14px;
          padding: 4px 6px;
        }
        .duplicate-modal-table tbody tr td {
          font-size: 12px;
          color: #646464;
          letter-spacing: -0.48px;
          padding: 4px 2px;
          word-break: break-word;
          position: relative;
        }
        .duplicate-modal-table tbody tr td:first-of-type {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
});

export default DuplicateModal;
