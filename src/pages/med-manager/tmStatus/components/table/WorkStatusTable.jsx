import React, { useState, useCallback } from "react";
import "./WorkStatusTable.css";

const WorkStatusTable = React.memo(({
  columns,
  filteredTmList,
  onRowClick,
  formatDate,
  getClassForCallHistory,
  notVisitStatus,
  userMap,
  sortConfig,
  onSortChange,
  selectedDate,
}) => {

  const handleSortChange = useCallback((column) => {
    if (onSortChange) {
      onSortChange(column);
    }
  }, [onSortChange]);

  const isToday = useCallback((dateString) => {
    if (!dateString) return false;
    const today = new Date().toLocaleDateString('en-CA');
    const targetDate = dateString.slice(0, 10);
    return today === targetDate;
  }, []);

  const formatDateOnly = useCallback((dateString) => {
    if (!dateString) return "";
    return dateString.slice(0, 10);
  }, []);

  return (
    <table className="tm_table">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>
              <div className="sortable-header" onClick={() => handleSortChange(column)}>
                <span>{column}</span>
                <div className="sort-arrows">
                  <span
                    className={`sort-arrow ${sortConfig.column === column && sortConfig.order === 'asc' ? 'active' : ''}`}
                  >
                    ▲
                  </span>
                  <span
                    className={`sort-arrow ${sortConfig.column === column && sortConfig.order === 'desc' ? 'active' : ''}`}
                  >
                    ▼
                  </span>
                </div>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredTmList && filteredTmList.length > 0 ? (
          filteredTmList.map((tm, index) => {
            return (
              <tr
                key={`${tm.customer_id}-${index}`}
                onDoubleClick={() => onRowClick && onRowClick(tm.customer_id)}
                style={{ cursor: "pointer" }}
              >
                <td className="call-progress-cell">
                  {tm.call_memo_updated_at ? (
                    <span className={isToday(tm.call_memo_updated_at) ? "progress-indicator" : "progress-indicator-no"}>
                      {formatDateOnly(tm.call_memo_updated_at)}
                    </span>
                  ) : (
                    <span className="progress-indicator-no">-</span>
                  )}
                </td>
                <td>
                  <span
                    className={`default-status ${getClassForCallHistory(
                      tm.call_history,
                      tm.isNewStatus
                    )}`}
                  >
                    {tm.call_history || "-"}
                  </span>
                </td>
                <td
                  className={`visit-status ${
                    !tm.visit_status
                      ? "empty-status"
                      : notVisitStatus.includes(tm.visit_status)
                      ? "notvisit-status"
                      : ""
                  }`}
                >
                  {tm.visit_status || ""}
                </td>
                <td>{tm.hospital_name}</td>
                <td>{formatDate(tm.date)}</td>
                <td>{tm.name}</td>
                <td>{tm.phone}</td>
                <td>{tm.advertising_company_name}</td>
                <td>{formatDate(tm.follow_up_time)}</td>
                <td>{formatDate(tm.reservation_date)}</td>
                <td>{userMap[tm.user_id] || "-"}</td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td
              colSpan={columns.length}
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#666",
              }}
            >
              No data.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
});

export default WorkStatusTable;
