import CustomSelect from "../../../components/ui/CustomSelect";
import RecentHistory from "./RecentHistory";

function FilterSection({
  products = [],
  medias = [],
  mediaSpecialOptions = {},
  teams = [],
  teamSpecialOptions = {},
  selectedTeams,
  selectedProducts,
  selectedMedias,
  onTeamSelectionChange,
  onProductToggle,
  onProductSelectionChange,
  onMediaSelectionChange,
  historyLogs = [],
  onViewHistoryDetails,
}) {
  // 팀 목록은 props에서 받아옴

  // 제품 옵션 (다중 선택) - "전체" 옵션 추가
  const productOptions = [
    { id: "all", name: "전체" },
    ...products.map((product) => ({
      id: product.id,
      name: product.name,
    })),
  ];

  // 매체 옵션 - medias 배열을 그대로 사용 (팀과 동일한 구조)
  // medias는 이미 { id, name, parentId } 형태로 백엔드에서 옴

  // 제품 특수 옵션: "전체" 선택 시 모든 제품 선택
  const productSpecialOptions = {
    전체: products.length > 0 ? products.map((p) => p.name) : [],
  };

  // 매체 특수 옵션은 백엔드에서 받은 mediaSpecialOptions 사용

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

  // 현재 선택된 매체 - selectedMedias는 이미 name 배열임 (팀과 동일)

  return (
    <div className="media-operations-container">
      <div className="filter-panel-container horizontal">
        <div className="filter-box horizontal">
          {/* 팀 선택 (다중 선택) */}
          <div className="filter-field horizontal">
            <label>팀 선택</label>
            <CustomSelect
              options={teams}
              selectedValues={selectedTeams}
              onSelectionChange={onTeamSelectionChange}
              placeholder="팀 선택"
              multiple={true}
              specialOptions={teamSpecialOptions}
            />
          </div>

          {/* 제품 선택 (다중 선택) */}
          <div className="filter-field horizontal">
            <label>제품</label>
            <CustomSelect
              options={productOptions}
              selectedValues={selectedProductNames}
              onSelectionChange={handleProductSelectChange}
              placeholder="제품 선택"
              multiple={true}
              specialOptions={productSpecialOptions}
            />
          </div>

          {/* 매체 선택 (다중 선택) - 팀과 동일한 구조 */}
          <div className="filter-field horizontal">
            <label>매체</label>
            <CustomSelect
              options={medias}
              selectedValues={selectedMedias}
              onSelectionChange={handleMediaSelectChange}
              placeholder="매체 선택"
              multiple={true}
              specialOptions={mediaSpecialOptions}
            />
          </div>
        </div>

        {/* 최근 히스토리 */}
        <RecentHistory
          historyLogs={historyLogs}
          onViewDetails={onViewHistoryDetails}
        />
      </div>
    </div>
  );
}

export default FilterSection;
