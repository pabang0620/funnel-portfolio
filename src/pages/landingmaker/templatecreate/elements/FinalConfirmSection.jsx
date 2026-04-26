import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export default function FinalConfirmSection({
  formData,
  mode,
  adNumber,
  loading,
  onSubmit,
  onPrevStep,
  getTemplateName,
  getFormStyleName,
  getPrivacyStyleName,
  getServiceInfoName,
  getButtonPositionName,
  getBenefitPeriodName,
  getFooterClassName,
}) {
  return (
    <>
      <h2 className="text-xl font-bold mb-6">최종 확인</h2>
      <div className="space-y-3 bg-gray-50 p-4 rounded-lg text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">도메인:</div>
          <div>{formData.domain}</div>

          <div className="font-medium">외부 시스템 연동:</div>
          <div>{formData.bigcConnection || "없음"}</div>

          <div className="font-medium">템플릿:</div>
          <div>{getTemplateName(formData.template)}</div>

          <div className="font-medium">설문 조사:</div>
          <div>
            {formData.surveyList && formData.surveyList.length > 0
              ? `${formData.surveyList.length}개 설문`
              : "없음"}
          </div>

          <div className="font-medium">이미지:</div>
          <div>{Object.keys(formData.images).length}개</div>

          <div className="font-medium">이미지 ALT 텍스트:</div>
          <div>
            {
              Object.values(formData.imageAlts || {}).filter((alt) => alt)
                .length
            }
            개 설정됨
          </div>

          <div className="font-medium">폼 스타일:</div>
          <div>{getFormStyleName(formData.formStyle)}</div>

          <div className="font-medium">개인정보 수집 주체:</div>
          <div>{formData.privacyPolicyName}</div>

          <div className="font-medium">개인정보 동의 스타일:</div>
          <div>{getPrivacyStyleName(formData.privacyStyle)}</div>

          <div className="font-medium">제휴사 안내:</div>
          <div>{getServiceInfoName(formData.serviceInfoClassName)}</div>

          <div className="font-medium">다음 버튼 위치:</div>
          <div>{getButtonPositionName(formData.keepBtnLocate)}</div>

          <div className="font-medium">다음 버튼 이미지:</div>
          <div>
            {formData.keepBtnImage ? (
              <img
                src={formData.keepBtnImage}
                alt="다음 버튼 미리보기"
                className="h-12 object-contain bg-white border rounded"
              />
            ) : (
              "미설정"
            )}
          </div>

          <div className="font-medium">신청하기 버튼 위치:</div>
          <div>{getButtonPositionName(formData.buttonPosition)}</div>

          <div className="font-medium">신청하기 버튼 이미지:</div>
          <div>
            {formData.buttonImage ? (
              <img
                src={formData.buttonImage}
                alt="신청하기 버튼 미리보기"
                className="h-12 object-contain bg-white border rounded"
              />
            ) : (
              "미선택"
            )}
          </div>

          <div className="font-medium">혜택 기간 타입:</div>
          <div>{getBenefitPeriodName(formData.benefitPeriodType)}</div>

          <div className="font-medium">푸터 스타일:</div>
          <div>{getFooterClassName(formData.footerClassName)}</div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={onPrevStep}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          이전
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : "✅ 발행"}
        </button>
      </div>
    </>
  );
}
