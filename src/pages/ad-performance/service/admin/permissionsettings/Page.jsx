import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import Breadcrumb from "../../../components/Breadcrumb";
import Button from "../../../components/ui/Button";
import AlertModal from "../../../components/ui/AlertModal";
import { usePermissions } from "../../../hooks/usePermissions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faCheck,
  faTimes,
  faSave,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import "../../executiveReport/ExecutiveReport.css";
import "./PermissionSettings.css";
import { getAllPermissions, savePermissions } from "./api";

function PermissionSettings() {
  const [pages, setPages] = useState([]); // API에서 받은 페이지 데이터
  const [originalPages, setOriginalPages] = useState([]); // 초기 상태 저장 (변경 감지용)
  const [selectedMainCategory, setSelectedMainCategory] = useState("executive-report");
  const [selectedSubPage, setSelectedSubPage] = useState("sales");
  const [selectedPage, setSelectedPage] = useState("executive-report-sales");
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    isLoading: false, // 로딩 상태 추가
  });
  const [isLoading, setIsLoading] = useState(true);

  // 권한 관리
  const { hasPermission, isLoading: permissionsLoading, roleCode: userRoleCode, refetch } = usePermissions("admin-permissions");

  // 카테고리별 페이지 구조 정의
  const pageCategories = {
    "executive-report": {
      title: "경영 리포트",
      subPages: {
        sales: {
          title: "판매 실적 현황",
          fullId: "executive-report-sales",
        },
        "product-detail": {
          title: "제품 상세 실적",
          fullId: "executive-report-product",
        },
      },
    },
    "marketing-report": {
      title: "마케팅 리포트",
      subPages: null,
    },
    "media-operations": {
      title: "매체 운영 현황",
      subPages: null,
    },
    "data-entry-status": {
      title: "데이터 입력 현황",
      subPages: null,
    },
    "customer-management": {
      title: "고객 관리",
      subPages: null,
    },
    "admin-account": {
      title: "관리 리소스",
      subPages: {
        "account-creation": {
          title: "계정 관리",
          fullId: "admin-account",
        },
        "permission-settings": {
          title: "등급별 권한 설정",
          fullId: "admin-permissions",
        },
        "product-management": {
          title: "코드 및 제품 등록",
          fullId: "admin-product-management",
        },
        "marketplace-admedia": {
          title: "판매처 및 매체 등록",
          fullId: "admin-marketplace-admedia",
        },
        "daily-quotes": {
          title: "오늘의 명언",
          fullId: "admin-daily-quotes",
        },
      },
    },
  };

  // AlertModal 헬퍼 함수
  const showAlert = (title, message, type = "warning", isLoading = false) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      isLoading,
    });
  };

  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      title: "",
      message: "",
      type: "warning",
      isLoading: false,
    });
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  // 권한 설정 로드
  const loadPermissions = async () => {
    try {
      setIsLoading(true);

      // API에서 실제 권한 설정 조회
      const data = await getAllPermissions();

      if (data && data.pages) {
        setPages(data.pages);
        // 초기 상태 저장 (deep copy)
        setOriginalPages(JSON.parse(JSON.stringify(data.pages)));
      }
    } catch (error) {
      console.error('권한 설정 로드 실패:', error);
      showAlert("실패", "권한 설정을 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 권한 변경 처리
  const handlePermissionChange = (permissionId, roleCode, value) => {
    const canEdit = userRoleCode === "S" || hasPermission('admin-permissions_edit-permissions_edit-permissions');
    if (!canEdit) {
      showAlert(
        "권한 없음",
        "권한 설정을 변경할 수 있는 권한이 없습니다.",
        "warning"
      );
      return;
    }

    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        sections: page.sections.map((section) => ({
          ...section,
          permissions: section.permissions.map((perm) =>
            perm.id === permissionId
              ? {
                  ...perm,
                  roles: {
                    ...perm.roles,
                    [roleCode]: value,
                  },
                }
              : perm
          ),
        })),
      }))
    );
  };

  // 변경된 권한만 찾는 함수
  const getChangedPermissions = () => {
    const roleIdMap = { S: 1, A: 2, B: 3, C: 4 };
    const changedPermissions = [];

    // 원본 권한을 빠르게 찾기 위한 맵 생성
    const originalMap = {};
    originalPages.forEach((page) => {
      page.sections.forEach((section) => {
        section.permissions.forEach((perm) => {
          Object.entries(perm.roles || {}).forEach(([roleCode, isGranted]) => {
            const key = `${perm.id}_${roleCode}`;
            originalMap[key] = isGranted;
          });
        });
      });
    });

    // 현재 상태와 비교하여 변경된 것만 추출
    pages.forEach((page) => {
      page.sections.forEach((section) => {
        section.permissions.forEach((perm) => {
          Object.entries(perm.roles || {}).forEach(([roleCode, isGranted]) => {
            const key = `${perm.id}_${roleCode}`;
            const originalValue = originalMap[key];

            // 값이 변경된 경우에만 추가
            if (originalValue !== isGranted) {
              changedPermissions.push({
                roleId: roleIdMap[roleCode],
                permissionId: perm.id,
                isGranted: isGranted,
              });
            }
          });
        });
      });
    });

    return changedPermissions;
  };

  // 권한 설정 저장
  const handleSave = async () => {
    const canEdit = userRoleCode === "S" || hasPermission('admin-permissions_edit-permissions_edit-permissions');
    if (!canEdit) {
      showAlert(
        "권한 없음",
        "권한 설정을 저장할 수 있는 권한이 없습니다.",
        "warning"
      );
      return;
    }

    // 변경된 권한만 추출
    const permissionUpdates = getChangedPermissions();

    // 변경사항이 없으면 알림
    if (permissionUpdates.length === 0) {
      showAlert("알림", "변경된 권한이 없습니다.", "info");
      return;
    }

    // 저장 중 로딩 모달 표시
    showAlert("저장 중", "권한 설정을 저장하고 있습니다...", "info", true);

    try {
      await savePermissions(permissionUpdates);

      // 전역 권한 캐시 갱신
      await refetch();

      // 저장 완료 후 원본 상태 업데이트
      setOriginalPages(JSON.parse(JSON.stringify(pages)));

      // 성공 모달로 변경
      showAlert("성공", `${permissionUpdates.length}개의 권한이 저장되었습니다.`, "success");
    } catch (error) {
      console.error('권한 설정 저장 실패:', error);
      showAlert("실패", "권한 설정 저장에 실패했습니다.", "error");
    }
  };

  // 기본값으로 초기화
  const handleReset = () => {
    const canEdit = userRoleCode === "S" || hasPermission('admin-permissions_edit-permissions_edit-permissions');
    if (!canEdit) {
      showAlert(
        "권한 없음",
        "권한 설정을 초기화할 수 있는 권한이 없습니다.",
        "warning"
      );
      return;
    }

    loadPermissions();
    showAlert("성공", "권한 설정이 다시 로드되었습니다.", "info");
  };

  // 등급 배지 렌더링
  const renderGradeBadge = (grade) => {
    return (
      <span className={`grade-badge grade-${grade.toLowerCase()}`}>
        {grade}
      </span>
    );
  };

  // 섹션명 한글 변환
  const getSectionNameKorean = (groupName) => {
    const nameMap = {
      'page-access': '페이지 접근',
      'revenue-section': '매출 실적 섹션',
      'table-columns': '테이블 컬럼',
      'filter-panel': '필터 패널',
      'chart-box': '차트 영역',
      'table1': '1번 테이블 - 매출 실적 현황',
      'table2': '2번 테이블 - 매체별 실적',
      'table3': '3번 테이블 - 판매처별 실적',
      'filter-control-bar': '필터 컨트롤',
      'operation-table': '운영 테이블',
      'status-edit': '상태 변경',
      'history-view': '히스토리 조회',
      'edit-button': '편집 버튼',
      'charts': '차트',
      'tables': '테이블',
      'tabs': '탭',
    };
    return nameMap[groupName] || groupName;
  };

  // 섹션 정렬 (page-access는 항상 맨 위, filter-panel은 항상 마지막)
  const sortSections = (sections) => {
    return [...sections].sort((a, b) => {
      // page-access는 항상 맨 위
      if (a.name === 'page-access') return -1;
      if (b.name === 'page-access') return 1;

      // filter-panel은 항상 맨 아래
      if (a.name === 'filter-panel') return 1;
      if (b.name === 'filter-panel') return -1;

      return 0;
    });
  };

  // 메인 카테고리 변경 핸들러
  const handleMainCategoryChange = (categoryId) => {
    setSelectedMainCategory(categoryId);
    const category = pageCategories[categoryId];

    if (category.subPages) {
      // 서브페이지가 있으면 첫 번째 서브페이지 선택
      const firstSubPageId = Object.keys(category.subPages)[0];
      setSelectedSubPage(firstSubPageId);
      setSelectedPage(category.subPages[firstSubPageId].fullId);
    } else {
      // 서브페이지가 없으면 직접 해당 페이지 선택
      setSelectedSubPage("");
      setSelectedPage(categoryId);
    }
  };

  // 서브페이지 변경 핸들러
  const handleSubPageChange = (subPageId) => {
    setSelectedSubPage(subPageId);
    const category = pageCategories[selectedMainCategory];
    if (category.subPages && category.subPages[subPageId]) {
      setSelectedPage(category.subPages[subPageId].fullId);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="executive-report-container full-width-layout">
          <Breadcrumb />
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>권한 설정을 로드하는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="executive-report-container permission-settings-layout full-width-layout"
        style={{ position: "relative" }}
      >
        <Breadcrumb />

        <div className="permission-settings-container">
          {/* 페이지 선택 및 액션 버튼 */}
          <div className="permission-header">
            <div className="page-selector">
              <div style={{ marginRight: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#666" }}>현재 등급:</span>
                {renderGradeBadge(userRoleCode || "C")}
                {(userRoleCode !== "S") && (
                  <span style={{ fontSize: "0.85rem", color: "#999" }}>(읽기 전용)</span>
                )}
              </div>
              <label>
                <span>페이지 선택:</span>
                <select
                  value={selectedMainCategory}
                  onChange={(e) => handleMainCategoryChange(e.target.value)}
                  className="page-select"
                >
                  {Object.entries(pageCategories).map(([categoryId, category]) => (
                    <option key={categoryId} value={categoryId}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>

              {pageCategories[selectedMainCategory]?.subPages && (
                <label>
                  <span>하위 페이지:</span>
                  <select
                    value={selectedSubPage}
                    onChange={(e) => handleSubPageChange(e.target.value)}
                    className="page-select"
                  >
                    {Object.entries(pageCategories[selectedMainCategory].subPages).map(
                      ([subPageId, subPage]) => (
                        <option key={subPageId} value={subPageId}>
                          {subPage.title}
                        </option>
                      )
                    )}
                  </select>
                </label>
              )}
            </div>

            {userRoleCode === "S" && (
              <div className="permission-actions">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                >
                  <FontAwesomeIcon icon={faUndo} /> 초기화
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                >
                  <FontAwesomeIcon icon={faSave} /> 저장
                </Button>
              </div>
            )}
          </div>

          <div className="permission-content">
            {/* 선택된 페이지의 권한 설정 */}
            {pages.find((p) => p.pageId === selectedPage) && (
              <div className="selected-page-permissions">
                {sortSections(pages.find((p) => p.pageId === selectedPage).sections).map((section, sectionIndex) => (
                  <div key={sectionIndex} className="permission-section">
                    <div className="section-header">
                      <h3 className="section-title">{getSectionNameKorean(section.name)}</h3>
                    </div>

                    <div className="permission-table">
                      <div className="permission-table-header">
                        <div className="permission-name-col">권한 설명</div>
                        <div className="permission-grade-cols">
                          <div className="grade-col">
                            {renderGradeBadge("S")}
                          </div>
                          <div className="grade-col">
                            {renderGradeBadge("A")}
                          </div>
                          <div className="grade-col">
                            {renderGradeBadge("B")}
                          </div>
                          <div className="grade-col">
                            {renderGradeBadge("C")}
                          </div>
                        </div>
                      </div>

                      {section.permissions.map(
                        (permission, permissionIndex) => (
                          <div
                            key={permissionIndex}
                            className="permission-row"
                          >
                            <div className="permission-info">
                              <div className="permission-name">
                                {permission.description || permission.displayName}
                              </div>
                            </div>

                            <div className="permission-checkboxes">
                              {["S", "A", "B", "C"].map((roleCode) => (
                                <div
                                  key={roleCode}
                                  className="permission-checkbox"
                                >
                                  <label className="checkbox-wrapper">
                                    <input
                                      type="checkbox"
                                      checked={
                                        permission.roles?.[roleCode] || false
                                      }
                                      onChange={(e) =>
                                        handlePermissionChange(
                                          permission.id,
                                          roleCode,
                                          e.target.checked
                                        )
                                      }
                                      disabled={!(userRoleCode === "S" || hasPermission('admin-permissions_edit-permissions_edit-permissions'))}
                                      className="permission-input"
                                    />
                                    <span className="checkmark">
                                      <FontAwesomeIcon
                                        icon={
                                          permission.roles?.[roleCode]
                                            ? faCheck
                                            : faTimes
                                        }
                                        className={`check-icon ${
                                          permission.roles?.[roleCode]
                                            ? "allowed"
                                            : "denied"
                                        }`}
                                      />
                                    </span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 알림 모달 */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={alertModal.isLoading ? undefined : closeAlert}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          isLoading={alertModal.isLoading}
        />
      </div>
    </Layout>
  );
}

export default PermissionSettings;
