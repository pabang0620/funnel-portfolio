import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import "./ExcelUpload.css";

const ExcelUpload = ({
  id = "excel-upload",
  accept = ".xlsx,.xls",
  onFileChange,
  className = "",
  mainText = "엑셀 파일 업로드",
  subText = "xlsx, xls 파일만 업로드 가능",
  multiple = false
}) => {
  return (
    <div className={`excel-upload-area ${className}`}>
      <input
        type="file"
        accept={accept}
        className="excel-upload-input"
        id={id}
        onChange={onFileChange}
        multiple={multiple}
      />
      <label htmlFor={id} className="excel-upload-label">
        <div className="excel-upload-icon">
          <FontAwesomeIcon icon={faFileExcel} />
        </div>
        <div>
          <div className="excel-upload-text">{mainText}</div>
          <div className="excel-upload-subtext">{subText}</div>
        </div>
      </label>
    </div>
  );
};

export default ExcelUpload;