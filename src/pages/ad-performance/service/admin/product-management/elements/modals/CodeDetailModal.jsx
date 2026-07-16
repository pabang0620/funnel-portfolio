import React, { useState, useMemo } from "react";
import Button from "../../../../../components/ui/Button";
import CustomSelect from "../../../../../components/ui/CustomSelect";

function CodeDetailModal({
  selectedCodeForDetail,
  getBoxPricesForCode,
  getProductHiddens = () => [],
  onClose,
  // 판매처 추가/삭제 관련 props
  channelOptions = [],
  boxPriceList = [],
  onAddChannel,
  onRemoveChannel,
  isLoading = false,
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNewChannel, setSelectedNewChannel] = useState([]);
  // 모달 내에서 추가/삭제된 채널 추적 (UI 업데이트용) - ID 기반
  const [localAddedChannels, setLocalAddedChannels] = useState([]);
  const [localRemovedChannelIds, setLocalRemovedChannelIds] = useState([]);

  if (!selectedCodeForDetail) return null;

  // 현재 표시할 채널 ID 목록 (기존 - 삭제된 것 + 로컬에서 추가된 것)
  const displayChannelIds = [
    ...selectedCodeForDetail.channelIds.filter(
      (id) => !localRemovedChannelIds.includes(id)
    ),
    ...localAddedChannels.map((c) => c.id),
  ];
  // 현재 표시할 채널 이름 목록
  const displayChannels = [
    ...selectedCodeForDetail.channels.filter(
      (_, idx) => !localRemovedChannelIds.includes(selectedCodeForDetail.channelIds[idx])
    ),
    ...localAddedChannels.map((c) => c.name),
  ];
  // 채널 상세 정보 (parentName 포함)
  const displayChannelDetails = [
    ...(selectedCodeForDetail.channelDetails || []).filter(
      (ch) => !localRemovedChannelIds.includes(ch.id)
    ),
    ...localAddedChannels.map((c) => ({
      id: c.id,
      name: c.name,
      parentId: null,
      parentName: null,
    })),
  ];

  const boxPrices = getBoxPricesForCode(
    selectedCodeForDetail.productId,
    displayChannelIds
  );

  // 추가 가능한 판매처 (이미 등록되지 않은 판매처) - ID 기반 비교
  const availableChannels = channelOptions.filter((ch) => {
    // 이미 등록된 판매처 제외 (기존 + 로컬 추가)
    return !displayChannelIds.includes(ch.id);
  });

  // 박스별 금액이 등록되지 않은 판매처 목록 (툴팁용)
  const channelsWithoutBoxPrice = availableChannels.filter((ch) => {
    return !boxPriceList.some(
      (bp) =>
        bp.productId === selectedCodeForDetail.productId &&
        bp.marketPlaceId === ch.id
    );
  });

  // 선택한 판매처의 박스별 금액 정보 - ID 기반
  const selectedChannelBoxPrice = useMemo(() => {
    if (selectedNewChannel.length === 0) return null;

    const channelId = selectedNewChannel[0];
    const boxPrice = boxPriceList.find(
      (bp) =>
        bp.productId === selectedCodeForDetail.productId &&
        bp.marketPlaceId === channelId
    );

    return boxPrice || null;
  }, [
    selectedNewChannel,
    boxPriceList,
    selectedCodeForDetail.productId,
  ]);

  const handleAddChannel = async () => {
    if (selectedNewChannel.length === 0 || !onAddChannel) return;

    const channelId = selectedNewChannel[0];
    const channelObj = channelOptions.find((c) => c.id === channelId);
    if (channelObj) {
      const success = await onAddChannel(
        selectedCodeForDetail,
        channelObj.id,
        channelObj.name
      );
      if (success) {
        // 로컬 상태에 추가된 채널 저장 (UI 즉시 업데이트)
        setLocalAddedChannels((prev) => [
          ...prev,
          { id: channelObj.id, name: channelObj.name },
        ]);
        setSelectedNewChannel([]);
        setIsEditMode(false);
      }
    }
  };

  const handleRemoveChannel = async (channelId, channelName) => {
    if (!onRemoveChannel) return;

    // 판매처가 1개만 남은 경우 삭제 불가
    if (displayChannelIds.length <= 1) {
      return;
    }

    const success = await onRemoveChannel(
      selectedCodeForDetail,
      channelId,
      channelName
    );
    if (success) {
      // 로컬 상태에서 삭제된 채널 추적
      // 로컬에서 추가된 채널인 경우 localAddedChannels에서 제거
      if (localAddedChannels.some((c) => c.id === channelId)) {
        setLocalAddedChannels((prev) =>
          prev.filter((c) => c.id !== channelId)
        );
      } else {
        // 기존 채널인 경우 localRemovedChannelIds에 추가
        setLocalRemovedChannelIds((prev) => [...prev, channelId]);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content code-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>코드 상세정보</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {/* 기본 정보 */}
          <div className="detail-modal-section">
            <h4 className="detail-modal-section-title">기본 정보</h4>
            <div className="detail-modal-info-grid">
              <div className="detail-info-item">
                <span className="detail-info-label">코드</span>
                <span className="detail-info-value code-value">
                  {selectedCodeForDetail.code}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">제품</span>
                <span className="detail-info-value">
                  {selectedCodeForDetail.product}
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">박스 수</span>
                <span className="detail-info-value">
                  {selectedCodeForDetail.boxCount}개
                </span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">등록일</span>
                <span className="detail-info-value">
                  {selectedCodeForDetail.registeredDate}
                </span>
              </div>
            </div>
            <div className="detail-info-item full-width">
              <span className="detail-info-label">판매처</span>
              <div className="detail-badges">
                {displayChannelDetails.map((channel, idx) => (
                  <span
                    key={idx}
                    className="detail-badge channel"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {channel.parentId ? channel.parentName : channel.name}
                    {onRemoveChannel && displayChannelDetails.length > 1 && (
                      <button
                        onClick={() => handleRemoveChannel(channel.id, channel.name)}
                        disabled={isLoading}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: isLoading ? "not-allowed" : "pointer",
                          padding: "0 2px",
                          color: "#ef4444",
                          fontSize: "14px",
                          lineHeight: 1,
                          opacity: isLoading ? 0.5 : 1,
                        }}
                        title="판매처 삭제"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 수정 모드: 판매처 추가 */}
          {isEditMode && onAddChannel && (
            <div
              className="detail-modal-section"
              style={{
                backgroundColor: "#f0f9ff",
                padding: "16px",
                borderRadius: "8px",
                marginTop: "16px",
              }}
            >
              <h4
                className="detail-modal-section-title"
                style={{ marginBottom: "12px" }}
              >
                판매처 추가
              </h4>
              {availableChannels.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  추가 가능한 판매처가 없습니다.
                </p>
              ) : (
                <>
                  <CustomSelect
                    options={availableChannels}
                    selectedValues={selectedNewChannel}
                    onSelectionChange={setSelectedNewChannel}
                    placeholder="추가할 판매처 선택"
                    multiple={false}
                    useIdAsValue={true}
                  />

                  {/* 선택한 판매처의 박스별 금액 정보 */}
                  {selectedNewChannel.length > 0 && (
                    <div style={{ marginTop: "12px" }}>
                      {selectedChannelBoxPrice ? (
                        <div
                          style={{
                            backgroundColor: "#fff",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{ fontWeight: "600", fontSize: "13px" }}
                            >
                              {selectedNewChannel[0]} 박스별 금액
                            </span>
                            <span
                              style={{ fontSize: "12px", color: "#64748b" }}
                            >
                              수수료 {selectedChannelBoxPrice.fee || 0}%
                            </span>
                          </div>
                          <table
                            className="price-card-table"
                            style={{ fontSize: "13px" }}
                          >
                            <thead>
                              <tr>
                                <th>박스</th>
                                <th>판매가</th>
                                <th>배송비</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedChannelBoxPrice.boxPrices.map(
                                (price) => (
                                  <tr key={price.boxCount}>
                                    <td className="box-col">
                                      {price.boxCount}박스
                                    </td>
                                    <td className="price-col">
                                      {price.price.toLocaleString()}원
                                    </td>
                                    <td>
                                      {price.shippingFee.toLocaleString()}원
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: "#fef2f2",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #fecaca",
                          }}
                        >
                          <p
                            style={{
                              color: "#dc2626",
                              fontSize: "13px",
                              margin: 0,
                            }}
                          >
                            <strong>{selectedNewChannel[0]}</strong> 판매처의
                            박스별 금액이 기입되지 않았습니다.
                          </p>
                          <p
                            style={{
                              color: "#b91c1c",
                              fontSize: "12px",
                              margin: "4px 0 0 0",
                            }}
                          >
                            박스별 가격 탭에서 먼저 등록해야 판매처를 추가할 수
                            있습니다.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "12px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        setIsEditMode(false);
                        setSelectedNewChannel([]);
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleAddChannel}
                      disabled={
                        selectedNewChannel.length === 0 ||
                        !selectedChannelBoxPrice ||
                        isLoading
                      }
                    >
                      {isLoading ? "추가 중..." : "추가"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 박스별 가격 정보 */}
          <div className="detail-modal-section">
            <h4 className="detail-modal-section-title">박스별 가격 정보</h4>
            {boxPrices.length > 0 ? (
              <div className="detail-price-cards">
                {boxPrices.map((bp) => (
                  <div key={bp.id} className="detail-price-card">
                    <div className="price-card-header">
                      <div className="price-card-channel-info">
                        <span className="price-card-channel">{bp.channel}</span>
                        <span className="price-card-fee">
                          수수료 {bp.fee || 0}%
                        </span>
                      </div>
                      <span className="price-card-date">
                        등록: {bp.registeredDate}
                      </span>
                    </div>
                    <table className="price-card-table">
                      <thead>
                        <tr>
                          <th>박스</th>
                          <th>판매가</th>
                          <th>배송비</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bp.boxPrices.map((price) => (
                          <tr key={price.boxCount}>
                            <td className="box-col">{price.boxCount}박스</td>
                            <td className="price-col">
                              {price.price.toLocaleString()}원
                            </td>
                            <td>{price.shippingFee.toLocaleString()}원</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* 히든별 가격 */}
                    {Object.keys(bp.hiddenPrices || {}).length > 0 && (
                      <div className="price-card-hidden">
                        <span className="hidden-section-title">
                          히든별 가격
                        </span>
                        <div className="hidden-price-items">
                          {Object.entries(bp.hiddenPrices).map(([key, hp]) => {
                            const [boxNum, hiddenIdentifier] = key.split("_");
                            // 히든 번호인 경우 이름으로 변환
                            let displayName = hiddenIdentifier;
                            if (/^\d+$/.test(hiddenIdentifier)) {
                              const productHiddens = getProductHiddens(selectedCodeForDetail.productId);
                              const hiddenInfo = productHiddens.find(h => String(h.number) === hiddenIdentifier);
                              if (hiddenInfo) {
                                displayName = hiddenInfo.name;
                              }
                            }
                            return (
                              <div key={key} className="hidden-price-item">
                                <span className="hp-label">
                                  {boxNum}박스 - {displayName}
                                </span>
                                <span className="hp-values">
                                  {hp.price.toLocaleString()}원 / 배송비{" "}
                                  {hp.shippingFee.toLocaleString()}원
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="detail-empty-message">
                등록된 박스별 가격이 없습니다.
              </p>
            )}
          </div>
        </div>
        <div
          className="modal-footer"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          {/* 수정하기 버튼 - onAddChannel이 있을 때만 표시 */}
          {onAddChannel && !isEditMode && (
            <div style={{ position: "relative", marginRight: "auto" }}>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => setIsEditMode(true)}
                disabled={availableChannels.length === 0}
                title={
                  availableChannels.length === 0
                    ? "모든 판매처가 이미 등록되어 있습니다."
                    : channelsWithoutBoxPrice.length > 0
                    ? `박스별 금액 미등록: ${channelsWithoutBoxPrice
                        .map((c) => c.name)
                        .join(", ")}`
                    : ""
                }
              >
                {availableChannels.length > 0
                  ? "판매처 추가"
                  : "모든 판매처 등록됨"}
              </Button>
            </div>
          )}
          {!onAddChannel && <div />}
          <Button variant="secondary" size="medium" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CodeDetailModal;
