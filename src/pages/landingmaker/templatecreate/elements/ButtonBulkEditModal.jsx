import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function ButtonBulkEditModal({
  show,
  onClose,
  domainUrl,
  buttonModalTab,
  onTabChange,
  buttonModalSettings,
  onSettingsChange,
  onApply,
  postBtnImages,
  loadingAssets,
  hasStageTemplates,
  getStageCount,
  getStageFilteredLandings,
  getTemplateStageText,
  STATIC_BUTTON_SETS,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">버튼 일괄수정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              도메인: <span className="font-medium">{domainUrl ? decodeURIComponent(domainUrl) : ''}</span>
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              ⚠️ 템플릿 단계별로 버튼 구조가 다르므로 각각 설정해주세요
            </p>
          </div>

          {/* 탭 구성 */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => onTabChange('stage1')}
                disabled={!hasStageTemplates('stage1')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  buttonModalTab === 'stage1'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } ${
                  !hasStageTemplates('stage1')
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                1단계 템플릿 ({getStageCount('stage1')}개)
              </button>
              <button
                onClick={() => onTabChange('stage23')}
                disabled={!hasStageTemplates('stage23')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  buttonModalTab === 'stage23'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } ${
                  !hasStageTemplates('stage23')
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                2,3단계 템플릿 ({getStageCount('stage23')}개)
              </button>
            </div>
          </div>

          {/* 탭 내용 */}
          {buttonModalTab === 'stage1' ? (
            // 1단계 템플릿 탭
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">1단계 템플릿 버튼 설정</h3>
                <p className="text-sm text-gray-600 mb-4">신청 버튼만 설정됩니다</p>
              </div>

              {!hasStageTemplates('stage1') ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">설정할 수 있는 1단계 템플릿이 없습니다</div>
                  <div className="text-sm">다른 단계를 선택하거나 1단계 템플릿을 먼저 생성해주세요.</div>
                </div>
              ) : (

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 좌측: 버튼 설정 */}
                <div>
                  <div className="space-y-4">
                    {/* 버튼 위치 설정 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        버튼 위치
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSettingsChange(prev => ({
                            ...prev,
                            stage1: { ...prev.stage1, postBtnLocate: null }
                          }))}
                          className={`px-4 py-2 border rounded-md text-sm ${
                            buttonModalSettings.stage1.postBtnLocate === null
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          일반형
                        </button>
                        <button
                          onClick={() => onSettingsChange(prev => ({
                            ...prev,
                            stage1: { ...prev.stage1, postBtnLocate: 'fixed' }
                          }))}
                          className={`px-4 py-2 border rounded-md text-sm ${
                            buttonModalSettings.stage1.postBtnLocate === 'fixed'
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          띄움형
                        </button>
                      </div>
                    </div>

                    {/* 버튼 이미지 선택 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        신청 버튼 이미지
                      </label>
                      {postBtnImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {postBtnImages.map((imageUrl, index) => (
                            <button
                              key={imageUrl}
                              onClick={() => onSettingsChange(prev => ({
                                ...prev,
                                stage1: { ...prev.stage1, postBtnUrl: imageUrl }
                              }))}
                              className={`border-2 rounded-md overflow-hidden hover:border-blue-400 ${
                                buttonModalSettings.stage1.postBtnUrl === imageUrl
                                  ? 'border-blue-600 ring-2 ring-blue-200'
                                  : 'border-gray-300'
                              }`}
                            >
                              <img
                                src={imageUrl}
                                alt={`버튼 ${index + 1}`}
                                className="w-full h-12 object-contain bg-white"
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          {loadingAssets ? '버튼 이미지 로딩 중...' : '이 도메인에 버튼 이미지가 없습니다'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 우측: 대상 랜딩 목록 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    수정 대상 (1단계 템플릿)
                  </h4>
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-64 overflow-y-auto">
                    {(getStageFilteredLandings('stage1')?.length || 0) > 0 ? (
                      <div className="space-y-2">
                        {(getStageFilteredLandings('stage1') || []).map((landing) => (
                          <div key={landing.adNumber} className="bg-white p-2 rounded border text-xs">
                            <div className="font-medium">{landing.adNumber}</div>
                            <div className="text-gray-500">{getTemplateStageText(landing.templateKey)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        1단계 템플릿 랜딩이 없습니다
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          ) : (
            // 2,3단계 템플릿 탭
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">2,3단계 템플릿 버튼 설정</h3>
                <p className="text-sm text-gray-600 mb-4">다음 버튼 + 신청 버튼 세트를 설정됩니다</p>
              </div>

              {!hasStageTemplates('stage23') ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">설정할 수 있는 2,3단계 템플릿이 없습니다</div>
                  <div className="text-sm">다른 단계를 선택하거나 2,3단계 템플릿을 먼저 생성해주세요.</div>
                </div>
              ) : (

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 좌측: 버튼 설정 */}
                <div>
                  <div className="space-y-4">
                    {/* 버튼 세트 선택 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        버튼 세트
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {STATIC_BUTTON_SETS.map((set) => (
                          <button
                            key={set.key}
                            onClick={() => onSettingsChange(prev => ({
                              ...prev,
                              stage23: { ...prev.stage23, selectedButtonSet: set }
                            }))}
                            className={`border-2 rounded-lg overflow-hidden p-2 hover:border-blue-400 ${
                              buttonModalSettings.stage23.selectedButtonSet?.key === set.key
                                ? 'border-blue-600 ring-2 ring-blue-200'
                                : 'border-gray-300'
                            }`}
                          >
                            <div className="space-y-1">
                              <img src={set.keepBtn} alt="다음" className="w-full h-8 object-contain" />
                              <img src={set.postBtn} alt="신청" className="w-full h-8 object-contain" />
                              <div className="text-xs text-center">{set.label}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 버튼 위치 설정 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        다음 버튼 위치
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSettingsChange(prev => ({
                            ...prev,
                            stage23: { ...prev.stage23, keepBtnLocate: null }
                          }))}
                          className={`px-4 py-2 border rounded-md text-sm ${
                            buttonModalSettings.stage23.keepBtnLocate === null
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          일반형
                        </button>
                        <button
                          onClick={() => onSettingsChange(prev => ({
                            ...prev,
                            stage23: { ...prev.stage23, keepBtnLocate: 'fixed' }
                          }))}
                          className={`px-4 py-2 border rounded-md text-sm ${
                            buttonModalSettings.stage23.keepBtnLocate === 'fixed'
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          띄움형
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 우측: 대상 랜딩 목록 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    수정 대상 (2,3단계 템플릿)
                  </h4>
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-64 overflow-y-auto">
                    {(getStageFilteredLandings('stage23')?.length || 0) > 0 ? (
                      <div className="space-y-2">
                        {(getStageFilteredLandings('stage23') || []).map((landing) => (
                          <div key={landing.adNumber} className="bg-white p-2 rounded border text-xs">
                            <div className="font-medium">{landing.adNumber}</div>
                            <div className="text-gray-500">{getTemplateStageText(landing.templateKey)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        2,3단계 템플릿 랜딩이 없습니다
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onApply}
            disabled={!hasStageTemplates(buttonModalTab)}
            className={`px-4 py-2 text-white rounded-md ${
              hasStageTemplates(buttonModalTab)
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
