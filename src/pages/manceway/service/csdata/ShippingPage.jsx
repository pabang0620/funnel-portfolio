import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import Layout from '../../components/Layout';
import './CSData.css';
import ShippingDashboard from './elements/ShippingDashboard';
import ShippingTable from './elements/ShippingTable';
import ShippingPagination from './elements/ShippingPagination';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const CSShippingPage = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: ''
  });

  // 데이터 조회 함수
  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };

      // 빈 값 제거
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await axios.get(`${API_BASE_URL}/api/csData/shipping`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setData(response.data.data.list);
        setPagination(response.data.data.pagination);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('출고 데이터 조회 실패:', error);
      alert('출고 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchData();
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    fetchData(newPage);
  };

  // 검색 핸들러
  const handleSearch = () => {
    fetchData(1);
  };

  // 필터 초기화
  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      search: ''
    });
    // 초기화 후 데이터 다시 로드
    setTimeout(() => {
      fetchData(1);
    }, 100);
  };

  return (
    <Layout>
      <div className="cs-data-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <div className="breadcrumb-container">
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item">
                <span className="breadcrumb-link">
                  CS 관리
                </span>
                <span className="breadcrumb-separator">
                  <FontAwesomeIcon icon={faAngleRight} />
                </span>
              </li>
              <li className="breadcrumb-item">
                <span className="breadcrumb-link">
                  출고 관리
                </span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Dashboard */}
        <ShippingDashboard stats={stats} />

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-row">
            <div className="filter-item">
              <label>시작일</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="filter-item">
              <label>종료일</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="filter-item">
              <label>상품명 검색</label>
              <input
                type="text"
                placeholder="상품명 입력"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="filter-actions">
              <button className="btn-search" onClick={handleSearch}>
                검색
              </button>
              <button className="btn-reset" onClick={handleReset}>
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="data-section">
          <ShippingTable data={data} loading={loading} />
        </div>

        {/* Pagination */}
        <ShippingPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </Layout>
  );
};

export default CSShippingPage;
