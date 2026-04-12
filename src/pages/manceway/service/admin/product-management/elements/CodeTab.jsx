import React from "react";
import CustomSelect from "../../../../components/ui/CustomSelect";
import Button from "../../../../components/ui/Button";
import { channelColors } from "../constants";

function CodeTab({
  code,
  setCode,
  selectedProduct,
  setSelectedProduct,
  selectedParentChannel,
  setSelectedParentChannel,
  selectedChannels,
  setSelectedChannels,
  selectedBoxCount,
  setSelectedBoxCount,
  codeList,
  handleRegisterCode,
  openCodeDetailModal,
  handleDeleteCode,
  openMenuId,
  menuRef,
  toggleMenu,
  isLoading,
  pagination,
  handlePageChange,
  productOptions,
  parentChannelOptions,
  channelOptions,
  availableBoxCounts,
  selectedBoxPriceInfo,
}) {
  const { options: boxCountOptions } = availableBoxCounts;

  return (
    <div className="tab-content">
      {/* 코드 등록 폼 */}
      <div className="registration-form">
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="code-input">
              코드 <span className="required">*</span>
            </label>
            <input
              id="code-input"
              type="text"
              className="form-input"
              placeholder="예: UD4EA1E01"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="form-field">
            <label>
              제품 <span className="required">*</span>
            </label>
            <CustomSelect
              options={productOptions}
              selectedValues={selectedProduct}
              onSelectionChange={setSelectedProduct}
              placeholder="제품"
              multiple={false}
              useIdAsValue={true}
              searchable={true}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>
              판매처 <span className="required">*</span>
            </label>
            <CustomSelect
              options={parentChannelOptions}
              selectedValues={selectedParentChannel}
              onSelectionChange={setSelectedParentChannel}
              placeholder="판매처"
              multiple={false}
              useIdAsValue={true}
            />
          </div>

          <div className="form-field">
            <label>
              파일 판매처명 <span className="required">*</span>
            </label>
            {selectedParentChannel.length === 0 ? (
              <div className="form-input disabled-input">
                판매처를 먼저 선택해주세요
              </div>
            ) : channelOptions.length === 0 ? (
              <div className="form-input disabled-input warning">
                선택한 판매처에 자식 판매처가 없습니다.
              </div>
            ) : (
              <CustomSelect
                options={channelOptions}
                selectedValues={selectedChannels}
                onSelectionChange={setSelectedChannels}
                placeholder="파일 판매처명"
                multiple={false}
                useIdAsValue={true}
              />
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>
              박스갯수 <span className="required">*</span>
            </label>
            {selectedProduct.length === 0 || selectedChannels.length === 0 ? (
              <div className="form-input disabled-input">
                제품과 판매처를 먼저 선택해주세요
              </div>
            ) : boxCountOptions.length === 0 ? (
              <div className="form-input disabled-input warning">
                박스별 금액이 등록되어 있지 않습니다. 박스별 가격 탭에서 먼저 등록해주세요.
              </div>
            ) : (
              <CustomSelect
                options={boxCountOptions}
                selectedValues={selectedBoxCount}
                onSelectionChange={setSelectedBoxCount}
                placeholder="박스갯수 선택"
                multiple={false}
                useIdAsValue={true}
              />
            )}
          </div>
        </div>

        {/* 판매처별 가격 정보 표시 - 박스갯수 선택 시에만 표시 */}
        {selectedProduct.length > 0 && selectedBoxCount.length > 0 && selectedBoxPriceInfo && (
          <div className="box-count-info-section">
            <label>{selectedBoxCount[0]}박스 기준 판매처별 가격</label>
            <div className="channel-box-count-list">
              {Object.entries(selectedBoxPriceInfo).map(([channelName, priceInfo]) => {
                const colors = channelColors[channelName] || { bg: "#f5f5f5", text: "#333", border: "#ddd" };

                return (
                  <React.Fragment key={channelName}>
                    {priceInfo.price !== null && (
                      <div className="channel-box-count-item">
                        <span
                          className="channel-label-badge"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderColor: colors.border,
                          }}
                        >
                          {channelName}
                        </span>
                        <span className="box-price-info">
                          <span className="price-value">{priceInfo.price.toLocaleString()}원</span>
                          <span className="price-detail">
                            (배송비 {priceInfo.shippingFee.toLocaleString()}원, 수수료 {priceInfo.fee}%)
                          </span>
                        </span>
                      </div>
                    )}
                    {priceInfo.hiddenPrices && priceInfo.hiddenPrices.length > 0 && priceInfo.hiddenPrices.map(({ hiddenName, price, shippingFee }) => (
                      <div key={`${channelName}-hidden-${hiddenName}`} className="channel-box-count-item">
                        <span
                          className="channel-label-badge"
                          style={{
                            backgroundColor: "#f0f0f0",
                            color: "#555",
                            borderColor: "#ccc",
                          }}
                        >
                          히든: {hiddenName}
                        </span>
                        <span className="box-price-info">
                          <span className="price-value">{price.toLocaleString()}원</span>
                          <span className="price-detail">(배송비 {shippingFee.toLocaleString()}원)</span>
                        </span>
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        <div className="form-actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleRegisterCode}
            disabled={isLoading}
          >
            {isLoading ? "등록 중..." : "코드 등록하기"}
          </Button>
        </div>
      </div>

      {/* 등록된 코드 테이블 */}
      <div className="list-table-wrapper" ref={menuRef}>
        <table className="list-table">
          <thead>
            <tr>
              <th>코드</th>
              <th>제품</th>
              <th>파일 판매처명</th>
              <th>박스</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="no-data">
                  로딩 중...
                </td>
              </tr>
            ) : codeList.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  등록된 코드가 없습니다.
                </td>
              </tr>
            ) : (
              codeList.map((item) => (
                  <tr
                    key={`${item.code}_${item.boxCount}`}
                    onClick={() => openCodeDetailModal(item)}
                    style={{ cursor: "pointer" }}
                    className="clickable-row"
                  >
                    <td className="code-cell">
                      <span>{item.code}</span>
                    </td>
                    <td className="product-cell">{item.product}</td>
                    <td>
                      <div className="channel-badges-inline">
                        {(item.channelDetails || []).map((channel, idx) => (
                          <span key={idx} className="channel-badge-sm">
                            {channel.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="box-count-cell">{item.boxCount}개</td>
                    <td className="date-cell">{item.registeredDate}</td>
                    <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="dropdown-menu-container">
                        <button
                          className="menu-trigger-btn"
                          onClick={() => toggleMenu(`${item.code}_${item.boxCount}`)}
                        >
                          ⋯
                        </button>
                        {openMenuId === `${item.code}_${item.boxCount}` && (
                          <div className="dropdown-menu">
                            <button
                              className="dropdown-item delete"
                              onClick={() => {
                                handleDeleteCode(item);
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
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1}
          >
            «
          </button>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ‹
          </button>
          <span className="pagination-info">
            {pagination.page} / {pagination.totalPages} 페이지 (총 {pagination.totalCount}건)
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            ›
          </button>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages}
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}

export default CodeTab;
