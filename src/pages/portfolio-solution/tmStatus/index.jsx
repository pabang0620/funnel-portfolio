import React, { useCallback, useMemo, useEffect, useState, useRef } from "react";

import TitleBox from "../shared/TitleBox";
import Spinner from "../shared/Spinner";
import Filters from "./components/filters/Filters";
import StatusCounts from "./components/table/StatusCounts";
import Search from "./components/search/Search";
import WorkStatusTable from "./components/table/WorkStatusTable";
import Pagination from "./components/Pagination";
import ExcelDownloadButton from "./components/search/ExcelDownloadButton";

import { getTmList } from "@/data/portfolio-solution/mockService";
import {
  searchList,
  columns,
  notVisitStatus,
  ITEMS_PER_PAGE,
  formatDate,
  getClassForCallHistory,
  getTodayString,
} from "./workStatus";

import "./index.css";

// 포트폴리오: 데모용 고정 로그인 사용자
const DEMO_USER = { id: 1, name: '관리자', role: 'admin' };

// Session storage utility functions
const saveToSessionStorage = (filters) => {
  const today = getTodayString();
  const data = { value: filters, date: today };
  sessionStorage.setItem("tm_workStatus_filters", JSON.stringify(data));
};

const loadFromSessionStorage = () => {
  try {
    const data = JSON.parse(sessionStorage.getItem("tm_workStatus_filters"));
    const today = getTodayString();

    if (data && data.date === today) {
      const filters = data.value;
      if (filters.selectedDate) {
        filters.selectedDate = {
          startDate: new Date(filters.selectedDate.startDate),
          endDate: new Date(filters.selectedDate.endDate),
        };
      }
      return filters;
    } else {
      sessionStorage.removeItem("tm_workStatus_filters");
      return null;
    }
  } catch (error) {
    return null;
  }
};

