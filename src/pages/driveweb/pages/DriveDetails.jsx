import React, { useEffect, useState } from "react";
import { getDriveDetails } from "../utils/api";
import translateKey from "../utils/translateKey";

const DriveDetails = ({ showModal, closeModal, drivingLogId }) => {
  const [details, setDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("drive");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getDriveDetails(drivingLogId);
        setDetails(data);
      } catch (error) {
        console.error("Error fetching drive details:", error);
      }
    };

    if (showModal) {
      fetchDetails();
    }
  }, [showModal, drivingLogId]);

  if (!showModal || !details) {
    return null;
  }

  const filterZeroValues = (obj) => {
    const filtered = {};
    for (const key in obj) {
      if (
        obj[key] !== 0 &&
        obj[key] !== "0" &&
        obj[key] !== null &&
        !["id", "driving_log_id", "created_at", "updated_at", "userId"].includes(key)
      ) {
        filtered[key] = obj[key];
      }
    }
    return filtered;
  };

  const daysOfWeek = {
    Sunday: "일요일",
    Monday: "월요일",
    Tuesday: "화요일",
    Wednesday: "수요일",
    Thursday: "목요일",
    Friday: "금요일",
    Saturday: "토요일",
  };

  const renderTabContent = () => {
    if (activeTab === "drive") {
      if (!details.driving_records || details.driving_records.length === 0) {
        return <div className="tabContent">운행 기록이 없습니다.</div>;
      }
      const {
        start_time,
        end_time,
        working_hours,
        driving_distance,
        fuel_amount,
        total_driving_cases,
        fuel_efficiency,
        business_rate,
        day_of_week,
        business_distance,
      } = details.driving_records[0];
      return (
        <div className="tabContent">
          <div className="dataRow">
            <strong>작성 날짜:</strong>
            <span>{daysOfWeek[day_of_week]}</span>
            <span>{details.date.split("T")[0]}</span>
          </div>
          <div className="dataRow">
            <strong>시작 시간:</strong> <span>{start_time}</span>
          </div>
          <div className="dataRow">
            <strong>종료 시간:</strong> <span>{end_time}</span>
          </div>
          <div className="dataRow">
            <strong>근무 시간:</strong>
            <span>{new Date(working_hours).getUTCHours()} 시간</span>
          </div>
          <div className="dataRow">
            <strong>주행 거리:</strong> <span>{driving_distance} km</span>
          </div>
          <div className="dataRow">
            <strong>영업 거리:</strong> <span>{business_distance} km</span>
          </div>
          <div className="dataRow">
            <strong>주유량:</strong> <span>{fuel_amount} L</span>
          </div>
          <div className="dataRow">
            <strong>총 운행 수:</strong> <span>{total_driving_cases} 회</span>
          </div>
          <div className="dataRow">
            <strong>연비:</strong> <span>{fuel_efficiency} km/L</span>
          </div>
          <div className="dataRow">
            <strong>영업률:</strong> <span>{business_rate} %</span>
          </div>
          <div className="dataRow">
            <strong>메모:</strong> <span>{details.memo}</span>
          </div>
        </div>
      );
    }

    if (activeTab === "income") {
      const filteredIncome = filterZeroValues(details.income_records);
      if (Object.keys(filteredIncome).length === 0) {
        return <div className="tabContent">수입이 없습니다.</div>;
      }
      return (
        <div className="tabContent">
          {filteredIncome &&
            Object.keys(filteredIncome).map((key) => (
              <div className="dataRow" key={key}>
                <strong>{translateKey(key)}:</strong>
                <span>{filteredIncome[key]} 원</span>
              </div>
            ))}
        </div>
      );
    }

    if (activeTab === "expense") {
      const filteredExpense = filterZeroValues(details.expense_records);
      if (Object.keys(filteredExpense).length === 0) {
        return <div className="tabContent">지출이 없습니다.</div>;
      }
      return (
        <div className="tabContent">
          {filteredExpense &&
            Object.keys(filteredExpense).map((key) => (
              <div className="dataRow" key={key}>
                <strong>{translateKey(key)}:</strong>
                <span>{filteredExpense[key]} 원</span>
              </div>
            ))}
        </div>
      );
    }
  };

  return (
    <div className="driveModal" style={{ display: showModal ? "flex" : "none" }}>
      <div className="modalInner">
        <div className="modalHeader">
          <h3>
            <span>상세 운행일지</span>
          </h3>
          <span className="close" onClick={() => closeModal(false)}>
            &times;
          </span>
        </div>
        <div className="tabs">
          <button
            className={activeTab === "drive" ? "active" : ""}
            onClick={() => setActiveTab("drive")}
          >
            운행
          </button>
          <button
            className={activeTab === "income" ? "active" : ""}
            onClick={() => setActiveTab("income")}
          >
            수입
          </button>
          <button
            className={activeTab === "expense" ? "active" : ""}
            onClick={() => setActiveTab("expense")}
          >
            지출
          </button>
        </div>
        <div className="modalContent">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default DriveDetails;
