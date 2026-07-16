import React, { useState, useEffect } from "react";
import CustomSelect from "../../../../components/ui/CustomSelect";
import Button from "../../../../components/ui/Button";

function BoxPriceTab({
  boxPriceSelectedProduct,
  setBoxPriceSelectedProduct,
  boxPriceSelectedParentChannel,
  setBoxPriceSelectedParentChannel,
  boxPriceSelectedChannel,
  setBoxPriceSelectedChannel,
  boxPriceFee,
  setBoxPriceFee,
  boxPriceMaxBox,
  boxPricesInput,
  hiddenPricesInput,
  editingBoxPriceId,
  boxPriceList,
  getSelectedProductHiddens,
  getProductHiddens = () => [],
  setHiddenPricesInput,
  setExpandedHiddenBoxes,
  handleBoxPriceInputChange,
  handleHiddenPriceInputChange,
  handleAddBoxRow,
  handleRemoveBoxRow,
  handleBoxPriceSubmit,
  handleBoxPriceSave,
  handleBoxPriceEditCancel,
  openPriceHistoryModal,
  handleBoxPriceDelete,
  openMenuId,
  menuRef,
  toggleMenu,
  productOptions = [],
  parentChannelOptions = [],
  childChannelOptions = [],
  // 중복 체크 관련
  existingBoxPrice,
  // 페이지네이션
  pagination,
  fetchBoxPrices,
  // 계산 규칙 확인 모달
  onOpenPriceCalculationRuleModal,
  // 엑셀 업로드 관련
  isUploading,
  uploadResult,
  showUploadResultModal,
  fileInputRef,
  handleExcelUpload,
  closeUploadResultModal
}) {
  // 확장/축소 상태 관리
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [expandedHiddenItems, setExpandedHiddenItems] = useState(new Set());
  
  // 히든 선택 상태 관리
  const [selectedHiddenIds, setSelectedHiddenIds] = useState(new Set());

  // 박스 가격 확장/축소 토글
  const toggleBoxPriceExpand = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // 히든 가격 확장/축소 토글  
  const toggleHiddenPriceExpand = (itemId) => {
    setExpandedHiddenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // 히든 선택/해제 토글
  const toggleHiddenSelection = (hiddenId) => {
    setSelectedHiddenIds(prev => {
      const newSet = new Set(prev);
      const isRemoving = newSet.has(hiddenId);
      
      if (isRemoving) {
        newSet.delete(hiddenId);
        // 선택 해제 시 해당 히든의 모든 입력값을 초기화
        const productHiddens = getSelectedProductHiddens();
        const hiddenInfo = productHiddens.find(h => h.id === hiddenId);
        if (hiddenInfo) {
          // 해당 히든과 관련된 모든 키를 제거
          setHiddenPricesInput(prevInput => {
            const newInput = { ...prevInput };
            for (let boxNum = 1; boxNum <= boxPriceMaxBox; boxNum++) {
              const hiddenKey = `${boxNum}_${hiddenInfo.name}`;
              delete newInput[hiddenKey];
            }
            return newInput;
          });
        }
      } else {
        newSet.add(hiddenId);
      }
      
      return newSet;
    });
  };

  // 전체선택/해제 토글
  const toggleAllHiddens = () => {
    const productHiddens = getSelectedProductHiddens();
    const allHiddenIds = new Set(productHiddens.map(h => h.id));
    
    // 현재 모든 히든이 선택되어 있는지 확인
    const isAllSelected = productHiddens.length > 0 && 
      productHiddens.every(h => selectedHiddenIds.has(h.id));
    
    if (isAllSelected) {
      // 모두 선택해제
      setSelectedHiddenIds(new Set());
      // 모든 히든의 입력값도 초기화
      setHiddenPricesInput(prevInput => {
        const newInput = { ...prevInput };
        productHiddens.forEach(hiddenInfo => {
          for (let boxNum = 1; boxNum <= boxPriceMaxBox; boxNum++) {
            const hiddenKey = `${boxNum}_${hiddenInfo.name}`;
            delete newInput[hiddenKey];
          }
        });
        return newInput;
      });
    } else {
      // 모두 선택
      setSelectedHiddenIds(allHiddenIds);
    }
  };

  // 제품이 변경될 때 히든 선택 상태 초기화
  // 단, 기존 데이터(hiddenPricesInput)가 있으면 해당 히든들을 자동 선택
  useEffect(() => {
    const productHiddens = getSelectedProductHiddens();

    // hiddenPricesInput에 데이터가 있는 히든들을 찾아서 자동 선택
    if (Object.keys(hiddenPricesInput).length > 0 && productHiddens.length > 0) {
      const hiddenNamesInInput = new Set(
        Object.keys(hiddenPricesInput).map(key => key.split('_').slice(1).join('_'))
      );
      const idsToSelect = productHiddens
        .filter(h => hiddenNamesInInput.has(h.name))
        .map(h => h.id);
      setSelectedHiddenIds(new Set(idsToSelect));
    } else {
      // 데이터 없으면(신규 등록 or 히든 가격 미등록 수정) 모든 히든 자동 선택
      setSelectedHiddenIds(new Set(productHiddens.map(h => h.id)));
    }
  }, [boxPriceSelectedProduct, hiddenPricesInput]);

  const showHiddenColumns = boxPriceSelectedChannel.length > 0 &&
    childChannelOptions.some(ch =>
      boxPriceSelectedChannel.includes(ch.id) &&
      ch.name === 'Cafe24(신) 유튜브 쇼핑'
    );

  return (
    <div className="tab-content">
      {/* 업로드 중 로딩 오버레이 */}
      {isUploading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem 3rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
            minWidth: '300px',
          }}>
            <div style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '500', color: '#333' }}>
              엑셀 업로드 중...
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)',
                backgroundSize: '200% 100%',
                animation: 'loading-progress 1.5s ease-in-out infinite',
                borderRadius: '4px',
              }} />
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
              데이터를 처리하고 있습니다. 잠시만 기다려주세요.
            </div>
          </div>
          <style>{`
            @keyframes loading-progress {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      )}
      {/* 박스별 가격 등록/수정 폼 */}
      <div className="registration-form">
        {editingBoxPriceId && (
          <div className="edit-mode-banner">
            수정 모드 - 완료 후 저장 버튼을 눌러주세요
          </div>
        )}

        {/* 제품/판매처 선택 영역 */}
        <div className="form-row">
          <div className="form-field">
            <label>제품</label>
            <CustomSelect
              options={productOptions}
              selectedValues={boxPriceSelectedProduct}
              onSelectionChange={(values) => {
                setBoxPriceSelectedProduct(values);
                setHiddenPricesInput({});
                setExpandedHiddenBoxes({});
              }}
              placeholder="제품을 선택하세요"
              multiple={false}
              disabled={editingBoxPriceId !== null}
              useIdAsValue={true}
              searchable={true}
            />
          </div>

          <div className="form-field">
            <label>판매처</label>
            <CustomSelect
              options={parentChannelOptions}
              selectedValues={boxPriceSelectedParentChannel}
              onSelectionChange={setBoxPriceSelectedParentChannel}
              placeholder="판매처를 선택하세요"
              multiple={false}
              disabled={editingBoxPriceId !== null}
              useIdAsValue={true}
            />
          </div>

          <div className="form-field">
            <label>파일 판매처명</label>
            <CustomSelect
              options={childChannelOptions}
              selectedValues={boxPriceSelectedChannel}
              onSelectionChange={(values) => {
                setBoxPriceSelectedChannel(values);
                setHiddenPricesInput({});
                setExpandedHiddenBoxes({});
              }}
              placeholder={
                boxPriceSelectedParentChannel.length > 0
                  ? "파일 판매처명을 선택하세요"
                  : "먼저 판매처를 선택하세요"
              }
              multiple={false}
              disabled={
                editingBoxPriceId !== null ||
                boxPriceSelectedParentChannel.length === 0
              }
              useIdAsValue={true}
            />
          </div>

          <div className="form-field fee-field">
            <label title="지불하는 금액">수수료</label>
            <div className="fee-input-group">
              <input
                type="number"
                value={boxPriceFee}
                onChange={(e) => setBoxPriceFee(e.target.value)}
                placeholder="0"
                className="form-input fee-input-field"
              />
              <span className="fee-unit">%</span>
            </div>
          </div>
        </div>

        {/* 중복 데이터 경고 메시지 */}
        {existingBoxPrice && !editingBoxPriceId && (
          <div className="duplicate-warning">
            <span className="duplicate-warning-icon">⚠</span>
            <span className="duplicate-warning-text">
              이미 <strong>{existingBoxPrice.product}</strong> -{" "}
              <strong>{existingBoxPrice.channel}</strong>에 등록된 가격이
              있습니다. 등록 시 기존 데이터가 업데이트됩니다.
            </span>
          </div>
        )}

        {/* 박스별 입력 폼 - 항상 표시 */}
        <BoxPriceInputSection
          boxPriceMaxBox={boxPriceMaxBox}
          boxPricesInput={boxPricesInput}
          hiddenPricesInput={hiddenPricesInput}
          editingBoxPriceId={editingBoxPriceId}
          getSelectedProductHiddens={getSelectedProductHiddens}
          selectedHiddenIds={selectedHiddenIds}
          toggleHiddenSelection={toggleHiddenSelection}
          toggleAllHiddens={toggleAllHiddens}
          handleBoxPriceInputChange={handleBoxPriceInputChange}
          handleHiddenPriceInputChange={handleHiddenPriceInputChange}
          handleAddBoxRow={handleAddBoxRow}
          handleRemoveBoxRow={handleRemoveBoxRow}
          handleBoxPriceSubmit={handleBoxPriceSubmit}
          handleBoxPriceSave={handleBoxPriceSave}
          handleBoxPriceEditCancel={handleBoxPriceEditCancel}
          showHiddenColumns={showHiddenColumns}
        />

        {/* 제품/판매처 미선택 안내 */}
        {(boxPriceSelectedProduct.length === 0 ||
          boxPriceSelectedParentChannel.length === 0 ||
          boxPriceSelectedChannel.length === 0) &&
          !editingBoxPriceId && (
            <div className="box-price-placeholder">
              <p>제품, 판매처, 파일 판매처명을 모두 선택하면 박스별 가격을 입력할 수 있습니다.</p>
            </div>
          )}
      </div>

      {/* 버튼 영역: 계산 규칙 확인 + 엑셀 업로드 */}
      <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        {onOpenPriceCalculationRuleModal && (
          <Button
            variant="secondary"
            size="small"
            onClick={onOpenPriceCalculationRuleModal}
          >
            가격 계산 규칙 확인
          </Button>
        )}
        <input
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={(e) => handleExcelUpload && handleExcelUpload(e.target.files[0])}
        />
        <Button
          variant="secondary"
          size="small"
          onClick={() => fileInputRef?.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? '업로드 중...' : '엑셀 업로드'}
        </Button>
      </div>
      {/* 박스별 가격 테이블 */}
      <div className="list-table-wrapper" ref={menuRef}>
        <table className="list-table">
          <thead>
            <tr>
              <th className="product-col">제품</th>
              <th className="channel-col">파일 판매처명</th>
              <th className="fee-col">수수료</th>
              <th>박스별 가격</th>
              <th>히든별 가격</th>
              <th className="action-col">관리</th>
            </tr>
          </thead>
          <tbody>
            {boxPriceList.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  등록된 박스별 가격이 없습니다.
                </td>
              </tr>
            ) : (
              boxPriceList.map((item) => (
                <tr key={item.id}>
                  <td className="product-cell">{item.product}</td>
                  <td>
                    <span className="channel-badge">
                      {item.channel}
                    </span>
                  </td>
                  <td className="fee-cell">{item.fee || 0}%</td>
                  <td className="prices-cell">
                    <div className="compact-prices">
                      {(expandedItems.has(item.id) ? item.boxPrices : item.boxPrices.slice(0, 5)).map((bp) => (
                        <div key={bp.boxCount} className="compact-price-item">
                          <span className="compact-box-num">
                            {bp.boxCount}박스
                          </span>
                          <span className="compact-price-detail">
                            판매가 {bp.price.toLocaleString()}원 배송비{" "}
                            {(bp.shippingFee || 0).toLocaleString()}원
                          </span>
                        </div>
                      ))}
                      {item.boxPrices.length > 5 && (
                        <span 
                          className="more-indicator"
                          onClick={() => toggleBoxPriceExpand(item.id)}
                        >
                          {expandedItems.has(item.id) 
                            ? "접기" 
                            : `+${item.boxPrices.length - 5}개 더보기`
                          }
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="prices-cell">
                    {Object.keys(item.hiddenPrices || {}).length > 0 ? (
                      <div className="compact-prices hidden-type">
                        {(expandedHiddenItems.has(item.id)
                          ? Object.entries(item.hiddenPrices)
                          : Object.entries(item.hiddenPrices).slice(0, 5)
                        ).map(([key, hp]) => {
                            const [boxNum, hiddenIdentifier] = key.split("_");
                            // 히든 번호인 경우 이름으로 변환
                            let displayName = hiddenIdentifier;
                            if (/^\d+$/.test(hiddenIdentifier)) {
                              const productHiddens = getProductHiddens(item.productId);
                              const hiddenInfo = productHiddens.find(h => String(h.number) === hiddenIdentifier);
                              if (hiddenInfo) {
                                displayName = hiddenInfo.name;
                              }
                            }
                            return (
                              <div key={key} className="compact-price-item">
                                <span className="compact-box-num">
                                  {boxNum}박스-{displayName}
                                </span>
                                <span className="compact-price-detail">
                                  판매가 {(hp.price || 0).toLocaleString()}원
                                  배송비 {(hp.shippingFee || 0).toLocaleString()}
                                  원
                                </span>
                              </div>
                            );
                          })}
                        {Object.keys(item.hiddenPrices).length > 5 && (
                          <span 
                            className="more-indicator"
                            onClick={() => toggleHiddenPriceExpand(item.id)}
                          >
                            {expandedHiddenItems.has(item.id)
                              ? "접기"
                              : `+${Object.keys(item.hiddenPrices).length - 5}개 더보기`
                            }
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="no-hidden">-</span>
                    )}
                  </td>
                  <td
                    className="action-cell"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="dropdown-menu-container">
                      <button
                        className="menu-trigger-btn"
                        onClick={() => toggleMenu(item.id)}
                      >
                        ⋯
                      </button>
                      {openMenuId === item.id && (
                        <div className="dropdown-menu">
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              openPriceHistoryModal(item);
                              toggleMenu(null);
                            }}
                          >
                            히스토리
                          </button>
                          <button
                            className="dropdown-item delete"
                            onClick={() => {
                              handleBoxPriceDelete(item);
                              toggleMenu(null);
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination && pagination.totalCount > 0 && (
        <div className="pagination-wrapper">
          <button
            className="pagination-btn"
            onClick={() => fetchBoxPrices(1)}
            disabled={pagination.page === 1}
          >
            «
          </button>
          <button
            className="pagination-btn"
            onClick={() => fetchBoxPrices(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ‹
          </button>
          <span className="pagination-info">
            {pagination.page} / {pagination.totalPages} 페이지 (총{" "}
            {pagination.totalCount}건)
          </span>
          <button
            className="pagination-btn"
            onClick={() => fetchBoxPrices(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            ›
          </button>
          <button
            className="pagination-btn"
            onClick={() => fetchBoxPrices(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages}
          >
            »
          </button>
        </div>
      )}

      {/* 엑셀 업로드 결과 모달 */}
      {showUploadResultModal && uploadResult && (
        <div className="modal-overlay" onClick={closeUploadResultModal}>
          <div className="modal-content upload-result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{uploadResult.success ? '업로드 완료' : '업로드 실패'}</h3>
              <button className="modal-close-btn" onClick={closeUploadResultModal}>×</button>
            </div>
            <div className="modal-body">
              {uploadResult.success ? (
                <div className="upload-success">
                  <div className="success-icon">✓</div>
                  <p className="success-message">{uploadResult.msg}</p>
                  {uploadResult.data?.summary && (
                    <div className="summary-section">
                      <div className="summary-item">
                        <span className="summary-label">총 처리 행:</span>
                        <span className="summary-value">{uploadResult.data.summary.totalRows}건</span>
                      </div>
                      <div className="summary-divider" />
                      <div className="summary-group">
                        <h4>박스별 가격</h4>
                        <div className="summary-item">
                          <span className="summary-label">신규 등록:</span>
                          <span className="summary-value">{uploadResult.data.summary.boxPriceCreated}건</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">업데이트:</span>
                          <span className="summary-value">{uploadResult.data.summary.boxPriceUpdated}건</span>
                        </div>
                      </div>
                      <div className="summary-group">
                        <h4>제품 코드</h4>
                        <div className="summary-item">
                          <span className="summary-label">신규 등록:</span>
                          <span className="summary-value">{uploadResult.data.summary.productCodeCreated}건</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">건너뜀(중복):</span>
                          <span className="summary-value">{uploadResult.data.summary.productCodeSkipped}건</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="upload-failure">
                  <div className="failure-icon">!</div>
                  <p className="failure-message">{uploadResult.msg}</p>
                  {uploadResult.data?.unregisteredMarketPlaces?.length > 0 && (
                    <div className="error-detail">
                      <h4>미등록 판매처</h4>
                      <ul>
                        {uploadResult.data.unregisteredMarketPlaces.map((name, idx) => (
                          <li key={idx}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {uploadResult.data?.unregisteredFileMarketPlaces?.length > 0 && (
                    <div className="error-detail">
                      <h4>미등록 파일판매처명</h4>
                      <ul>
                        {uploadResult.data.unregisteredFileMarketPlaces.map((name, idx) => (
                          <li key={idx}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {uploadResult.data?.unregisteredProducts?.length > 0 && (
                    <div className="error-detail">
                      <h4>미등록 제품</h4>
                      <ul>
                        {uploadResult.data.unregisteredProducts.map((name, idx) => (
                          <li key={idx}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {uploadResult.data?.missingColumns?.length > 0 && (
                    <div className="error-detail">
                      <h4>누락된 컬럼</h4>
                      <ul>
                        {uploadResult.data.missingColumns.map((col, idx) => (
                          <li key={idx}>{col}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button variant="primary" size="medium" onClick={closeUploadResultModal}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 박스별 가격 입력 섹션
function BoxPriceInputSection({
  boxPriceMaxBox,
  boxPricesInput,
  hiddenPricesInput,
  editingBoxPriceId,
  getSelectedProductHiddens,
  selectedHiddenIds,
  toggleHiddenSelection,
  toggleAllHiddens,
  handleBoxPriceInputChange,
  handleHiddenPriceInputChange,
  handleAddBoxRow,
  handleRemoveBoxRow,
  handleBoxPriceSubmit,
  handleBoxPriceSave,
  handleBoxPriceEditCancel,
  showHiddenColumns,
}) {
  const productHiddens = getSelectedProductHiddens();

  return (
    <div className="box-price-input-section">
      {/* 선택된 제품의 히든 정보 표시 */}
      {productHiddens.length > 0 && showHiddenColumns && (
        <div className="selected-product-hiddens-info">
          <span className="info-label">등록된 히든:</span>
          {/* 전체선택 항목 */}
          <span 
            className={`hidden-tag all-select ${productHiddens.length > 0 && productHiddens.every(h => selectedHiddenIds.has(h.id)) ? 'selected' : 'deselected'}`}
            onClick={toggleAllHiddens}
          >
            전체선택
          </span>
          {productHiddens.map((h) => (
            <span 
              key={h.id} 
              className={`hidden-tag ${selectedHiddenIds.has(h.id) ? 'selected' : 'deselected'}`}
              onClick={() => toggleHiddenSelection(h.id)}
            >
              {h.name} ({h.number})
            </span>
          ))}
        </div>
      )}

      {/* 박스별 가격 입력 테이블 */}
      <div className="box-price-input-table-wrapper">
        <table className="box-price-input-table">
          <thead>
            <tr className="header-group-row">
              <th rowSpan="2" className="box-num-col">
                박스
              </th>
              <th colSpan="2" className="header-group regular-col-header">
                일반
              </th>
              {showHiddenColumns && productHiddens.filter(hidden => selectedHiddenIds.has(hidden.id)).map((hidden) => (
                <th
                  key={hidden.id}
                  colSpan="2"
                  className="header-group hidden-col-header"
                >
                  {hidden.name}
                </th>
              ))}
            </tr>
            <tr className="header-sub-row">
              <th className="sub-header regular-col-header">판매가</th>
              <th className="sub-header regular-col-header">배송비</th>
              {showHiddenColumns && productHiddens.filter(hidden => selectedHiddenIds.has(hidden.id)).map((hidden) => (
                <React.Fragment key={hidden.id}>
                  <th className="sub-header hidden-col-header">판매가</th>
                  <th className="sub-header hidden-col-header">배송비</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: boxPriceMaxBox }, (_, i) => i + 1).map(
              (boxNum) => {
                const boxData = boxPricesInput[boxNum] || {};

                return (
                  <tr key={boxNum} className="box-price-row">
                    <td className="box-num-cell">{boxNum}박스</td>
                    <td className="price-input-cell regular-cell">
                      <input
                        type="text"
                        className="form-input price-input"
                        placeholder="판매가"
                        value={boxData.price || ""}
                        onChange={(e) =>
                          handleBoxPriceInputChange(
                            boxNum,
                            "price",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="price-input-cell regular-cell">
                      <input
                        type="text"
                        className="form-input price-input"
                        placeholder="배송비"
                        value={boxData.shippingFee || ""}
                        onChange={(e) =>
                          handleBoxPriceInputChange(
                            boxNum,
                            "shippingFee",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    {showHiddenColumns && productHiddens.filter(hidden => selectedHiddenIds.has(hidden.id)).map((hidden) => {
                      const hiddenKey = `${boxNum}_${hidden.name}`;
                      const hiddenData = hiddenPricesInput[hiddenKey] || {};

                      return (
                        <React.Fragment key={hidden.id}>
                          <td className="price-input-cell hidden-cell">
                            <input
                              type="text"
                              className="form-input price-input"
                              placeholder="판매가"
                              value={hiddenData.price || ""}
                              onChange={(e) =>
                                handleHiddenPriceInputChange(
                                  boxNum,
                                  hidden.name,
                                  "price",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="price-input-cell hidden-cell">
                            <input
                              type="text"
                              className="form-input price-input"
                              placeholder="배송비"
                              value={hiddenData.shippingFee || ""}
                              onChange={(e) =>
                                handleHiddenPriceInputChange(
                                  boxNum,
                                  hidden.name,
                                  "shippingFee",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {/* 박스 개수 조절 버튼 - 테이블 아래 왼쪽에 배치 */}
      <div className="box-count-controls">
        <span className="box-count-label">박스추가</span>
        <div className="box-count-buttons">
          <button
            type="button"
            className="box-count-btn"
            onClick={handleRemoveBoxRow}
            disabled={boxPriceMaxBox <= 1}
          >
            -
          </button>
          <button
            type="button"
            className="box-count-btn"
            onClick={handleAddBoxRow}
            disabled={boxPriceMaxBox >= 20}
          >
            +
          </button>
        </div>
      </div>

      {/* 등록/수정 버튼 */}
      <div className="form-actions">
        {editingBoxPriceId ? (
          <>
            <Button
              variant="secondary"
              size="large"
              onClick={handleBoxPriceEditCancel}
            >
              취소
            </Button>
            <Button variant="primary" size="large" onClick={handleBoxPriceSave}>
              수정 저장
            </Button>
          </>
        ) : (
          <Button variant="primary" size="large" onClick={handleBoxPriceSubmit}>
            박스별 가격 등록하기
          </Button>
        )}
      </div>
    </div>
  );
}

export default BoxPriceTab;
