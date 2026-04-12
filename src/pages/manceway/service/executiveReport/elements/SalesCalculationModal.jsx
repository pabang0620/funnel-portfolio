import Modal from '../../../components/ui/Modal';

/**
 * 매출 계산식 상세 모달 컴포넌트
 * 박스별 단가 × 수량 = 소계 형식으로 계산 과정을 표시합니다
 */
const SalesCalculationModal = ({
  isOpen,
  onClose,
  salesByBox = [],
  productName = '',
  totalSales = 0,
}) => {
  // 총 수량 계산
  const totalQuantity = salesByBox.reduce((sum, box) => {
    if (box.details && box.details.length > 0) {
      return sum + box.details.reduce((s, d) => s + d.quantity, 0);
    }
    return sum;
  }, 0);

  return (
    <Modal isOpen={isOpen} maxWidth="500px">
      <div className="modal-header" style={{ borderBottom: 'none' }}>
        <h2 className="modal-title">매출 계산식</h2>
        <button onClick={onClose} className="modal-close-btn">
          닫기
        </button>
      </div>
      <div className="modal-body" style={{ borderTop: 'none', padding: '0 1.5rem 1.5rem' }}>
        {productName && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            <strong style={{ color: '#334155' }}>{productName}</strong>
          </div>
        )}

        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 80px 1fr',
            backgroundColor: '#f1f5f9',
            padding: '0.75rem 1rem',
            fontWeight: '600',
            fontSize: '0.8125rem',
            color: '#475569',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div>박스</div>
            <div style={{ textAlign: 'right' }}>단가</div>
            <div style={{ textAlign: 'right' }}>수량</div>
            <div style={{ textAlign: 'right' }}>소계</div>
          </div>

          {/* 데이터 행 */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {salesByBox.length > 0 ? (
              salesByBox.map((box, boxIndex) => (
                <div key={boxIndex}>
                  {box.details && box.details.length > 0 ? (
                    box.details.map((detail, detailIndex) => (
                      <div
                        key={`${boxIndex}-${detailIndex}`}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '80px 1fr 80px 1fr',
                          padding: '0.625rem 1rem',
                          fontSize: '0.875rem',
                          color: '#334155',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: detailIndex % 2 === 1 ? '#fafafa' : 'white'
                        }}
                      >
                        <div style={{ fontWeight: '500' }}>{box.boxCount}박스</div>
                        <div style={{ textAlign: 'right' }}>
                          {detail.unitPrice.toLocaleString()}원
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          × {detail.quantity.toLocaleString()}건
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: '500' }}>
                          = {detail.subtotal.toLocaleString()}원
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 80px 1fr',
                        padding: '0.625rem 1rem',
                        fontSize: '0.875rem',
                        color: '#334155',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{ fontWeight: '500' }}>{box.boxCount}박스</div>
                      <div style={{ textAlign: 'right', gridColumn: 'span 3' }}>
                        {box.sales.toLocaleString()}원
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                계산 상세 데이터가 없습니다.
              </div>
            )}
          </div>

          {/* 합계 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 80px 1fr',
            padding: '0.875rem 1rem',
            backgroundColor: '#f8fafc',
            borderTop: '2px solid #e2e8f0',
            fontWeight: '600',
            fontSize: '0.9375rem'
          }}>
            <div style={{ color: '#475569' }}>합계</div>
            <div></div>
            <div style={{ textAlign: 'right', color: '#64748b' }}>
              {totalQuantity > 0 ? `${totalQuantity.toLocaleString()}건` : ''}
            </div>
            <div style={{ textAlign: 'right', color: '#0f172a' }}>
              {totalSales.toLocaleString()}원
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          fontSize: '0.8125rem',
          color: '#3b82f6'
        }}>
          <strong>계산식:</strong> 매출 = Σ(박스별 단가 × 수량)
        </div>
      </div>
    </Modal>
  );
};

export default SalesCalculationModal;
