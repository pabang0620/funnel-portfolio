// 1. React 및 React 내장 훅 (가장 먼저 로드)
import React, { useEffect, useState, useCallback, useMemo } from "react";

// 2. React Router 등 React 생태계 라이브러리
import { useLocation } from "react-router-dom";

// 3. 외부 라이브러리
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

// 4. mock service (axios 대체)
import {
  searchCustomers,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
} from "@/data/med-manager/mockService";

// 5. 내부 컴포넌트
import FilterComponent from "./components/FilterComponent";
import AccordionComponent from "./components/AccordionComponent";
import StatCard from "./components/StatCard";
import DeleteButton from "./components/DeleteButton";
import DuplicateModal from "./components/DuplicateModal";
import ExcelTemp from "./components/ExcelTemp";
import DeleteBox from "./components/DeleteBox";
import Spinner from "../shared/Spinner";

// 6. constants (인라인 — 파일이 같은 폴더에 없으므로)
const BRAND_COLORS = {
  '카카오': '#FEE500',
  '구글': '#4285F4',
  '페이스북': '#1877F2',
  'Meta': '#1877F2',
  '인스타그램': '#E4405F',
  '유튜브': '#FF0000',
  '네이버': '#03C75A',
};
const FALLBACK_COLORS = [
  "#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ef4444", "#84cc16", "#f97316", "#3b82f6",
];
const getCompanyColor = (companyName, index) => {
  if (BRAND_COLORS[companyName]) return BRAND_COLORS[companyName];
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

// 7. CSS
import "./index.css";

// 데모용 로그인 사용자 (항상 관리자)
const DEMO_LOGIN_USER = { name: '관리자', role: 1 };

// 고객 데이터 페이지 - DB 리스트 관리
const CustomerDbPage = React.memo(() => {
  const loginUser = DEMO_LOGIN_USER;
  // get_status=1: 정상, 0: 휴지통
  const get_status = 1;

  const [datePickerStatus, setDatePickerStatus] = useState(false);
  const [isMediaSliderOpen, setIsMediaSliderOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [customer_db, setCustomer_db] = useState([]);

  const [editState, setEditState] = useState({});
  const [isDuplicateModal, setIsDuplicateModal] = useState(false);
  const [isDuplicateValue, setIsDuplicateValue] = useState("");
  const [activeTrashTab, setActiveTrashTab] = useState(3);
  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [deleteBoxMessage, setDeleteBoxMessage] = useState("");
  const [pendingStatus, setPendingStatus] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCounts, setTotalCounts] = useState([]);
  const [filteredTotalCount, setFilteredTotalCount] = useState(0);
  const limit = 10;
  const [recentSettings, setRecentSettings] = useState([]);
  const [checkedCompanies, setCheckedCompanies] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const _today = new Date();
  const _month30 = new Date(); _month30.setDate(_today.getDate() - 29);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: _month30,
    endDate: _today,
  });
  const [selectedHospital, setSelectedHospital] = useState(undefined);
  const [hospital_name, sethospital_name] = useState(undefined);
  const [hospitalOptions, setHospitalOptions] = useState([]);

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [accordionComponent, setAccordionComponent] = useState(null);

  const closeCompanyDropdown = useCallback(() => {
    if (isCompanyDropdownOpen) {
      setIsCompanyDropdownOpen(false);
    }
  }, [isCompanyDropdownOpen]);

  const [urlCodeId, setUrlCodeId] = useState("");

  const [filters, setFilters] = useState({
    url_code: "",
  });

  const location = useLocation();

  const duplicateModalHandler = useCallback((value) => {
    setIsDuplicateValue(value);
    setIsDuplicateModal(!isDuplicateModal);
  }, [isDuplicateModal]);

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  // 주요 데이터 요청 useEffect
  useEffect(() => {
    if (!checkedCompanies && !newCompany) {
      setLoading(false);
      return;
    }
    fetchData(debouncedFilters);
  }, [
    currentPage,
    debouncedFilters,
    checkedCompanies,
    customDateRange.startDate,
    customDateRange.endDate,
    urlCodeId,
    newCompany,
    selectedHospital,
    activeTrashTab,
  ]);

  useEffect(() => {
    if (urlCodeId) setNewCompany("");
  }, [urlCodeId]);

  useEffect(() => {
    if (newCompany) setUrlCodeId("");
  }, [newCompany]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const adjustDateForKST = useCallback((date) => {
    const localDate = new Date(date);
    localDate.setHours(localDate.getHours() + 9);
    return localDate.toISOString();
  }, []);

  // 엑셀 데이터 받기 (mock)
  const excelFetchData = async (filterArgs = {}) => {
    const startDate = adjustDateForKST(customDateRange.startDate);
    const endDate = adjustDateForKST(customDateRange.endDate);

    const result = searchCustomers({
      ...filterArgs,
      data_status: get_status === 0 ? activeTrashTab : get_status,
      advertising_company_ids: checkedCompanies,
      newCompany: newCompany || undefined,
      startDate,
      endDate,
      url_code_setting_id: urlCodeId,
      accordionComponent: accordionComponent !== null ? accordionComponent : undefined,
      limit: 10000,
      page: 1,
    });

    return result.data?.customers || [];
  };

  const fetchData = useCallback((filterArgs = {}) => {
    const startDate = adjustDateForKST(customDateRange.startDate);
    const endDate = adjustDateForKST(customDateRange.endDate);

    setLoading(true);

    try {
      const requestData = {
        ...filterArgs,
        data_status: get_status === 0 ? activeTrashTab : get_status,
        page: currentPage,
        limit,
        advertising_company_ids: checkedCompanies,
        newCompany: newCompany || undefined,
        startDate,
        endDate,
        url_code_setting_id: urlCodeId,
        accordionComponent: accordionComponent !== null ? accordionComponent : undefined,
        selected_hospital_id: filterArgs.selected_hospital_id || selectedHospital,
        hospital_name: filterArgs.hospital_name,
      };

      const response = searchCustomers(requestData);

      if (response.success) {
        const totalData = response.data?.total || { totalCount: 0, countsByCompany: [] };
        const customer_dbData = response.data?.customers || [];
        const recentSettingsData = response.data?.recentSettings || [];

        setTotalCounts(totalData);
        setFilteredTotalCount(totalData.totalCount);
        setTotalPages(Math.ceil(totalData.totalCount / limit) || 1);
        setRecentSettings(recentSettingsData);

        if (accordionComponent !== 1) {
          setUrlCodeId("");
        }

        if (totalData.totalCount > 0) {
          setCustomer_db(
            customer_dbData.map((customer) => ({
              ...customer,
              isSelected: false,
            }))
          );
          const initialState = {};
          customer_dbData.forEach((item) => {
            initialState[item.id] = false;
          });
          setEditState(initialState);
        } else {
          setCustomer_db([]);
          setTotalPages(1);
        }
      } else {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [
    adjustDateForKST,
    customDateRange.startDate,
    customDateRange.endDate,
    get_status,
    activeTrashTab,
    currentPage,
    limit,
    checkedCompanies,
    newCompany,
    urlCodeId,
    accordionComponent,
    selectedHospital,
  ]);

  const dataFilterClean = () => {
    setNewCompany("");
    if (accordionComponent !== 1) {
      setUrlCodeId("");
    }
  };

  const handleApplyFilters = () => {
    fetchData(filters);
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleCheckboxChange = useCallback((index) => {
    setCustomer_db((prevCustomer_db) =>
      prevCustomer_db.map((customer, i) =>
        i === index
          ? { ...customer, isSelected: !customer.isSelected }
          : customer
      )
    );
  }, []);

  const handleEdit = useCallback((id) => {
    setEditState((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleInputChange = useCallback((index, field, value) => {
    setCustomer_db((prevCustomer_db) =>
      prevCustomer_db.map((customer, i) =>
        i === index ? { ...customer, [field]: value } : customer
      )
    );
  }, []);

  const handleSubmit = useCallback((index) => {
    const customer = customer_db[index];
    const result = updateCustomer(customer.id, customer);
    if (result.success) {
      setEditState((prev) => ({ ...prev, [customer.id]: false }));
    } else {
      setError(result.msg || "데이터 수정에 실패했습니다.");
    }
  }, [customer_db]);

  const handlePermanentDelete = () => {
    if (selectedCustomerIds.length > 0) {
      deleteCustomer(selectedCustomerIds);
      alert("선택한 데이터가 영구적으로 삭제되었습니다.");
      fetchData(filters);
    } else {
      alert("삭제할 데이터를 선택하세요.");
    }
  };

  const handleUpdateStatus = (status) => {
    if (selectedCustomerIds.length === 0) {
      alert("처리할 데이터를 선택하세요.");
      return;
    }

    const statusMessage =
      status === 0
        ? "현재 선택한 DB를 중복 휴지통으로 이동하시겠습니까?"
        : status === 1
          ? "현재 선택한 DB를 복원하시겠습니까?"
          : status === 2
            ? "현재 선택한 DB를 정말 삭제하시겠습니까?"
            : status === 3
              ? "현재 선택한 DB를 허수 휴지통으로 이동하시겠습니까?"
              : "알 수 없는 작업입니다.";

    setDeleteBoxMessage(statusMessage);
    setPendingStatus(status);
    setShowDeleteBox(true);
  };

  const confirmUpdateStatus = () => {
    const result = updateCustomerStatus(selectedCustomerIds, pendingStatus);
    if (result.success) {
      alert(result.msg || "처리가 완료되었습니다.");
      fetchData(filters);
      setCustomer_db(prevData =>
        prevData.map(customer => ({ ...customer, isSelected: false }))
      );
    }
    setShowDeleteBox(false);
    setPendingStatus(null);
  };

  const cancelDeleteBox = () => {
    setShowDeleteBox(false);
    setPendingStatus(null);
  };

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [checkedCompanies, urlCodeId, selectedHospital, newCompany, activeTrashTab]);

  useEffect(() => {
    setCustomer_db(prev => prev.map(c => ({ ...c, isSelected: false })));
  }, [activeTrashTab]);

  useEffect(() => {
    setCustomDateRange({
      startDate: new Date(),
      endDate: new Date(),
    });
  }, [location.pathname]);

  const isToday = useCallback((dateString) => {
    const now = new Date();
    const koreaNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const today = koreaNow.toISOString().split("T")[0];
    const inputDate = new Date(dateString).toISOString().split("T")[0];
    return today === inputDate;
  }, []);

  const companiesArray = useMemo(() => {
    return typeof checkedCompanies === "string"
      ? checkedCompanies.split(",").map((id) => parseInt(id)).filter(Boolean)
      : Array.isArray(checkedCompanies)
        ? checkedCompanies
        : [];
  }, [checkedCompanies]);

  const pageButtons = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
      .slice(
        (Math.ceil(currentPage / 10) - 1) * 10,
        Math.ceil(currentPage / 10) * 10
      );
  }, [totalPages, currentPage]);

  const selectedCustomerIds = useMemo(() => {
    return customer_db
      .filter((customer) => customer.isSelected)
      .map((customer) => customer.id);
  }, [customer_db]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("hospitalId");
    const name = params.get("hospitalName");

    if (!id) return;
    setSelectedHospital(Number(id));
    setFilters(prev => ({
      ...prev,
      hospital_name: name,
      selected_hospital_id: Number(id),
    }));
  }, [location.search]);

  return (
    <div className="DataContainer container">
      {loading && <Spinner />}
      <FilterComponent
        loginUser={loginUser}
        onFilterChange={handleFilterChange}
        handleApplyFilters={handleApplyFilters}
        checkedCompanies={checkedCompanies}
        setCheckedCompanies={setCheckedCompanies}
        companyOptions={companyOptions}
        setCompanyOptions={setCompanyOptions}
        isCompanyDropdownOpen={isCompanyDropdownOpen}
        setIsCompanyDropdownOpen={setIsCompanyDropdownOpen}
        closeCompanyDropdown={closeCompanyDropdown}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        hospitalOptions={hospitalOptions}
        setHospitalOptions={setHospitalOptions}
        selectedHospital={selectedHospital}
        setSelectedHospital={setSelectedHospital}
        hospital_name={hospital_name}
        sethospital_name={sethospital_name}
        datePickerStatus={datePickerStatus}
        setDatePickerStatus={setDatePickerStatus}
        setAccordionComponent={setAccordionComponent}
        get_status={get_status}
        handleUpdateStatus={handleUpdateStatus}
        filters={filters}
      />

      {/* 최근 설정 카드 */}
      {get_status === 1 && (
        <div className="itdependson" onClick={closeCompanyDropdown}>
          <div
            className="userSetCompany cardMarginAdded"
            style={{ position: "relative" }}
          >
            <StatCard
              key={`total-${selectedHospital}-${totalCounts?.totalCount || 0}`}
              dataFilterClean={dataFilterClean}
              label="DB 전체"
              value={
                totalCounts && totalCounts.totalCount !== undefined
                  ? totalCounts.totalCount
                  : 0
              }
            />
          </div>

          {/* 매체별 갯수 및 리스트 */}
          <div className="cardAllSetBox">
            <div className="cardAllSet" style={{ width: `${companiesArray.length * (isMobile ? 100 : 150)}px` }}>
              {companiesArray
                .map((companyId) => {
                  const company = companyOptions.find((c) => c.id === companyId);
                  if (company) {
                    const countData =
                      totalCounts && totalCounts.countsByCompany
                        ? totalCounts.countsByCompany.find(
                          (count) => count.advertising_company_id === company.id
                        )
                        : null;
                    const value = countData ? countData.count : 0;
                    return { company, value };
                  }
                  return null;
                })
                .filter(item => item !== null)
                .sort((a, b) => b.value - a.value)
                .map((item, index) => (
                  <StatCard
                    key={`company-${item.company.id}-${selectedHospital}-${item.value}`}
                    id={item.company.id}
                    label={item.company.name}
                    value={item.value}
                    newCompany={newCompany}
                    setNewCompany={setNewCompany}
                    color={getCompanyColor(item.company.name, index)}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 선택된 매체 광고 */}
      {get_status === 1 && (
        <div className="media-section" onClick={closeCompanyDropdown}>
          <div
            className="media-section-header"
            onClick={(e) => {
              e.stopPropagation();
              setIsMediaSliderOpen(!isMediaSliderOpen);
            }}
          >
            <h3>선택된 매체 광고</h3>
            <span className="toggle-icon">
              {isMediaSliderOpen ? '▲' : '▼'}
            </span>
          </div>
          {isMediaSliderOpen && (
            <AccordionComponent
              recentSettings={recentSettings}
              setUrlCodeId={setUrlCodeId}
              urlCodeId={urlCodeId}
              newCompany={newCompany}
              setAccordionComponent={setAccordionComponent}
            />
          )}
        </div>
      )}

      {/* 휴지통 탭 */}
      {get_status === 0 && (
        <div className="trash-tab-container">
          <button
            className={`trash-tab${activeTrashTab === 3 ? ' active' : ''}`}
            onClick={() => { setActiveTrashTab(3); setCurrentPage(1); }}
          >
            허수 휴지통
          </button>
          <button
            className={`trash-tab${activeTrashTab === 0 ? ' active' : ''}`}
            onClick={() => { setActiveTrashTab(0); setCurrentPage(1); }}
          >
            중복 휴지통
          </button>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="action-buttons" onClick={closeCompanyDropdown}>
        <ExcelTemp
          filters={filters}
          excelCustomer_db={[]}
          excelFetchData={excelFetchData}
        />

        {get_status === 1 && loginUser?.role !== 6 && (
          <DeleteButton handleUpdateStatus={handleUpdateStatus} />
        )}

        {get_status === 0 && (
          <>
            <button
              className="trash-delete-button"
              onClick={() => handleUpdateStatus(2)}
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>DB 삭제</span>
            </button>
            <button
              className="trash-restore-button"
              onClick={() => handleUpdateStatus(1)}
            >
              <FontAwesomeIcon icon={faRotateLeft} />
              <span>DB 복원</span>
            </button>
            {activeTrashTab === 3 && (
              <button
                className="trash-move-button"
                onClick={() => handleUpdateStatus(0)}
              >
                <span>중복 휴지통으로 이동</span>
              </button>
            )}
            {activeTrashTab === 0 && (
              <button
                className="trash-move-button"
                onClick={() => handleUpdateStatus(3)}
              >
                <span>허수 휴지통으로 이동</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* 테이블 */}
      <div className="table-wrapper">
        <table className="customer-table" onClick={closeCompanyDropdown}>
          <thead>
            <tr>
              {loginUser?.role !== 6 && (
                <th style={{ width: "4%", textAlign: "center" }}>선택</th>
              )}
              <th style={{ width: loginUser?.role === 6 ? "10%" : "4%", textAlign: "center" }}>No</th>
              <th style={{ width: "5%" }}>분배여부</th>
              <th style={{ width: "7%" }}>병원명</th>
              <th style={{ width: "5%" }}>매체</th>
              <th style={{ width: "10%" }}>광고 제목</th>
              <th style={{ width: "9%" }}>이벤트명</th>
              <th style={{ width: "7%" }}>설문</th>
              <th style={{ width: "5%" }}>이름</th>
              <th style={{ width: "8%" }}>번호</th>
              <th style={{ width: "7%" }}>ip</th>
              <th style={{ width: loginUser?.role === 6 ? "15%" : "11%" }}>일자</th>
              {loginUser?.role !== 6 && (
                <th style={{ width: "4%", textAlign: "center" }}>상태</th>
              )}
            </tr>
          </thead>
          <tbody>
            {totalPages === 0 || customer_db.length === 0 ? (
              <tr>
                <td colSpan={loginUser?.role === 6 ? 10 : 12}>
                  {checkedCompanies ? "아직 No data." : "Select a media channel to view data."}
                </td>
              </tr>
            ) : (
              customer_db.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={customer.isSelected ? "selected" : ""}
                >
                  {loginUser?.role !== 6 && (
                    <td>
                      <input
                        type="checkbox"
                        checked={customer.isSelected}
                        onChange={() => handleCheckboxChange(index)}
                        style={{ textAlign: "center" }}
                      />
                    </td>
                  )}
                  <td style={{ textAlign: "center" }}>
                    {filteredTotalCount - (currentPage - 1) * limit - index}
                    {customer.date &&
                      get_status === 1 &&
                      isToday(customer.date) && (
                        <span
                          className="newData"
                          style={loginUser?.role === 6 ? { left: "25%" } : {}}
                        >
                          new
                        </span>
                      )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="text"
                      value={customer.dividend_status ? customer.dividend_status : "N"}
                      onChange={(e) =>
                        handleInputChange(index, "dividend_status", e.target.value)
                      }
                      disabled={true}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={customer.hospital_name}
                      onChange={(e) =>
                        handleInputChange(index, "hospital_name", e.target.value)
                      }
                      disabled={true}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={customer.advertising_company}
                      onChange={(e) =>
                        handleInputChange(index, "advertising_company", e.target.value)
                      }
                      disabled={true}
                    />
                  </td>
                  <td style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="ad-title-input"
                      value={customer.ad_title}
                      onChange={(e) =>
                        handleInputChange(index, "ad_title", e.target.value)
                      }
                      disabled={true}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={customer.event_name}
                      onChange={(e) =>
                        handleInputChange(index, "event_name", e.target.value)
                      }
                      disabled={true}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={customer.customer_option || ""}
                      onChange={(e) => handleInputChange(index, "customer_option", e.target.value)}
                      disabled={true}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="name-input"
                      value={customer.name}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                      readOnly={!editState[customer.id]}
                    />
                  </td>
                  <td>
                    <input
                      className="phone-input"
                      style={{
                        color: customer.isDuplicatePhone ? "red" : "inherit",
                      }}
                      type="text"
                      value={customer.phone ? customer.phone.split("T")[0] : ""}
                      onChange={(e) =>
                        handleInputChange(index, "phone", e.target.value)
                      }
                      readOnly={!editState[customer.id]}
                      onClick={() =>
                        !editState[customer.id] &&
                        customer.isDuplicatePhone &&
                        duplicateModalHandler(
                          customer.phone ? customer.phone.split("T")[0] : ""
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={customer.ip}
                      className="ip-input"
                      style={{
                        color: customer.isDuplicateIP ? "red" : "inherit",
                        cursor: customer.isDuplicateIP ? "pointer" : "default",
                      }}
                      readOnly={true}
                      onClick={() =>
                        customer.isDuplicateIP && duplicateModalHandler(customer.ip)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={customer.date ? customer.date.split(".")[0] : ""}
                      onChange={(e) =>
                        handleInputChange(index, "date", e.target.value)
                      }
                      disabled={true}
                    />
                  </td>
                  {loginUser?.role !== 6 && (
                    <td style={{ textAlign: "center" }}>
                      {editState[customer.id] ? (
                        <button
                          className="db-list-edit-btn save-mode"
                          onClick={() => handleSubmit(index)}
                        >
                          저장
                        </button>
                      ) : (
                        <button
                          className="db-list-edit-btn"
                          onClick={() => handleEdit(customer.id)}
                        >
                          수정
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {isDuplicateModal && (
            <DuplicateModal
              duplicateModalHandler={duplicateModalHandler}
              isDuplicateValue={isDuplicateValue}
            />
          )}
          {showDeleteBox && (
            <DeleteBox
              message={deleteBoxMessage}
              pendingStatus={pendingStatus}
              onCancel={cancelDeleteBox}
              onConfirm={confirmUpdateStatus}
            />
          )}
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="pagination-btn pagination-btn-icon"
        >
          «
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn pagination-btn-icon"
        >
          ‹
        </button>
        {pageButtons.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`pagination-btn pagination-btn-number ${page === currentPage ? "pagination-btn-active" : ""}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn pagination-btn-icon"
        >
          ›
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-btn pagination-btn-icon"
        >
          »
        </button>
      </div>
    </div>
  );
});

export default CustomerDbPage;
