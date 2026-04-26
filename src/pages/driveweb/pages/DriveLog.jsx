import React, { useEffect, useState } from "react";
import { getDrive } from "../utils/api";
import DriveDetails from "./DriveDetails";

const DriveLog = () => {
  const [driveLog, setDriveLog] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("date");
  const [currentModal, setCurrentModal] = useState(null);
  const [selectedLogId, setSelectedLogId] = useState(null);

  const closeModal = (showConfirm = true) => {
    if (showConfirm) {
      const response = window.confirm("닫으시겠습니까?");
      if (response) {
        setCurrentModal(null);
        setSelectedLogId(null);
      }
    } else {
      setCurrentModal(null);
      setSelectedLogId(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFieldChange = (e) => {
    setSearchField(e.target.value);
  };

  const handleSearchClick = () => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = driveLog.filter((item) => {
      const fieldValue = String(item[searchField]).toLowerCase();
      return fieldValue.includes(lowerCaseSearchTerm);
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    const getDriveData = async () => {
      try {
        const data = await getDrive();
        setDriveLog(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    getDriveData();
  }, []);

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.min(pageCount, 5); i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={currentPage === i ? "activePage" : ""}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  const handleRowClick = (drivingLogId) => {
    setSelectedLogId(drivingLogId);
    setCurrentModal("driveDetails");
  };

  return (
    <div className="container driving">
      <h2>
        운행일지 <span>조회</span>
      </h2>

      {currentModal === "driveDetails" && (
        <DriveDetails
          showModal={true}
          closeModal={closeModal}
          drivingLogId={selectedLogId}
        />
      )}

      <table className="drivingTable">
        <thead>
          <tr>
            <th>No</th>
            <th>날짜</th>
            <th>주행거리</th>
            <th>운행수익합계</th>
            <th>운행지출합계</th>
            <th>근무시간</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={item.driving_log_id} onClick={() => handleRowClick(item.driving_log_id)}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{item.date}</td>
              <td>{item.driving_distance} km</td>
              <td>{item.total_income} 원</td>
              <td>{item.total_expense} 원</td>
              <td>{item.working_hours}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setCurrentPage(1)}>«</button>
        <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}>‹</button>
        {renderPageNumbers()}
        <button onClick={() => currentPage < pageCount && setCurrentPage(currentPage + 1)}>›</button>
        <button onClick={() => setCurrentPage(pageCount)}>»</button>
      </div>
      <div className="search">
        <select value={searchField} onChange={handleFieldChange}>
          <option value="date">날짜</option>
          <option value="driving_distance">주행거리</option>
          <option value="total_income">운행수익합계</option>
          <option value="total_expense">운행지출합계</option>
          <option value="working_hours">근무시간</option>
        </select>
        <input
          type="text"
          placeholder={`${searchField === "date" ? "날짜로 검색" : "검색어 입력"}`}
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={handleSearchClick}>검색</button>
      </div>

    </div>
  );
};

export default DriveLog;