const WorkStatus = () => {
  const [loginUser] = useState(DEMO_USER);

  const loadedFilters = useMemo(() => {
    return loadFromSessionStorage() || {};
  }, []);

  const [currentPage, setCurrentPage] = useState(loadedFilters.currentPage || 1);
  const [selectedHospital, setSelectedHospital] = useState(loadedFilters.selectedHospital || "");
  const [selectedUserId, setSelectedUserId] = useState(loadedFilters.selectedUserId || "");
  const [selectedDate, setSelectedDate] = useState(
    loadedFilters.selectedDate || { startDate: new Date(), endDate: new Date() }
  );
  const [dateFieldType, setDateFieldType] = useState(loadedFilters.dateFieldType || "distribution_time");
  const [searchField, setSearchField] = useState(loadedFilters.searchField || "call_history");
  const [searchKeyword, setSearchKeyword] = useState(loadedFilters.searchKeyword || "");
  const [searchDateTime, setSearchDateTime] = useState(loadedFilters.searchDateTime || null);
  const [searchDateRange, setSearchDateRange] = useState(
    loadedFilters.searchDateRange || { startDate: "", endDate: "" }
  );
  const [hasActiveSearch, setHasActiveSearch] = useState(loadedFilters.hasActiveSearch || false);
  const [sortConfig, setSortConfig] = useState(loadedFilters.sortConfig || { column: null, order: null });

  const isFirstMountForSearchField = useRef(true);

  useEffect(() => {
    if (isFirstMountForSearchField.current) {
      isFirstMountForSearchField.current = false;
      return;
    }
    setSearchKeyword("");
    setSearchDateTime(null);
    setSearchDateRange({ startDate: "", endDate: "" });
    setHasActiveSearch(false);
  }, [searchField]);

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [selectedHospital, selectedUserId, selectedDate, dateFieldType]);

  // 세션스토리지 저장
  useEffect(() => {
    saveToSessionStorage({
      selectedHospital,
      selectedUserId,
      selectedDate,
      dateFieldType,
      searchField,
      searchKeyword,
      searchDateTime,
      searchDateRange,
      hasActiveSearch,
      currentPage,
      sortConfig,
    });
  }, [
    selectedHospital, selectedUserId, selectedDate, dateFieldType,
    searchField, searchKeyword, searchDateTime, searchDateRange,
    hasActiveSearch, currentPage, sortConfig,
  ]);

  // 데이터 상태 관리
  const [filteredTmList, setFilteredTmList] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    absenceCount: 0,
    cancellationsCount: 0,
    reservationCount: 0,
    todayEmptyMemosCount: 0,
    totalItems: 0,
    callProgressCount: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 포트폴리오 API 파라미터 (ExcelDownloadButton 호환)
  const apiParams = useMemo(() => ({
    hospital_id: selectedHospital,
    user_id: selectedUserId,
    date: {
      startDate: selectedDate.startDate,
      endDate: selectedDate.endDate,
    },
    dateFieldType: dateFieldType,
    itemsPerPage: ITEMS_PER_PAGE,
    sortColumn: sortConfig.column,
    sortOrder: sortConfig.order,
  }), [selectedHospital, selectedUserId, selectedDate, dateFieldType, sortConfig]);

  // 포트폴리오: mockService 호출
  const fetchFilterData = useCallback(
    (page = currentPage) => {
      setIsLoading(true);
      // 실제 앱의 API 딜레이 시뮬레이션
      setTimeout(() => {
        const result = getTmList({
          hospitalId: selectedHospital,
          userId: selectedUserId,
          startDate: selectedDate.startDate,
          endDate: selectedDate.endDate,
          page: page,
          pageSize: ITEMS_PER_PAGE,
          sortColumn: sortConfig.column,
          sortOrder: sortConfig.order,
        });

        setFilteredTmList(result.tmWithDetails);
        setStatusCounts({
          absenceCount: result.absenceCount,
          cancellationsCount: result.cancellationsCount,
          reservationCount: result.reservationCount,
          todayEmptyMemosCount: result.todayEmptyMemosCount,
          totalItems: result.totalItems,
          callProgressCount: result.callProgressCount,
        });
        setTotalPages(result.totalPages);
        setIsLoading(false);
      }, 150);
    },
    [currentPage, selectedHospital, selectedUserId, selectedDate, dateFieldType, sortConfig]
  );

  const fetchSearchData = useCallback(
    (searchParams, page = 1, overrideSearchKeyword = null) => {
      setIsLoading(true);
      setTimeout(() => {
        const result = getTmList({
          hospitalId: selectedHospital,
          userId: selectedUserId,
          startDate: selectedDate.startDate,
          endDate: selectedDate.endDate,
          searchField: searchParams.searchField,
          searchKeyword: overrideSearchKeyword !== null ? overrideSearchKeyword : searchParams.searchKeyword,
          page: page,
          pageSize: ITEMS_PER_PAGE,
          sortColumn: sortConfig.column,
          sortOrder: sortConfig.order,
        });

        setFilteredTmList(result.tmWithDetails);
        setStatusCounts({
          absenceCount: result.absenceCount,
          cancellationsCount: result.cancellationsCount,
          reservationCount: result.reservationCount,
          todayEmptyMemosCount: result.todayEmptyMemosCount,
          totalItems: result.totalItems,
          callProgressCount: result.callProgressCount,
        });
        setTotalPages(result.totalPages);
        setIsLoading(false);
      }, 150);
    },
    [selectedHospital, selectedUserId, selectedDate, dateFieldType, sortConfig]
  );

  // 초기 데이터 로딩 + 필터 변경 감지
  const isFirstMountForFilters = useRef(true);

  useEffect(() => {
    if (isFirstMountForFilters.current) {
      isFirstMountForFilters.current = false;
      if (hasActiveSearch) {
        const searchParams = { searchField, searchKeyword, searchDateTime, searchDateRange };
        fetchSearchData(searchParams, currentPage);
      } else {
        fetchFilterData(currentPage);
      }
      return;
    }
    if (hasActiveSearch) {
      const searchParams = { searchField, searchKeyword, searchDateTime, searchDateRange };
      fetchSearchData(searchParams, currentPage);
    } else {
      fetchFilterData(currentPage);
    }
  }, [
    currentPage,
    selectedHospital,
    selectedUserId,
    sortConfig,
    fetchFilterData,
    hasActiveSearch,
    fetchSearchData,
  ]);

  const memoizedFormatDate = useMemo(() => formatDate, []);
  const memoizedGetClassForCallHistory = useMemo(() => getClassForCallHistory, []);

  const paginationPages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
      .slice(
        (Math.ceil(currentPage / 10) - 1) * 10,
        Math.ceil(currentPage / 10) * 10
      );
  }, [currentPage, totalPages]);

  const userMap = useMemo(() => {
    if (!userList || userList.length === 0) return {};
    return userList.reduce((map, user) => {
      if (user.value !== 0) {
        map[user.value] = user.label;
      }
      return map;
    }, {});
  }, [userList]);

  const handleUserListUpdate = useCallback((newUserList) => {
    setUserList(newUserList);
  }, []);

  // 행 클릭 - 포트폴리오에서는 no-op (navigate 없음)
  const handleRowClick = useCallback((id) => {
    // 포트폴리오 데모: 고객 상세 페이지 이동 없음
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const handleSortChange = useCallback(
    (column) => {
      setSortConfig(prevConfig => {
        if (prevConfig.column === column) {
          if (prevConfig.order === 'asc') return { column, order: 'desc' };
          if (prevConfig.order === 'desc') return { column: null, order: null };
          return { column, order: 'asc' };
        }
        return { column, order: 'asc' };
      });
    },
    []
  );

  const handleSearch = useCallback(
    (page = 1, overrideSearchKeyword = null) => {
      setCurrentPage(1);
      setHasActiveSearch(true);
      const searchParams = { searchField, searchKeyword, searchDateTime, searchDateRange };
      fetchSearchData(searchParams, page, overrideSearchKeyword);
    },
    [fetchSearchData, searchField, searchKeyword, searchDateTime, searchDateRange]
  );

  const handleFilterChange = useCallback(
    (page = 1) => {
      fetchFilterData(page);
    },
    [fetchFilterData]
  );

  return (
    <div className="tmWorkStatus_container container">
      <TitleBox mainmenu="TM" submenu="담당자 업무 현황" />
      <Filters
        selectedHospital={selectedHospital}
        setSelectedHospital={setSelectedHospital}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        dateFieldType={dateFieldType}
        setDateFieldType={setDateFieldType}
        handleFilterChange={handleFilterChange}
        onUserListUpdate={handleUserListUpdate}
      />
      <StatusCounts statusCounts={statusCounts} />
      <div className="search-excel-container">
        <Search
          searchList={searchList}
          searchField={searchField}
          setSearchField={setSearchField}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          searchDateTime={searchDateTime}
          setSearchDateTime={setSearchDateTime}
          searchDateRange={searchDateRange}
          setSearchDateRange={setSearchDateRange}
          handleSearch={handleSearch}
          setHasActiveSearch={setHasActiveSearch}
        />
        <div className="action-buttons">
          <ExcelDownloadButton
            apiParams={apiParams}
            searchField={searchField}
            searchKeyword={searchKeyword}
            searchDateTime={searchDateTime}
            searchDateRange={searchDateRange}
            formatDate={memoizedFormatDate}
            setIsLoading={setIsLoading}
            userList={userList}
          />
        </div>
      </div>

      <div className="table-container" style={{ position: "relative" }}>
        {isLoading && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.7)", zIndex: 10 }}>
            <Spinner />
          </div>
        )}
        <WorkStatusTable
          columns={columns}
          filteredTmList={filteredTmList}
          onRowClick={handleRowClick}
          formatDate={memoizedFormatDate}
          getClassForCallHistory={memoizedGetClassForCallHistory}
          notVisitStatus={notVisitStatus}
          userMap={userMap}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          selectedDate={selectedDate}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginationPages={paginationPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default WorkStatus;
