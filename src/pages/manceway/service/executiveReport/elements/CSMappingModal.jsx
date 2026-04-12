import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../../../components/ui/Button';
import { getProducts } from '../api';
import { fetchWithAuth } from '../../../utils/api';

/**
 * CS 데이터 매핑 모달
 * 경영리포트 업로드에서 CS 데이터가 감지되면 표시
 */
const CSMappingModal = ({ csData, onClose, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [manualMappings, setManualMappings] = useState({});
  const [error, setError] = useState(null);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      if (response.success) {
        // "전체" 옵션(id: null) 제외하고 실제 제품만 필터링
        const filteredProducts = response.data.filter(p => p.id !== null);
        setProducts(filteredProducts);
      }
    } catch (err) {
      console.error('제품 목록 조회 실패:', err);
    }
  };

  const handleMappingChange = (csProductName, productId, productName) => {
    setManualMappings(prev => ({
      ...prev,
      [csProductName]: { csProductName, productId, productName }
    }));
  };

  const handleSave = async () => {
    const unmatchedCount = csData.unmatchedProducts.filter(
      name => !manualMappings[name]
    ).length;

    if (unmatchedCount > 0) {
      setError(`${unmatchedCount}개 상품의 매칭이 필요합니다.`);
      return;
    }

    setLoading(true);
    setError(null);
    setDuplicateInfo(null);

    try {
      const response = await fetchWithAuth('/api/cs/save', {
        method: 'POST',
        body: JSON.stringify({
          parsedData: csData.parsedData,
          newMappings: Object.values(manualMappings),
          marketPlaceId: null
        })
      });

      const data = await response.json();

      // 중복 데이터 에러 (400)
      if (response.status === 400 && data.data?.duplicates) {
        setDuplicateInfo({
          duplicates: data.data.duplicates,
          message: data.msg
        });
        setLoading(false);
        return;
      }

      // 기타 에러
      if (!response.ok || !data.success) {
        setError(data.msg || '저장 중 오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      // 성공
      onComplete(data.data);
    } catch (err) {
      console.error('CS 데이터 저장 오류:', err);
      setError('저장 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const isAllMatched = csData.unmatchedProducts.every(
    name => manualMappings[name]
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <h3>📊 CS 데이터 매핑</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Icon & Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              🔗
            </div>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              제품 매핑을 완료하면 CS 데이터가 저장됩니다
            </p>
          </div>

          {/* Summary Stats */}
          <div style={{
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>
              📁 파일 정보
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                  {csData.summary.total}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>전체</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#16a34a' }}>
                  {csData.summary.valid}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>유효</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#dc2626' }}>
                  {csData.summary.filtered}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#dc2626' }}>필터링</div>
              </div>
            </div>
          </div>

          {/* Matched Products */}
          {csData.matchedProducts.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#16a34a'
              }}>
                <span>✅ 자동 매칭됨</span>
                <span style={{
                  background: '#dcfce7',
                  color: '#16a34a',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '700'
                }}>
                  {csData.matchedProducts.length}
                </span>
              </div>
              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                border: '1px solid #d1fae5',
                borderRadius: '8px',
                background: '#f0fdf4'
              }}>
                {csData.matchedProducts.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr auto 1.2fr auto',
                    gap: '0.75rem',
                    alignItems: 'center',
                    padding: '0.625rem 0.875rem',
                    borderBottom: idx < csData.matchedProducts.length - 1 ? '1px solid #d1fae5' : 'none',
                    fontSize: '0.8rem'
                  }}>
                    <span style={{ color: '#64748b', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.csProductName}
                    </span>
                    <span style={{ color: '#94a3b8' }}>→</span>
                    <span style={{ color: '#16a34a', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.productName}
                    </span>
                    <span style={{
                      background: '#dcfce7',
                      color: '#16a34a',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.count}건
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unmatched Products */}
          {csData.unmatchedProducts.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#dc2626'
              }}>
                <span>⚠️ 매칭 필요</span>
                <span style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '700'
                }}>
                  {csData.unmatchedProducts.length}
                </span>
              </div>
              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                background: '#fff'
              }}>
                {csData.unmatchedProducts.map((name, idx) => (
                  <div key={idx} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.8fr',
                    gap: '0.75rem',
                    alignItems: 'center',
                    padding: '0.625rem 0.875rem',
                    borderBottom: idx < csData.unmatchedProducts.length - 1 ? '1px solid #fecaca' : 'none',
                    background: idx % 2 === 0 ? '#fff' : '#fefcfc'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: '600' }}>
                      {name}
                    </span>
                    <select
                      style={{
                        padding: '0.5rem 0.625rem',
                        border: manualMappings[name] ? '1px solid #16a34a' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        background: '#fff',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                      }}
                      value={manualMappings[name]?.productId || ''}
                      onChange={e => {
                        const product = products.find(p => p.id === parseInt(e.target.value));
                        if (product) {
                          handleMappingChange(name, product.id, product.name);
                        }
                      }}
                    >
                      <option value="">제품 선택 ({products.length}개)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Duplicate Data Warning */}
          {duplicateInfo && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#dc2626'
                }}>
                  <span>🚫 중복 데이터 발견</span>
                  <span style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {duplicateInfo.duplicates.length}건
                  </span>
                </div>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#991b1b',
                  marginBottom: '0.75rem',
                  lineHeight: '1.5'
                }}>
                  {duplicateInfo.message}
                </p>
                <div style={{
                  maxHeight: '120px',
                  overflowY: 'auto',
                  background: '#fff',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '0.5rem'
                }}>
                  {duplicateInfo.duplicates.map((orderNumber, idx) => (
                    <div key={idx} style={{
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      padding: '0.25rem 0.5rem',
                      borderBottom: idx < duplicateInfo.duplicates.length - 1 ? '1px solid #fee2e2' : 'none',
                      fontFamily: 'monospace'
                    }}>
                      {orderNumber}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#92400e'
              }}>
                💡 엑셀 파일에서 중복된 주문번호를 제거한 후 다시 업로드해주세요.
              </div>
            </div>
          )}

          {/* Info */}
          {csData.unmatchedProducts.length > 0 && (
            <div style={{
              background: '#eff6ff',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#1e40af',
              border: '1px solid #bfdbfe'
            }}>
              💡 모든 상품의 매칭을 완료해주세요
            </div>
          )}
        </div>

        <div className="modal-footer" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1rem',
          marginTop: '1.5rem'
        }}>
          <Button variant="secondary" size="medium" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={handleSave}
            disabled={!isAllMatched || loading}
          >
            {loading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CSMappingModal;
