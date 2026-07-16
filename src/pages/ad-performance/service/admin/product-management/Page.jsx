import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import Layout from "../../../components/Layout";
import CustomAlert from "../../../components/ui/CustomAlert";
import { useAuth } from "../../../contexts/AuthContext";
import "./ProductManagement.css";

// Constants
import { products } from "./constants";

// Hooks
import { useCodeTab, useProductTab, useBoxPriceTab, useModals } from "./hooks";

// Elements (Components)
import {
  CodeTab,
  ProductTab,
  BoxPriceTab,
  SearchFilterPanel,
  DeleteConfirmModal,
  CodeDetailModal,
  PriceHistoryModal,
  UpdateConfirmModal,
} from "./elements";
import PriceCalculationRuleModal from "./elements/modals/PriceCalculationRuleModal";

// Re-export for backwards compatibility
export { products as hiddenList } from "./constants";

function ProductManagement() {
  // AuthContext에서 사용자 역할 가져오기
  const { userRole } = useAuth();

  // 탭 상태 (로컬스토리지에서 불러오기)
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("productManagementActiveTab");
    return savedTab || "product";
  });

  // 커스텀 alert 상태
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const showCustomAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // 커스텀 훅 사용 (boxPriceTab을 먼저 초기화해서 codeTab에 전달)
  const boxPriceTab = useBoxPriceTab(showCustomAlert);
  const codeTab = useCodeTab(showCustomAlert, boxPriceTab.boxPriceList);
  const productTab = useProductTab(showCustomAlert);

  // 탭 변경 시 해당 탭 데이터 로드
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    localStorage.setItem("productManagementActiveTab", tab);

    // 해당 탭 데이터 초기화
    if (tab === "code") {
      codeTab.initializeData();
      // 코드 탭은 boxPrice 데이터도 필요 (박스갯수 옵션용)
      boxPriceTab.initializeData();
    } else if (tab === "product") {
      productTab.initializeData();
    } else if (tab === "boxPrice") {
      boxPriceTab.initializeData();
    }
  }, [codeTab, productTab, boxPriceTab]);

  // 초기 탭 데이터 로드
  useEffect(() => {
    if (activeTab === "code") {
      codeTab.initializeData();
      boxPriceTab.initializeData();
    } else if (activeTab === "product") {
      productTab.initializeData();
    } else if (activeTab === "boxPrice") {
      boxPriceTab.initializeData();
    }
  }, []); // 최초 1회만 실행

  // productId 또는 productName으로 히든 정보 조회
  // boxPriceTab.productList와 productTab.productManagement 모두에서 검색
  const getProductHiddens = (productIdOrName) => {
    // boxPriceTab의 productList 먼저 확인 (박스별 가격 탭에서 사용)
    let product = boxPriceTab.productList?.find(
      (p) => p.id === productIdOrName || p.name === productIdOrName
    );
    // 없으면 productTab에서 확인
    if (!product) {
      product = productTab.productManagement.find(
        (p) => p.id === productIdOrName || p.name === productIdOrName
      );
    }
    return product?.hiddenNumbers || [];
  };

  // 두 소스의 제품 목록을 병합 (중복 제거)
  const mergedProductList = [...(boxPriceTab.productList || []), ...(productTab.productManagement || [])].filter(
    (p, idx, self) => self.findIndex(pp => pp.id === p.id) === idx
  );

  const modals = useModals(showCustomAlert, boxPriceTab.boxPriceList, boxPriceTab.setBoxPriceList, mergedProductList);

  // productId와 channelIds로 박스별 가격 조회 (API로 가져온 productBoxPrices 사용)
  const getBoxPricesForCode = (productId, channelIds) => {
    return modals.productBoxPrices.filter(
      (bp) => bp.productId === productId && channelIds.includes(bp.marketPlaceId)
    );
  };

  // 가격 계산 규칙 확인 모달 상태
  const [showPriceCalculationRuleModal, setShowPriceCalculationRuleModal] = useState(false);

  // 검색 핸들러 - SearchFilterPanel의 검색 이벤트 처리
  const handleSearchChange = useCallback((tab, filters) => {
    // 검색 필터를 API 형식에 맞게 변환
    const searchFilters = {
      textSearch: filters.textSearch || null,
      productIds: filters.selectedProducts || [],
      marketPlaceIds: filters.selectedChannels || [],
    };

    // 탭에 따라 적절한 fetch 함수 호출
    if (tab === "code") {
      codeTab.fetchProductCodes(1, searchFilters);
    } else if (tab === "product") {
      productTab.fetchProducts(1, searchFilters);
    } else if (tab === "boxPrice") {
      boxPriceTab.fetchBoxPrices(1, searchFilters);
    }

    // layout-main 스크롤을 맨 아래로 이동
    setTimeout(() => {
      const layoutMain = document.querySelector('.layout-main');
      if (layoutMain) {
        layoutMain.scrollTop = layoutMain.scrollHeight;
      }
    }, 100);
  }, [codeTab, productTab, boxPriceTab]);

  // 탭에 따라 적절한 productOptions 선택
  const getProductOptions = () => {
    if (activeTab === 'product') {
      return productTab.productOptions?.length > 0 ? productTab.productOptions : [];
    }
    // code, boxPrice 탭은 boxPriceTab 우선, 없으면 productTab
    return boxPriceTab.productOptions?.length > 0
      ? boxPriceTab.productOptions
      : (productTab.productOptions || []);
  };

  // Right Panel 컴포넌트
  const rightPanel = (
    <SearchFilterPanel
      activeTab={activeTab}
      userRole={userRole}
      productOptions={getProductOptions()}
      channelOptions={boxPriceTab.parentChannelOptions || []}
      childChannelOptions={boxPriceTab.childChannelOptions || []}
      onSearchChange={handleSearchChange}
    />
  );

  return (
    <Layout rightPanel={rightPanel}>
      <div className="product-management-page">
        {/* 커스텀 Breadcrumb */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <div className="breadcrumb-container">
            <ol className="breadcrumb-list">
              <li className="breadcrumb-item">
                <Link to="/management-resources" className="breadcrumb-link">관리 리소스</Link>
                <span className="breadcrumb-separator"><FontAwesomeIcon icon={faAngleRight} /></span>
              </li>
              <li className="breadcrumb-item">
                <div className="breadcrumb-tabs">
                  <button className={activeTab === "product" ? "breadcrumb-tab active" : "breadcrumb-tab"} onClick={() => handleTabChange("product")}>제품등록</button>
                  <button className={activeTab === "boxPrice" ? "breadcrumb-tab active" : "breadcrumb-tab"} onClick={() => handleTabChange("boxPrice")}>박스별 가격</button>
                  <button className={activeTab === "code" ? "breadcrumb-tab active" : "breadcrumb-tab"} onClick={() => handleTabChange("code")}>코드등록</button>
                </div>
              </li>
            </ol>
          </div>
        </nav>

        {/* 제품 탭 */}
        {activeTab === "product" && <ProductTab userRole={userRole} {...productTab} />}

        {/* 박스별 가격 탭 */}
        {activeTab === "boxPrice" && (
          <>
            <BoxPriceTab
              {...boxPriceTab}
              getProductHiddens={getProductHiddens}
              openPriceHistoryModal={modals.openPriceHistoryModal}
              onOpenPriceCalculationRuleModal={() => setShowPriceCalculationRuleModal(true)}
            />
            {boxPriceTab.deleteBoxPriceConfirmId && (
              <DeleteConfirmModal
                message="해당 박스별 가격을 삭제하시겠습니까?"
                onConfirm={boxPriceTab.confirmBoxPriceDelete}
                onCancel={() => boxPriceTab.setDeleteBoxPriceConfirmId(null)}
              />
            )}
            {boxPriceTab.showUpdateConfirmModal && boxPriceTab.updateConfirmData && (
              <UpdateConfirmModal
                updateConfirmData={boxPriceTab.updateConfirmData}
                onConfirm={boxPriceTab.confirmUpdateExisting}
                onCancel={boxPriceTab.cancelUpdateExisting}
              />
            )}
          </>
        )}

        {/* 코드 탭 */}
        {activeTab === "code" && (
          <CodeTab
            {...codeTab}
            openCodeDetailModal={modals.openCodeDetailModal}
          />
        )}

        {/* 공통 모달들 */}
        {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} />}

        {codeTab.deleteConfirmId && (
          <DeleteConfirmModal
            message="해당 코드를 삭제하시겠습니까?"
            onConfirm={codeTab.confirmDelete}
            onCancel={() => codeTab.setDeleteConfirmId(null)}
          />
        )}

        {modals.showCodeDetailModal && modals.selectedCodeForDetail && (
          <CodeDetailModal
            selectedCodeForDetail={modals.selectedCodeForDetail}
            getBoxPricesForCode={getBoxPricesForCode}
            getProductHiddens={getProductHiddens}
            onClose={modals.closeCodeDetailModal}
            // 판매처 추가/삭제 관련 props
            channelOptions={codeTab.channelOptions}
            boxPriceList={modals.productBoxPrices}
            onAddChannel={codeTab.addChannelToCode}
            onRemoveChannel={codeTab.removeChannelFromCode}
            isLoading={codeTab.isLoading}
          />
        )}

        {modals.showPriceHistoryModal && modals.selectedPriceHistory && (
          <PriceHistoryModal
            selectedPriceHistory={modals.selectedPriceHistory}
            editingHistoryId={modals.editingHistoryId}
            editingHistoryData={modals.editingHistoryData}
            setEditingHistoryData={modals.setEditingHistoryData}
            expandedHistoryIds={modals.expandedHistoryIds}
            getProductHiddens={getProductHiddens}
            toggleHistoryAccordion={modals.toggleHistoryAccordion}
            startEditHistory={modals.startEditHistory}
            cancelEditHistory={modals.cancelEditHistory}
            saveHistoryEdit={modals.saveHistoryEdit}
            deleteHistory={modals.deleteHistory}
            updateEditingHistoryBoxPrice={modals.updateEditingHistoryBoxPrice}
            updateEditingHistoryHiddenPrice={modals.updateEditingHistoryHiddenPrice}
            addHistoryBoxRow={modals.addHistoryBoxRow}
            removeHistoryBoxRow={modals.removeHistoryBoxRow}
            onClose={modals.closePriceHistoryModal}
            // 판매처 변경 관련
            channelOptions={boxPriceTab.parentChannelOptions}
            isEditingMarketPlace={modals.isEditingMarketPlace}
            newMarketPlaceId={modals.newMarketPlaceId}
            setNewMarketPlaceId={modals.setNewMarketPlaceId}
            startEditMarketPlace={modals.startEditMarketPlace}
            cancelEditMarketPlace={modals.cancelEditMarketPlace}
            saveMarketPlaceChange={modals.saveMarketPlaceChange}
          />
        )}

        {showPriceCalculationRuleModal && (
          <PriceCalculationRuleModal onClose={() => setShowPriceCalculationRuleModal(false)} />
        )}
      </div>
    </Layout>
  );
}

export default ProductManagement;
