import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
import CustomSelect from "../../components/ui/CustomSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import RecentHistory from "./elements/RecentHistory";
import OperationTable from "./elements/OperationTable";
import HistoryDetailModal from "./elements/HistoryDetailModal";
import AlertModal from "../../components/ui/AlertModal";
import {
  getOperationData,
  getProducts,
  getMedias,
  getTeams,
  toggleOperationStatus,
  getOperationHistory,
  canEditTeamData,
  getStatusText,
} from "../../api/mediaOperationsService";
import { initialTeams, initialTeamDetails } from "./mockData";
import { useStickyTableHeader } from "./hooks/useStickyTableHeader";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../contexts/AuthContext";
import PermissionWrapper from "../../components/PermissionWrapper";
import "./MediaOperations.css";

function MediaOperations() {
  const { userRole, userTeam, parentTeam } = useAuth();

  // 권한 관리
  const {
    hasPermission,
    isLoading: permissionsLoading,
    roleCode
  } = usePermissions("media-operations");

  const isAdmin = roleCode === "S";
  const canSelectAllTeams = isAdmin || roleCode === "A"; // S, A 등급만 모든 팀 선택 가능

  // Sticky 테이블 헤더 활성화
  useStickyTableHeader();

  // 데이터 상태
  const [products, setProducts] = useState([]);
  const [medias, setMedias] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamSpecialOptions, setTeamSpecialOptions] = useState({});
  const [mediaSpecialOptions, setMediaSpecialOptions] = useState({});
  const [operationData, setOperationData] = useState({});
  const [historyLogs, setHistoryLogs] = useState([]);
  const [teamMediaPermissions, setTeamMediaPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // 필터 상태
  const [selectedTeams, setSelectedTeams] = useState([]); // 초기값은 빈 배열 (loadInitialData에서 설정)
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedMedias, setSelectedMedias] = useState(["전체"]); // 기본적으로 "전체" 선택

  // Alert 모달 상태
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  // 히스토리 상세보기 모달 상태
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 데이터 로딩
  useEffect(() => {
    loadInitialData();
  }, []);

  // 팀별 매체 권한 데이터 로드
  const loadTeamMediaPermissions = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/api/team-media-management/teams`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch team media permissions');
        return {};
      }
      
      const responseData = await response.json();
      const teams = responseData?.data || [];
      const permissions = {};
      
      if (!Array.isArray(teams) || teams.length === 0) {
        console.warn('No team data received for media permissions');
        return {};
      }
      
      // 모든 팀 (부모팀 + 자식팀)에서 권한 데이터 수집
      for (const parentTeam of teams) {
        if (parentTeam && parentTeam.name) {
          permissions[parentTeam.name] = parentTeam.mediaIds || [];
          
          // 자식팀들도 추가
          if (Array.isArray(parentTeam.children)) {
            for (const childTeam of parentTeam.children) {
              if (childTeam && childTeam.name) {
                permissions[childTeam.name] = childTeam.mediaIds || [];
              }
            }
          }
        }
      }
      
      return permissions;
    } catch (error) {
      console.error('Error loading team media permissions:', error);
      return {};
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // 1단계: 기본 리스트 로딩 (제품, 매체, 팀)
      const [productsResponse, mediasResponse, teamsResponse] =
        await Promise.all([getProducts(), getMedias(), getTeams()]);

      const productsData = productsResponse.data;
      const mediasData = mediasResponse.data;
      const teamsData = teamsResponse.data;

      setProducts(productsData);
      setMedias(mediasData.medias);
      setMediaSpecialOptions(mediasData.specialOptions);
      setTeams(teamsData.teams);
      setTeamSpecialOptions(teamsData.specialOptions);

      // 초기 필터 설정
      setSelectedProducts(productsData.map((p) => p.id));

      // 초기 팀 선택: B, C 등급은 자기 팀만, S, A 등급은 전체
      if (canSelectAllTeams) {
        // S, A 등급: 전체 선택
        setSelectedTeams(teamsData.specialOptions.전체 || ["전체"]);
      } else {
        // B, C 등급: 자기 팀만 선택 (세부팀이 있으면 세부팀, 없으면 부모팀)
        if (userTeam) {
          setSelectedTeams([userTeam]);
        } else if (parentTeam) {
          setSelectedTeams([parentTeam]);
        } else {
          // 팀 정보가 없으면 빈 배열
          setSelectedTeams([]);
        }
      }

      // 초기 매체 선택: 전체
      setSelectedMedias(mediasData.specialOptions.전체 || ["전체"]);

      // 팀별 매체 권한 데이터 로드
      const permissions = await loadTeamMediaPermissions();
      setTeamMediaPermissions(permissions);

      // 2단계: 운영 데이터 로딩 (실패해도 기본 리스트는 표시됨)
      try {
        const [operationResponse, historyResponse] = await Promise.all([
          getOperationData(),
          getOperationHistory(),
        ]);
        setOperationData(operationResponse.data);
        setHistoryLogs(historyResponse.data);
      } catch (operationError) {
        console.log(
          "운영 데이터 로딩 실패 (정상 - 아직 테이블 없음):",
          operationError.message
        );
        setOperationData({});
        setHistoryLogs([]);
      }
    } catch (error) {
      console.error("기본 데이터 로딩 실패:", error);
      // 에러 처리 (토스트 메시지 등)
    } finally {
      setLoading(false);
    }
  };

  // 제품 선택/해제 핸들러
  const handleProductToggle = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // 매체 선택 변경 핸들러 (팀과 동일한 방식)
  const handleMediaSelectionChange = (newSelectedMedias) => {
    setSelectedMedias(newSelectedMedias);
  };

  // 필터링된 제품 목록 (메모이제이션)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => selectedProducts.includes(p.id));
  }, [products, selectedProducts]);

  // 필터링된 매체 목록 (테이블용 - 세부매체만, 객체 배열 반환, 메모이제이션)
  const filteredMediasForTable = useMemo(() => {
    if (medias.length === 0) return []; // 데이터 로딩 중에는 빈 배열 반환

    // 부모매체를 제외하고 세부매체만 반환
    const detailMedias = medias.filter(
      (media) => media.name !== "전체" && media.parentId !== null
    );

    // "전체"가 선택된 경우 모든 세부매체 반환
    if (selectedMedias.includes("전체")) {
      return detailMedias;
    }

    // 개별 선택된 매체 중 세부매체만 필터링하여 반환
    return detailMedias.filter((media) => selectedMedias.includes(media.name));
  }, [medias, selectedMedias]);

  // 필터링된 팀 목록 (테이블용 - 세부팀 + 자식팀이 없는 부모팀, 메모이제이션)
  const filteredTeamsForTable = useMemo(() => {
    if (teams.length === 0) return []; // 데이터 로딩 중에는 빈 배열 반환

    // 표시 가능한 팀: 세부팀 + 자식팀이 없는 부모팀
    const displayableTeams = teams.filter((team) => {
      if (team.name === "전체") return false;

      // 자식팀인 경우 (parentId가 있음)
      if (team.parentId !== null) return true;

      // 부모팀인 경우: 자식팀이 없으면 표시
      const hasChildren = teams.some((t) => t.parentId === team.id);
      return !hasChildren;
    });

    // "전체"가 선택된 경우 모든 표시 가능한 팀 반환
    if (selectedTeams.includes("전체")) {
      return displayableTeams.map((team) => team.name);
    }

    // 개별 선택된 팀 중 표시 가능한 팀만 필터링하여 반환
    return selectedTeams.filter((teamName) =>
      displayableTeams.some((team) => team.name === teamName)
    );
  }, [teams, selectedTeams]);

  // 필터링된 히스토리 로그 (B/C 등급은 자기 팀만, S/A 등급은 전체)
  const filteredHistoryLogs = useMemo(() => {
    if (!historyLogs || historyLogs.length === 0) return [];

    // S/A 등급은 모든 로그 표시
    if (canSelectAllTeams) {
      return historyLogs;
    }

    // B/C 등급: 자기 팀 것만 필터링
    const myTeam = userTeam || parentTeam;
    if (!myTeam) return [];

    return historyLogs.filter((log) => log.team === myTeam);
  }, [historyLogs, canSelectAllTeams, userTeam, parentTeam]);

  // 상태 토글 핸들러 (ID 기반)
  const handleStatusClick = async (
    productId,
    mediaId,
    teamDetail,
    currentStatus
  ) => {
    // 권한 체크 1: status-edit 권한 (C등급 거부)
    const canEdit = isAdmin || hasPermission('media-operations_status-edit_status-edit');
    if (!canEdit) {
      setAlertModal({
        isOpen: true,
        message: "상태를 변경할 권한이 없습니다.",
        onConfirm: () =>
          setAlertModal({ isOpen: false, message: "", onConfirm: null }),
      });
      return;
    }

    // 권한 체크 2: 팀별 제한 (A/B등급은 본인 팀만, S등급은 모든 팀)
    if (!isAdmin && !canEditTeamData(teamDetail)) {
      setAlertModal({
        isOpen: true,
        message: "해당 팀의 데이터를 수정할 권한이 없습니다.",
        onConfirm: () =>
          setAlertModal({ isOpen: false, message: "", onConfirm: null }),
      });
      return;
    }

    // 상태 결정: null/undefined → "운영중", "운영중" → "중단됨", "중단됨" → "운영중"
    let newStatus;
    if (!currentStatus) {
      newStatus = "운영중";
    } else {
      newStatus = currentStatus === "운영중" ? "중단됨" : "운영중";
    }

    const message =
      newStatus === "운영중"
        ? "매체 운영을 시작 하시겠습니까?"
        : "매체 운영을 중단 하시겠습니까?";

    setAlertModal({
      isOpen: true,
      message: message,
      onConfirm: async () => {
        try {
          // API 호출로 실제 DB 저장 (ID 기반)
          const response = await toggleOperationStatus(
            productId,
            mediaId,
            teamDetail,
            currentStatus || null
          );

          // 운영 데이터 업데이트 (ID 기반 키)
          const key = `${productId}-${mediaId}-${teamDetail}`;
          setOperationData((prev) => ({
            ...prev,
            [key]: {
              status: response.data.status,
              statusValue: response.data.statusValue,
            },
          }));

          // 히스토리 새로고침
          const historyResponse = await getOperationHistory();
          setHistoryLogs(historyResponse.data);

          setAlertModal({ isOpen: false, message: "", onConfirm: null });
        } catch (error) {
          console.error("상태 변경 실패:", error);
          setAlertModal({
            isOpen: true,
            message: "상태 변경에 실패했습니다: " + error.message,
            onConfirm: () =>
              setAlertModal({ isOpen: false, message: "", onConfirm: null }),
          });
        }
      },
    });
  };

  // 히스토리 상세보기 모달 열기
  const handleViewHistoryDetails = () => {
    setIsHistoryModalOpen(true);
  };

  // 히스토리 상세보기 모달 닫기
  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  // 제품 옵션 (다중 선택) - "전체" 옵션 추가
  const productOptions = [
    { id: "all", name: "전체" },
    ...products.map((product) => ({
      id: product.id,
      name: product.name,
    })),
  ];

  // 제품 특수 옵션: "전체" 선택 시 모든 제품 선택
  const productSpecialOptions = {
    전체: products.length > 0 ? products.map((p) => p.name) : [],
  };

  // 제품 선택 핸들러 (CustomSelect용) - name을 id로 변환 후 일괄 설정
  const handleProductSelectChange = (selectedNames) => {
    const selectedIds = selectedNames
      .map((name) => {
        const product = products.find((p) => p.name === name);
        return product ? product.id : null;
      })
      .filter((id) => id !== null);
    setSelectedProducts(selectedIds);
  };

  // 현재 선택된 제품의 이름 배열
  const selectedProductNames = products
    .filter((p) => selectedProducts.includes(p.id))
    .map((p) => p.name);

  // 오른쪽 패널 컴포넌트
  const rightPanel = (
    <div className="media-operations-right-panel">
      <div className="filter-panel-container">
        <div className="filter-box">
          {/* 팀 선택 */}
          <PermissionWrapper
            pageId="media-operations"
            groupName="filter-panel"
            displayName="team-filter"
          >
            <div className="filter-field horizontal">
              <label>팀</label>
              <CustomSelect
                options={teams}
                selectedValues={selectedTeams}
                onSelectionChange={setSelectedTeams}
                placeholder="팀 선택"
                alwaysShowPlaceholder={true}
                multiple={true}
                specialOptions={teamSpecialOptions}
              />
            </div>
          </PermissionWrapper>

          {/* 제품 선택 */}
          <PermissionWrapper
            pageId="media-operations"
            groupName="filter-panel"
            displayName="product-filter"
          >
            <div className="filter-field horizontal">
              <label>제품</label>
              <CustomSelect
                options={productOptions}
                selectedValues={selectedProductNames}
                onSelectionChange={handleProductSelectChange}
                placeholder="제품 선택"
                alwaysShowPlaceholder={true}
                multiple={true}
                specialOptions={productSpecialOptions}
              />
            </div>
          </PermissionWrapper>

          {/* 매체 선택 */}
          <PermissionWrapper
            pageId="media-operations"
            groupName="filter-panel"
            displayName="media-filter"
          >
            <div className="filter-field horizontal">
              <label>매체</label>
              <CustomSelect
                options={medias}
                selectedValues={selectedMedias}
                onSelectionChange={handleMediaSelectionChange}
                placeholder="매체 선택"
                alwaysShowPlaceholder={true}
                multiple={true}
                specialOptions={mediaSpecialOptions}
              />
            </div>
          </PermissionWrapper>
        </div>

        {/* 히스토리 버튼 */}
        <PermissionWrapper
          pageId="media-operations"
          groupName="history-view"
          displayName="history-view"
        >
          <div className="history-button-box">
            <button className="history-btn" onClick={handleViewHistoryDetails}>
              <FontAwesomeIcon icon={faHistory} />
              <span>최근 히스토리 상세보기</span>
            </button>
          </div>
        </PermissionWrapper>
      </div>
    </div>
  );

  // 로딩 중일 때
  if (loading) {
    return (
      <Layout>
        <div className="media-operations-container">
          <Breadcrumb />
          <div style={{ textAlign: "center", padding: "50px" }}>
            데이터를 불러오는 중...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rightPanel={rightPanel}>
      <div className="media-operations-container">
        <Breadcrumb />

        {/* 테이블 섹션 */}
        <PermissionWrapper
          pageId="media-operations"
          groupName="operation-table"
          displayName="table-view"
        >
          <OperationTable
            products={filteredProducts}
            medias={filteredMediasForTable}
            teamDetails={filteredTeamsForTable}
            operationData={operationData}
            teamMediaPermissions={teamMediaPermissions}
            onStatusClick={handleStatusClick}
          />
        </PermissionWrapper>

        {/* Coming Soon 오버레이 */}
        {/* <ComingSoonOverlay
          title="매체 운영 현황"
          subtitle="현재 이 페이지는 개발 중입니다."
        /> */}
      </div>

      {/* Alert 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() =>
          setAlertModal({ isOpen: false, message: "", onConfirm: null })
        }
        title="확인"
        message={alertModal.message}
        type="warning"
        showCancel={true}
        confirmText="확인"
        cancelText="취소"
        onConfirm={alertModal.onConfirm}
        onCancel={() =>
          setAlertModal({ isOpen: false, message: "", onConfirm: null })
        }
      />

      {/* 히스토리 상세보기 모달 */}
      <HistoryDetailModal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        historyLogs={filteredHistoryLogs}
      />
    </Layout>
  );
}

export default MediaOperations;
