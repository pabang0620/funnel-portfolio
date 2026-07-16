import { useState } from 'react';
import DataTable from '../../../../components/common/DataTable';
import CustomSelect from '../../../../components/ui/CustomSelect';

/**
 * 2번 테이블: 매체별 실적현황
 * 선택된 매체별로 광고비와 ROAS를 표시
 */
const MediaPerformanceTable = ({
  columns,
  data,
  isAdmin,
  selectedMedia,
  onMediaChange,
  mediaList,
  mediaSpecialOptions,
  isExpanded,
  onExpandChange,
}) => {

  // "간소화"와 "전체" 옵션을 포함한 매체 목록 생성
  // mediaList는 이미 부모-자식 순서로 정렬되어 있음
  const mediaOptions = [
    { id: -1, name: "간소화" },
    { id: 0, name: "전체" },
    ...(mediaList || [])
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
          <h2 className="section-title" style={{ margin: 0 }}>2. 매체별 실적현황</h2>
        </div>
        <div style={{ width: '180px' }} onClick={(e) => e.stopPropagation()}>
          <CustomSelect
            options={mediaOptions}
            selectedValues={selectedMedia}
            onSelectionChange={onMediaChange}
            placeholder="매체 선택"
            alwaysShowPlaceholder={true}
            specialOptions={mediaSpecialOptions}
            useIdAsValue={true}
          />
        </div>
      </div>

      <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="table-container">
          {selectedMedia.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              조회할 매체를 선택해주세요
            </div>
          ) : (
            <>
              <DataTable
                isAdmin={isAdmin}
                columns={columns}
                data={data}
              />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', textAlign: 'right' }}>
                * 마케팅리포트에서 입력한 데이터입니다
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPerformanceTable;
