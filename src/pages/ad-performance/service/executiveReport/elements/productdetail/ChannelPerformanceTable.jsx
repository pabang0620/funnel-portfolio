import { useState } from 'react';
import DataTable from '../../../../components/common/DataTable';
import CustomSelect from '../../../../components/ui/CustomSelect';
import Button from '../../../../components/ui/Button';

/**
 * 3번 테이블: 판매처별 실적현황
 * 선택된 판매처별로 판매건수와 매출을 표시
 */
const ChannelPerformanceTable = ({
  columns,
  data,
  selectedChannels,
  onChannelChange,
  onDetailClick,
  salesChannelList,
  salesChannelSpecialOptions,
  // 파일판매처별 보기용 props
  childSalesChannelList = [],
  childSalesChannelSpecialOptions = {},
  selectedChildSalesChannels = [],
  onChildSalesChannelChange,
  viewMode = 'channel',
  onViewModeChange,
  isExpanded,
  onExpandChange,
}) => {

  // "간소화"와 "전체" 옵션을 포함한 판매처 목록 생성
  const channelOptions = [
    { id: 0, name: "간소화" },
    { id: -1, name: "전체" },
    ...(salesChannelList || [])
  ];

  return (
    <div className={`product-section accordion-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div
        className="accordion-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '1rem' : 0 }}
      >
        <div
          className="accordion-title-wrapper"
          onClick={() => onExpandChange(!isExpanded)}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}
        >
          <span className={`accordion-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
          <h2 className="section-title" style={{ margin: 0 }}>3. 판매처별 실적현황</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
          {/* 보기 모드 선택 탭 */}
          <div
            style={{
              display: 'flex',
              border: '1px solid #e4e4e7',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => onViewModeChange && onViewModeChange('channel')}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'channel' ? '#3b82f6' : '#fff',
                color: viewMode === 'channel' ? '#fff' : '#71717a',
                fontWeight: viewMode === 'channel' ? '600' : '400',
                transition: 'all 0.15s ease',
              }}
            >
              판매처별
            </button>
            <button
              onClick={() => onViewModeChange && onViewModeChange('fileChannel')}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                border: 'none',
                borderLeft: '1px solid #e4e4e7',
                cursor: 'pointer',
                backgroundColor: viewMode === 'fileChannel' ? '#3b82f6' : '#fff',
                color: viewMode === 'fileChannel' ? '#fff' : '#71717a',
                fontWeight: viewMode === 'fileChannel' ? '600' : '400',
                transition: 'all 0.15s ease',
              }}
            >
              파일판매처별
            </button>
          </div>

          {/* 모드에 따른 필터 표시 */}
          {viewMode === 'channel' ? (
            <div style={{ width: '180px' }}>
              <CustomSelect
                options={channelOptions}
                selectedValues={selectedChannels}
                onSelectionChange={onChannelChange}
                placeholder="판매처 선택"
                alwaysShowPlaceholder={true}
                specialOptions={salesChannelSpecialOptions}
              />
            </div>
          ) : (
            <div style={{ width: '240px' }}>
              <CustomSelect
                options={[
                  { id: -1, name: "전체" },
                  ...(childSalesChannelList || []).map(child => ({
                    id: child.id,
                    name: child.name,
                    parentId: child.parentId,
                    parentName: child.parentName
                  }))
                ]}
                selectedValues={selectedChildSalesChannels || []}
                onSelectionChange={onChildSalesChannelChange || (() => {})}
                placeholder="파일 판매처명 선택"
                alwaysShowPlaceholder={true}
                useIdAsValue={true}
                groupByParent={true}
                specialOptions={childSalesChannelSpecialOptions}
                globalSpecialOptions={["전체"]}
              />
            </div>
          )}
        </div>
      </div>

      <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="table-container">
          {viewMode === 'channel' && selectedChannels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              판매처를 선택해주세요.
            </div>
          ) : viewMode === 'fileChannel' && (!selectedChildSalesChannels || selectedChildSalesChannels.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              파일 판매처명을 선택해주세요.
            </div>
          ) : (
            <DataTable
              isAdmin={false}
              className="sales-channel-table"
              columns={columns}
              data={data}
            />
          )}
        </div>

        {/* 자세히보기 버튼 */}
        <div className="detail-btn-container">
          <Button
            variant="secondary"
            size="small"
            onClick={onDetailClick}
          >
            자세히보기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChannelPerformanceTable;
