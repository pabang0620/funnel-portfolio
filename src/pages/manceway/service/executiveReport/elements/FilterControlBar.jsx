import CustomSelect from '../../../components/ui/CustomSelect';
import excelIcon from '../../../assets/excel.png';

/**
 * 필터 컨트롤 바 컴포넌트
 * 판매처별 보기 / 파일판매처별 보기 모드 선택 (자사)
 * 팀별 보기 / 매체별 보기 모드 선택 (대행)
 * 제품 선택은 별도의 ProductFilter 컴포넌트로 분리
 */
const FilterControlBar = ({
  salesChannelList,
  selectedSalesChannels,
  onSalesChannelChange,
  salesChannelSpecialOptions,
  childSalesChannelList,
  childSalesChannelSpecialOptions,
  selectedChildSalesChannels,
  onChildSalesChannelChange,
  viewMode = 'channel', // 'channel' | 'fileChannel' | 'team' | 'media'
  onViewModeChange,
  onExportToExcel,    // 엑셀 다운로드 핸들러
  isExportingExcel,   // 다운로드 중 상태
  isAdmin,            // S등급 관리자 여부
  isAgencyMode = false, // 대행 모드 여부
  onOpenColumnSettings, // 컬럼 설정 모달 열기
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      {/* 왼쪽 그룹: 엑셀 버튼 + 보기 모드 탭 + 필터 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* 엑셀 다운로드 버튼 */}
        <button
          onClick={onExportToExcel}
          disabled={isExportingExcel}
          title={isExportingExcel ? '다운로드 중...' : '엑셀 다운로드'}
          style={{
            padding: '0.5rem',
            border: '1px solid #e4e4e7',
            borderRadius: '6px',
            cursor: isExportingExcel ? 'not-allowed' : 'pointer',
            backgroundColor: isExportingExcel ? '#f9fafb' : '#fff',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
          onMouseEnter={(e) => {
            if (!isExportingExcel) {
              e.target.style.backgroundColor = '#f4f4f5';
              e.target.style.borderColor = '#d4d4d8';
            }
          }}
          onMouseLeave={(e) => {
            if (!isExportingExcel) {
              e.target.style.backgroundColor = '#fff';
              e.target.style.borderColor = '#e4e4e7';
            }
          }}
        >
          {isExportingExcel ? (
            <span style={{ fontSize: '16px' }}>⏳</span>
          ) : (
            <img src={excelIcon} alt="Excel" style={{ width: '18px', height: '18px' }} />
          )}
        </button>

        {/* 컬럼 설정 버튼 (자사 모드에서만 표시) */}
        {!isAgencyMode && onOpenColumnSettings && (
          <button
            onClick={onOpenColumnSettings}
            title="컬럼 표시/숨김 설정"
            style={{
              padding: '0.5rem',
              border: '1px solid #e4e4e7',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: '#fff',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f4f4f5';
              e.target.style.borderColor = '#d4d4d8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.borderColor = '#e4e4e7';
            }}
          >
            <span style={{ fontSize: '18px' }}>⚙️</span>
          </button>
        )}

        {/* 보기 모드 선택 탭 */}
      <div
        style={{
          display: 'flex',
          border: '1px solid #e4e4e7',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {isAgencyMode ? (
          <>
            {/* 대행 모드: 팀별/매체별 */}
            <button
              onClick={() => onViewModeChange('team')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'team' ? '#3b82f6' : '#fff',
                color: viewMode === 'team' ? '#fff' : '#71717a',
                fontWeight: viewMode === 'team' ? '600' : '400',
                transition: 'all 0.15s ease',
              }}
            >
              팀별 보기
            </button>
            <button
              onClick={() => onViewModeChange('media')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                border: 'none',
                borderLeft: '1px solid #e4e4e7',
                cursor: 'pointer',
                backgroundColor: viewMode === 'media' ? '#3b82f6' : '#fff',
                color: viewMode === 'media' ? '#fff' : '#71717a',
                fontWeight: viewMode === 'media' ? '600' : '400',
                transition: 'all 0.15s ease',
              }}
            >
              매체별 보기
            </button>
          </>
        ) : (
          <>
            {/* 자사 모드: 판매처별/파일판매처별 */}
            <button
              onClick={() => onViewModeChange('channel')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
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
              onClick={() => onViewModeChange('fileChannel')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
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
          </>
        )}
      </div>

      {/* 모드에 따른 필터 표시 */}
      {isAgencyMode ? (
        // 대행 모드: 팀별 또는 매체별 필터
        viewMode === 'team' ? (
          <div style={{ width: '180px' }}>
            <CustomSelect
              options={salesChannelList} // 팀 목록
              selectedValues={selectedSalesChannels} // 선택된 팀 ID
              onSelectionChange={onSalesChannelChange}
              placeholder="팀 선택"
              alwaysShowPlaceholder={true}
              specialOptions={salesChannelSpecialOptions}
              useIdAsValue={true}
            />
          </div>
        ) : (
          <div style={{ width: '180px' }}>
            <CustomSelect
              options={salesChannelList} // 매체 목록
              selectedValues={selectedSalesChannels} // 선택된 매체 ID
              onSelectionChange={onSalesChannelChange}
              placeholder="매체 선택"
              alwaysShowPlaceholder={true}
              specialOptions={salesChannelSpecialOptions}
              useIdAsValue={true}
            />
          </div>
        )
      ) : (
        // 자사 모드: 판매처별 또는 파일판매처별 필터
        viewMode === 'channel' ? (
          <div style={{ width: '180px' }}>
            <CustomSelect
              options={salesChannelList}
              selectedValues={selectedSalesChannels}
              onSelectionChange={onSalesChannelChange}
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
                ...childSalesChannelList.map(child => ({
                  id: child.id,
                  name: child.name,
                  parentId: child.parentId,
                  parentName: child.parentName
                }))
              ]}
              selectedValues={selectedChildSalesChannels}
              onSelectionChange={onChildSalesChannelChange}
              placeholder="파일 판매처명 선택"
              alwaysShowPlaceholder={true}
              useIdAsValue={true}
              groupByParent={true}
              specialOptions={childSalesChannelSpecialOptions}
              globalSpecialOptions={["전체"]}
            />
          </div>
        )
      )}
      </div>
    </div>
  );
};

/**
 * 제품 선택 필터 (테이블 좌측 상단용)
 */
export const ProductFilter = ({
  productList,
  selectedProducts,
  onProductChange,
  productSpecialOptions,
  hideEmptyRows,
  setHideEmptyRows,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {/* 제품 선택 */}
      <div style={{ width: '180px' }}>
        <CustomSelect
          options={productList}
          selectedValues={selectedProducts}
          onSelectionChange={onProductChange}
          placeholder="제품 선택"
          alwaysShowPlaceholder={true}
          specialOptions={productSpecialOptions}
          globalSpecialOptions={["전체", "자사", "대행"]}
          useIdAsValue={true}
          searchable={true}
        />
      </div>

      {/* 데이터 없는 행 숨기기 체크박스 */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
        }}
      >
        <input
          type="checkbox"
          checked={hideEmptyRows}
          onChange={(e) => setHideEmptyRows(e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            cursor: 'pointer',
            accentColor: '#3b82f6',
            margin: 0,
          }}
        />
        <span style={{ color: '#374151', fontWeight: '500' }}>
          데이터 없는 행 숨기기
        </span>
      </label>
    </div>
  );
};

export default FilterControlBar;
