import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import LandingPreview from "@/components/landingmaker/LandingPreview";

export default function TemplateStepView({
  currentStep,
  formData,
  showBasicSettings,
  showStyleSettings,
  onToggleBasicSettings,
  onToggleStyleSettings,
  onPrevStep,
  onNextStep,
  canProceedToStep3,
  loading,
  renderBasicSettingsContent,
  renderImagesAndStylesContent,
  renderStep3Content,
  imageCountPerPage,
  onImageChange,
  isBulkEdit,
}) {
  return (
    <>
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
                <h3 className="text-lg font-bold">기본 설정</h3>
                <button
                  onClick={() => onToggleBasicSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  title="설정 닫기"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {currentStep === 2 && renderBasicSettingsContent()}
                {currentStep === 3 && (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">도메인:</div>
                      <div>{formData.domain}</div>
                      <div className="font-medium">외부 시스템 연동:</div>
                      <div>{formData.bigcConnection}</div>
                    </div>
                  </div>
                )}
              </div>
              {/* 이전 버튼 - 패널 하단 고정 */}
              {currentStep === 2 && (
                <div className="border-t p-4 bg-white">
                  <button
                    onClick={onPrevStep}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <FontAwesomeIcon
                      icon={faChevronLeft}
                      className="text-xs"
                    />
                    이전
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 중앙: 미리보기 */}
        <div className="flex-1 bg-gray-50 p-6 overflow-hidden">
          <LandingPreview
            formData={isBulkEdit ? {
              ...formData,
              // 일괄수정 모드에서는 이미지 제거
              images: {},
              buttonImage: null,
              keepBtnImage: null,
            } : formData}
            currentStep={isBulkEdit ? 2 : currentStep}
            onPrevStep={isBulkEdit ? () => {} : onPrevStep}
            onNextStep={isBulkEdit ? () => {} : onNextStep}
            canProceed={isBulkEdit ? true : (
              !formData.domain ||
              !formData.template ||
              Object.keys(formData.images).length === 0
            )}
            imageCountPerPage={imageCountPerPage}
            onImageChange={isBulkEdit ? undefined : onImageChange}
            isBulkEdit={isBulkEdit}
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
                <h3 className="text-lg font-bold">이미지 & 스타일</h3>
                <button
                  onClick={() => onToggleStyleSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  title="설정 닫기"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {currentStep === 2 && renderImagesAndStylesContent()}
                {currentStep === 3 && renderStep3Content()}
              </div>
              {/* 다음 버튼 - sticky로 하단 고정 */}
              {currentStep === 2 && (
                <div className="sticky bottom-0 border-t p-4 bg-white">
                  <button
                    onClick={onNextStep}
                    disabled={!canProceedToStep3()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-1"
                  >
                    다음
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-xs"
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
