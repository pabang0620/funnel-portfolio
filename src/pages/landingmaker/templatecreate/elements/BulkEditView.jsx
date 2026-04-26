import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faSpinner,
  faChevronLeft,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import LandingPreview from "@/components/landingmaker/LandingPreview";

export default function BulkEditView({
  domainUrl,
  domainLandings,
  loadingAssets,
  formData,
  showBasicSettings,
  showStyleSettings,
  onToggleBasicSettings,
  onToggleStyleSettings,
  onBulkSave,
  onShowButtonModal,
  onNavigateBack,
  renderEnhancedFormStyleSection,
  renderPrivacySection,
  renderEnhancedConsentStyleSection,
  renderEnhancedFooterSection,
  getTemplateKeyFromLanding,
  getTemplateStageText,
  imageCountPerPage,
  loading,
  pendingButtonSettings,
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* 3단 분할 레이아웃 - 전체 화면 */}
      <div className="flex h-screen">
        {/* 왼쪽: 기본 설정 패널 (토글 가능) */}
        <div
          className={`transition-all duration-300 ${
            showBasicSettings ? "w-[320px]" : "w-12"
          }`}
        >
          {!showBasicSettings ? (
            <button
              onClick={() => onToggleBasicSettings(true)}
              className="bg-gray-500 text-white p-3 hover:bg-gray-600 h-full flex items-center justify-center"
              title="기본 설정 열기"
            >
              <span className="text-xl">→</span>
            </button>
          ) : (
            <div className="bg-white border-r shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold">도메인 정보</h3>
                <button
                  onClick={() => onToggleBasicSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  title="설정 닫기"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {/* 도메인 정보 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                    선택된 도메인
                  </h4>
                  <p className="text-gray-700 font-medium text-sm">
                    {domainUrl
                      ? decodeURIComponent(domainUrl)
                      : formData.domain}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    ⚠️ 이 도메인의 모든 랜딩 페이지에 적용됩니다
                  </p>
                </div>

                {/* 랜딩 페이지 목록 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon
                      icon={faList}
                      className="text-gray-600 text-sm"
                    />
                    <h4 className="font-semibold text-gray-900 text-sm">
                      대상 랜딩 페이지
                    </h4>
                    {loadingAssets && (
                      <div className="animate-spin text-blue-500">
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {loadingAssets ? (
                    <div className="text-center py-4 text-gray-500 text-xs">
                      랜딩 페이지 목록을 불러오는 중...
                    </div>
                  ) : domainLandings.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {domainLandings.map((landing, index) => (
                        <div
                          key={landing.adNumber || index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 truncate">
                                {landing.adNumber || `랜딩-${index + 1}`}
                              </span>
                              {(() => {
                                const templateKey =
                                  getTemplateKeyFromLanding(landing);
                                return templateKey ? (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                    {getTemplateStageText(templateKey)}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">
                                    템플릿 없음
                                  </span>
                                );
                              })()}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {landing.privacyOwner &&
                                `주체: ${landing.privacyOwner}`}
                              <br />
                              {landing.createdAt &&
                                `생성일: ${landing.createdAt.split(" ")[0]}`}
                              <br />
                              {landing.updatedAt &&
                                `수정일: ${landing.updatedAt.split(" ")[0]}`}
                            </div>
                          </div>
                          <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            수정 대상
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-xs">
                      이 도메인에 랜딩 페이지가 없습니다
                    </div>
                  )}

                  {domainLandings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          총 {domainLandings.length}개 랜딩 페이지
                        </span>
                        <span className="text-blue-600 font-medium">
                          일괄 수정 예정
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* 하단 버튼 */}
              <div className="border-t p-4 bg-white">
                <button
                  onClick={onNavigateBack}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                  이전
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 중앙: 미리보기 */}
        <div className="flex-1 bg-gray-50 p-6 overflow-hidden">
          <LandingPreview
            formData={{
              ...formData,
              // 일괄수정 모드에서는 이미지만 제거
              images: {},
              buttonImage: null,
              keepBtnImage: null,
            }}
            currentStep={2}
            onPrevStep={() => {}}
            onNextStep={() => {}}
            canProceed={true}
            isBulkEdit={true}
            imageCountPerPage={imageCountPerPage}
          />
        </div>

        {/* 오른쪽: 이미지 & 스타일 설정 패널 (토글 가능) */}
        <div
          className={`transition-all duration-300 ${
            showStyleSettings ? "w-[400px]" : "w-12"
          }`}
        >
          {!showStyleSettings ? (
            <button
              onClick={() => onToggleStyleSettings(true)}
              className="bg-gray-500 text-white p-3 hover:bg-gray-600 h-full flex items-center justify-center"
              title="스타일 설정 열기"
            >
              <span className="text-xl">←</span>
            </button>
          ) : (
            <div className="bg-white border-l shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold">스타일 & 내용</h3>
                <button
                  onClick={() => onToggleStyleSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  title="설정 닫기"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* 폼 스타일 */}
                {renderEnhancedFormStyleSection()}

                <div className="border-t pt-6"></div>

                {/* 개인정보 수집 주체 */}
                {renderPrivacySection()}

                <div className="border-t pt-6"></div>

                {/* 개인정보 동의 스타일 */}
                {renderEnhancedConsentStyleSection()}

                <div className="border-t pt-6"></div>

                {/* 푸터 설정 */}
                {renderEnhancedFooterSection()}
              </div>
              {/* 하단 버튼 */}
              <div className="border-t p-4 bg-white space-y-2">
                {/* 버튼 일괄수정 버튼 */}
                <button
                  onClick={onShowButtonModal}
                  disabled={!domainUrl}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>버튼 일괄수정</span>
                </button>

                {/* 일괄 저장 버튼 */}
                <button
                  onClick={onBulkSave}
                  disabled={loading}
                  className={`w-full px-4 py-2 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    pendingButtonSettings ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      <span>처리 중...</span>
                    </>
                  ) : (
                    <>
                      <span>{pendingButtonSettings ? '일괄 저장 (버튼 포함)' : '일괄 저장'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
