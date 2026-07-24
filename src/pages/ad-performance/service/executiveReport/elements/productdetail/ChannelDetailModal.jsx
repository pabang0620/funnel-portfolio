import { useMemo, useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import DataTable from '../../../../components/common/DataTable';
import { getDailySalesDetail } from '../../api';

/**
 * 판매처별 상세 데이터 모달
 * 일별 판매 상세 (박스별 수량)를 표시 - 선택된 제품의 데이터만
 */
const ChannelDetailModal = ({
  isOpen,
  onClose,
  selectedProduct,
  customDateRange,
  selectedMarketPlaces,
  productList = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [columnInfo, setColumnInfo] = useState({});

  // 선택된 제품 ID 추출
  const productId = useMemo(() => {
    if (!selectedProduct) return null;
    if (Array.isArray(selectedProduct)) {
      return selectedProduct[0] || null;
    }
    return selectedProduct;
  }, [selectedProduct]);

  // 전체 제품 여부 및 제품명 목록 (표시용)
  const { isAllProducts, productNames } = useMemo(() => {
    if (!productList.length) return { isAllProducts: false, productNames: [] };

    // selectedProduct가 배열이고 여러 개인 경우 (전체 제품)
    if (Array.isArray(selectedProduct) && selectedProduct.length > 1) {
      const names = selectedProduct
        .map(id => productList.find(p => p.id === id)?.name)
        .filter(Boolean);
      return { isAllProducts: true, productNames: names };
    }

    // 단일 제품인 경우
    if (productId) {
      const product = productList.find(p => p.id === productId);
      return { isAllProducts: false, productNames: product ? [product.name] : [] };
    }

    return { isAllProducts: false, productNames: [] };
  }, [selectedProduct, productId, productList]);

  // API 데이터 조회
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !customDateRange?.startDate || !customDateRange?.endDate) {
        return;
      }
      if (!productId) {
        return;
      }

      setLoading(true);
      try {
        const response = await getDailySalesDetail({
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
          marketPlaces: selectedMarketPlaces || [],
          productId: productId
        });

        setApiData(response.data);
        setColumnInfo(response.columnInfo || {});
      } catch (error) {
        console.error('일별 판매 상세 데이터 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, customDateRange, selectedMarketPlaces, productId]);

  // 데이터가 있는 판매처만 필터링
  const activeChannels = useMemo(() => {
    if (!columnInfo || Object.keys(columnInfo).length === 0) return [];
    const channels = selectedMarketPlaces || [];
    return channels.filter(ch => columnInfo[ch] && columnInfo[ch].length > 0);
  }, [selectedMarketPlaces, columnInfo]);

  // 테이블 컬럼 구조 생성 (데이터가 있는 것만)
  const tableColumns = useMemo(() => {
    if (activeChannels.length === 0) {
      return [[{ title: "날짜" }]];
    }

    // 첫 번째 행: 날짜 + 판매처 헤더 + 총합계 + 실수량
    const firstRow = [
      { title: "날짜", rowSpan: 2 },
      ...activeChannels.map(channel => {
        const boxCount = columnInfo[channel]?.length || 0;
        // 박스가 2개 이상이면 소계 열 추가
        return {
          title: channel,
          colSpan: boxCount >= 2 ? boxCount + 1 : boxCount
        };
      }),
      { title: "건수", rowSpan: 2 },
      { title: "수량", rowSpan: 2, tooltip: "박스수 × 판매수량" }
    ];

    // 두 번째 행: 각 판매처별 박스 타입들 + 소계 (박스가 2개 이상인 경우)
    const secondRow = [];
    activeChannels.forEach(channel => {
      const boxTypes = columnInfo[channel] || [];
      boxTypes.forEach(col => {
        secondRow.push({
          title: col.label,
          style: col.isHidden ? { backgroundColor: '#fef3c7', color: '#92400e' } : {}
        });
      });
      // 박스가 2개 이상이면 소계 열 추가
      if (boxTypes.length >= 2) {
        secondRow.push({ title: "소계", style: { backgroundColor: '#f1f5f9', fontWeight: '600' } });
      }
    });

    return [firstRow, secondRow];
  }, [activeChannels, columnInfo]);

  // 테이블 데이터 생성
  const tableData = useMemo(() => {
    if (!apiData || apiData.length === 0 || activeChannels.length === 0) {
      return [];
    }

    return apiData.map(row => {
      const cells = [row.date];
      let rowTotal = 0;
      let rowActualTotal = 0; // 실수량 합계

      activeChannels.forEach(channel => {
        const boxTypes = columnInfo[channel] || [];
        let channelSubtotal = 0;

        boxTypes.forEach(col => {
          const key = `${channel}_${col.key}`;
          const actualKey = `${channel}_${col.key}_actual`;
          const value = row[key] || 0;
          const actualValue = row[actualKey] || 0;
          cells.push(value > 0 ? value.toLocaleString() : '-');
          channelSubtotal += value;
          rowTotal += value;
          rowActualTotal += actualValue;
        });

        // 박스가 2개 이상이면 소계 추가
        if (boxTypes.length >= 2) {
          cells.push(channelSubtotal > 0 ? channelSubtotal.toLocaleString() : '-');
        }
      });

      // 총합계 추가
      cells.push(rowTotal > 0 ? rowTotal.toLocaleString() : '-');
      // 실수량 추가
      cells.push(rowActualTotal > 0 ? rowActualTotal.toLocaleString() : '-');

      return { cells };
    });
  }, [apiData, activeChannels, columnInfo]);

  // 합계 행 계산
  const totalRow = useMemo(() => {
    if (!apiData || apiData.length === 0 || activeChannels.length === 0) {
      return null;
    }

    const cells = ['합계'];
    let grandTotal = 0;
    let grandActualTotal = 0; // 실수량 합계

    activeChannels.forEach(channel => {
      const boxTypes = columnInfo[channel] || [];
      let channelSubtotal = 0;

      boxTypes.forEach(col => {
        const key = `${channel}_${col.key}`;
        const actualKey = `${channel}_${col.key}_actual`;
        const total = apiData.reduce((sum, row) => sum + (row[key] || 0), 0);
        const actualTotal = apiData.reduce((sum, row) => sum + (row[actualKey] || 0), 0);
        cells.push(total > 0 ? total.toLocaleString() : '-');
        channelSubtotal += total;
        grandTotal += total;
        grandActualTotal += actualTotal;
      });

      // 박스가 2개 이상이면 소계 추가
      if (boxTypes.length >= 2) {
        cells.push(channelSubtotal > 0 ? channelSubtotal.toLocaleString() : '-');
      }
    });

    // 총합계 추가
    cells.push(grandTotal > 0 ? grandTotal.toLocaleString() : '-');
    // 실수량 추가
    cells.push(grandActualTotal > 0 ? grandActualTotal.toLocaleString() : '-');

    return { cells, isTotal: true };
  }, [apiData, activeChannels, columnInfo]);

  // 최종 테이블 데이터 (데이터 + 합계)
  const finalTableData = useMemo(() => {
    if (!tableData.length) return [];
    if (!totalRow) return tableData;
    return [...tableData, totalRow];
  }, [tableData, totalRow]);

  return (
    <Modal isOpen={isOpen} maxWidth="90%">
      <div className="modal-header" style={{ borderBottom: 'none' }}>
        <h2 className="modal-title">일별 판매 상세 (박스별 수량)</h2>
        <button onClick={onClose} className="modal-close-btn">
          닫기
        </button>
      </div>
      <div className="modal-body" style={{ borderTop: 'none', padding: 0 }}>
        <div className="modal-info" style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-start',
          padding: '0.75rem 1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          margin: '0 1rem 1rem 1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <strong style={{ color: '#64748b', fontSize: '0.875rem' }}>기간</strong>
            <span style={{ color: '#334155', fontSize: '0.875rem' }}>
              {customDateRange?.startDate} ~ {customDateRange?.endDate}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: 0 }}>
            <strong style={{ color: '#64748b', fontSize: '0.875rem', flexShrink: 0 }}>제품</strong>
            {isAllProducts ? (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.375rem',
                flex: 1
              }}>
                {productNames.map((name, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#e2e8f0',
                      color: '#475569',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8125rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ color: '#334155', fontSize: '0.875rem' }}>
                {productNames[0] || '없음'}
              </span>
            )}
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            데이터 로딩 중...
          </div>
        ) : finalTableData.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            해당 기간에 판매 No data.
          </div>
        ) : (
          <div>
            <DataTable
              columns={tableColumns}
              data={finalTableData}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ChannelDetailModal;
