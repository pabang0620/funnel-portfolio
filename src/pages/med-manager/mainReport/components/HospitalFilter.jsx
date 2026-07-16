import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  getHospitals,
  getCohortList,
  getHospitalInfo,
} from "@/data/med-manager/mockService";

const HospitalFilter = ({
  loginUser,
  selectedHospital,
  setSelectedHospital,
  setName,
  setCohortList,
  setSelectedCohort,
  setCustomDateRange,
  setDateSelectionMode,
  // 매체 관련
  mediaOptions = [],
  main_media,
  setMain_media,
  sub_media,
  setSub_media,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const hospitals = getHospitals();
    setHospitalOptions(hospitals || []);
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 병원 목록 필터링
  const filteredHospitals = useMemo(() => {
    let hospitals = hospitalOptions;

    if (loginUser?.role === 6 && loginUser?.hospital_name_ids) {
      const hospitalIds = Array.isArray(loginUser.hospital_name_ids)
        ? loginUser.hospital_name_ids
        : loginUser.hospital_name_ids.split(',').map((id) => parseInt(id.trim()));

      hospitals = hospitals.filter((hospital) =>
        hospitalIds.includes(hospital.id)
      );
    }

    return hospitals.filter((hospital) =>
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [hospitalOptions, searchTerm, loginUser]);

  const handleDropdownClick = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const fetchHospitalData = () => {
      if (selectedHospital === "전체") {
        setCohortList([]);
        return;
      }

      if (!selectedHospital || typeof selectedHospital !== 'number') {
        setCohortList([]);
        return;
      }

      // 병원 이름 설정
      if (hospitalOptions.length > 0) {
        const hospital = hospitalOptions.find((h) => h.id === selectedHospital);
        if (hospital) {
          setName(hospital.name);
        }
      }

      // 병원 저장된 기수, 매체 가져오기 (mock)
      const info = getHospitalInfo(selectedHospital);
      if (info) {
        setSelectedCohort(info.cohort ?? null);
        setMain_media(info.main_media || []);
        setSub_media(info.sub_media || []);
      }

      // 기수 목록 가져오기 (mock)
      const cohortData = getCohortList(selectedHospital);
      setCohortList(cohortData || []);

      // role 5 또는 6인 경우, 최근 기수 날짜 자동 설정
      if ((loginUser?.role === 5 || loginUser?.role === 6) && cohortData && cohortData.length > 0) {
        const latestCohort = cohortData[0];
        if (latestCohort && latestCohort.start_date && latestCohort.end_date) {
          setCustomDateRange({
            startDate: latestCohort.start_date,
            endDate: latestCohort.end_date,
          });
          setDateSelectionMode("cohort");
        }
      }
    };

    fetchHospitalData();
  }, [selectedHospital, hospitalOptions, loginUser]);

  const handleOptionClick = useCallback((hospital) => {
    if (hospital.id === selectedHospital) {
      setIsDropdownOpen(false);
      return;
    }

    setIsDropdownOpen(false);
    setSearchTerm("");
    setName(hospital.name || "병원을 선택해주세요.");

    setSelectedHospital(hospital.id);
    setSelectedCohort(null);
    setMain_media([]);
    setSub_media([]);
    setCustomDateRange({ startDate: null, endDate: null });
    setDateSelectionMode(null);
  }, [selectedHospital, setName, setSelectedHospital, setSelectedCohort, setMain_media, setSub_media, setCustomDateRange, setDateSelectionMode]);

  const getHospitalName = useMemo(() => {
    if (selectedHospital === "전체") {
      return "전체";
    }
    if (hospitalOptions.length > 0 && selectedHospital) {
      const hospital = hospitalOptions.find((h) => h.id === selectedHospital);
      return hospital ? hospital.name : "병원을 선택해주세요.";
    }
    return "병원을 선택해주세요.";
  }, [hospitalOptions, selectedHospital]);

  return (
    <div className="hospital-filter" ref={dropdownRef}>
      <div
        className={`hospital-custom-select ${
          loginUser?.role === 5 ? "disabled" : ""
        }`}
        onClick={
          loginUser?.role === 5
            ? undefined
            : handleDropdownClick
        }
      >
        {getHospitalName}
        {loginUser?.role !== 5 && (
          <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
        )}
      </div>

      {isDropdownOpen && (
        <ul className="custom-options">
          <li className="search-input-wrapper">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="병원 검색..."
              className="hospital-search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </li>
          {loginUser?.role !== 6 && (
            <li
              key="all-hospitals"
              onClick={() =>
                handleOptionClick({ id: "전체", name: "전체" })
              }
              className={`option-item ${
                selectedHospital === "전체" ? "selected" : ""
              }`}
            >
              전체
            </li>
          )}
          {filteredHospitals.map((hospital) => (
            <li
              key={hospital.id}
              onClick={() => handleOptionClick(hospital)}
              className={`option-item ${
                selectedHospital === hospital.id ? "selected" : ""
              }`}
            >
              {hospital.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HospitalFilter;
