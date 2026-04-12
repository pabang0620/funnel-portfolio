import CustomSelect from "../../../components/ui/CustomSelect";

/**
 * 매체 운영 현황 필터 컨트롤 바 컴포넌트
 * 팀, 제품, 매체 필터를 테이블 위 오른쪽에 표시합니다
 */
const FilterControlBar = ({
  products = [],
  medias = [],
  mediaSpecialOptions = {},
  teams = [],
  teamSpecialOptions = {},
  selectedTeams,
  selectedProducts,
  selectedMedias,
  onTeamSelectionChange,
  onProductSelectionChange,
  onMediaSelectionChange,
  canSelectAllTeams = true, // B/C 등급은 false로 전달되어 팀 선택 비활성화
}) => {
  // 제품 옵션 (다중 선택) - "전체" 옵션 추가
  const productOptions = [
    { id: "all", name: "전체" },
    ...products.map((product) => ({
      id: product.id,
      name: product.name,
    })),
  ];

  // 제품 특수 옵션: "전체" 선택 시 모든 제품 선택
  const productSpecialOptions = {
    전체: products.length > 0 ? products.map((p) => p.name) : [],
  };

  // 제품 선택 핸들러 (CustomSelect용) - name을 id로 변환 후 일괄 설정
  const handleProductSelectChange = (selectedNames) => {
    // name을 id로 매핑
    const selectedIds = selectedNames
      .map((name) => {
        const product = products.find((p) => p.name === name);
        return product ? product.id : null;
      })
      .filter((id) => id !== null);

    // 개별 토글 대신 직접 상태 설정 (동기화 문제 해결)
    onProductSelectionChange(selectedIds);
  };

  // 매체 선택 핸들러 (팀과 동일한 방식 - name 배열 그대로 전달)
  const handleMediaSelectChange = (selectedNames) => {
    onMediaSelectionChange(selectedNames);
  };

  // 현재 선택된 제품의 이름 배열
  const selectedProductNames = products
    .filter((p) => selectedProducts.includes(p.id))
    .map((p) => p.name);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: canSelectAllTeams ? 'space-between' : 'flex-end',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
      }}
    >
      {/* 팀 선택 (다중 선택) - S/A 등급만 표시 */}
      {canSelectAllTeams && (
        <div style={{ width: '180px' }}>
          <CustomSelect
            options={teams}
            selectedValues={selectedTeams}
            onSelectionChange={onTeamSelectionChange}
            placeholder="팀 선택"
            alwaysShowPlaceholder={true}
            multiple={true}
            specialOptions={teamSpecialOptions}
          />
        </div>
      )}

      {/* 오른쪽 필터 그룹 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* 제품 선택 (다중 선택) */}
        <div style={{ width: '180px' }}>
          <CustomSelect
            options={productOptions}
            selectedValues={selectedProductNames}
            onSelectionChange={handleProductSelectChange}
            placeholder="제품 선택"
            alwaysShowPlaceholder={true}
            multiple={true}
            specialOptions={productSpecialOptions}
          />
        </div>

        {/* 매체 선택 (다중 선택) - 팀과 동일한 구조 */}
        <div style={{ width: '180px' }}>
          <CustomSelect
            options={medias}
            selectedValues={selectedMedias}
            onSelectionChange={handleMediaSelectChange}
            placeholder="매체 선택"
            alwaysShowPlaceholder={true}
            multiple={true}
            specialOptions={mediaSpecialOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterControlBar;