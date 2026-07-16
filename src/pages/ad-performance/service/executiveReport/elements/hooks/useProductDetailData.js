import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PRODUCTS } from "../utils/constants";
import { getCurrentMonthRange } from "../utils/dateUtils";

/**
 * ProductDetail 페이지의 상태 관리 훅
 * 모든 필터 선택, 날짜 범위, 제품 선택 등을 관리
 */
const useProductDetailData = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [revenueData, setRevenueData] = useState(null);

  const [customDateRange, setCustomDateRange] = useState(() => {
    // localStorage에서 저장된 날짜 범위 불러오기
    const savedDateRange = localStorage.getItem("executive-report-date-range");
    if (savedDateRange) {
      return JSON.parse(savedDateRange);
    }
    // 기본값: 현재 달의 첫날~마지막날
    return getCurrentMonthRange();
  });

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    // localStorage에서 저장된 기간 불러오기
    const savedPeriod = localStorage.getItem("executive-report-selected-period");
    if (savedPeriod) {
      return savedPeriod;
    }
    // 기본값: 현재 달
    const today = new Date();
    return `${today.getMonth() + 1}월`;
  });

  const [showChannelDetail, setShowChannelDetail] = useState(false);

  const [selectedChannels, setSelectedChannels] = useState(() => {
    // 로컬스토리지에서 저장된 판매처 선택값 불러오기
    const savedChannels = localStorage.getItem("executive-report-channels");
    return savedChannels ? JSON.parse(savedChannels) : ["카페24", "쿠팡"];
  });

  const [selectedMedia, setSelectedMedia] = useState(() => {
    // 로컬스토리지에서 저장된 매체 선택값 불러오기
    const savedMedia = localStorage.getItem("executive-report-media");
    // 저장된 값이 없으면 모든 매체 선택
    return savedMedia ? JSON.parse(savedMedia) : ["구글", "메타", "틱톡", "GFA", "쿠팡", "네이버SA"];
  });

  // 사용자 역할 불러오기
  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
  }, []);

  // URL 파라미터에서 제품 자동 선택
  useEffect(() => {
    const productFromUrl = searchParams.get('product');
    if (productFromUrl && PRODUCTS.includes(productFromUrl)) {
      setSelectedProduct([productFromUrl]);
    }
  }, [searchParams]);

  // "전체" 선택 시 판매 실적 현황으로 이동
  useEffect(() => {
    if (selectedProduct.length > 0 && selectedProduct[0] === "전체") {
      navigate('/executive-report');
    }
  }, [selectedProduct, navigate]);

  // 날짜 범위 변경 시 localStorage에 저장
  useEffect(() => {
    if (customDateRange.startDate && customDateRange.endDate) {
      localStorage.setItem("executive-report-date-range", JSON.stringify(customDateRange));
    }
  }, [customDateRange]);

  // 기간 선택 변경 시 localStorage에 저장
  useEffect(() => {
    if (selectedPeriod) {
      localStorage.setItem("executive-report-selected-period", selectedPeriod);
    }
  }, [selectedPeriod]);

  // 판매처 선택 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("executive-report-channels", JSON.stringify(selectedChannels));
  }, [selectedChannels]);

  // 매체 선택 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("executive-report-media", JSON.stringify(selectedMedia));
  }, [selectedMedia]);

  const isAdmin = userRole === "S"; // S(임원)만 관리자 기능

  return {
    userRole,
    isAdmin,
    selectedProduct,
    setSelectedProduct,
    revenueData,
    setRevenueData,
    customDateRange,
    setCustomDateRange,
    selectedPeriod,
    setSelectedPeriod,
    showChannelDetail,
    setShowChannelDetail,
    selectedChannels,
    setSelectedChannels,
    selectedMedia,
    setSelectedMedia,
  };
};

export default useProductDetailData;
