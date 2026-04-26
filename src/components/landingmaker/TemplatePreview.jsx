/**
 * 템플릿 선택용 미리보기 컴포넌트
 * 사용 가능한 랜딩 페이지 템플릿들을 시각적으로 미리보기 제공
 * 템플릿 ID에 따라 다른 레이아웃을 렌더링하여 선택 가이드 역할
 */
export default function TemplatePreview({ templateId }) {
  const renderPreview = () => {
    switch (templateId) {
      // 1단계 템플릿
      case 11: // 기본형: 이미지, 폼
        return (
          <div className="space-y-1.5 h-40 flex flex-col">
            <div className="bg-gray-200 flex-1 rounded"></div>
            <div className="bg-blue-100 h-14 rounded flex items-center justify-center text-xs">폼</div>
          </div>
        )
      case 12: // 설문1개형: 이미지, 설문, 폼
        return (
          <div className="space-y-1.5 h-40 flex flex-col">
            <div className="bg-gray-200 flex-1 rounded"></div>
            <div className="bg-purple-100 h-10 rounded flex items-center justify-center text-xs">설문</div>
            <div className="bg-blue-100 h-12 rounded flex items-center justify-center text-xs">폼</div>
          </div>
        )
      case 13: // 설문2개형: 이미지, 설문, 설문, 폼
        return (
          <div className="space-y-1.5 h-40 flex flex-col">
            <div className="bg-gray-200 flex-1 rounded"></div>
            <div className="bg-purple-100 h-8 rounded flex items-center justify-center text-xs">설문1</div>
            <div className="bg-purple-100 h-8 rounded flex items-center justify-center text-xs">설문2</div>
            <div className="bg-blue-100 h-10 rounded flex items-center justify-center text-xs">폼</div>
          </div>
        )

      // 2단계 템플릿
      case 21: // 설문 → 폼: [P1] 이미지,설문 → [P2] 이미지,폼
        return (
          <div className="flex space-x-2 h-40">
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P1</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-purple-100 h-10 rounded flex items-center justify-center text-xs">설문</div>
            </div>
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P2</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-blue-100 h-10 rounded flex items-center justify-center text-xs">폼</div>
            </div>
          </div>
        )
      case 22: // 이미지 → 설문+폼: [P1] 이미지 → [P2] 이미지,설문,폼
        return (
          <div className="flex space-x-2 h-40">
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P1</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
            </div>
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P2</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-purple-100 h-8 rounded flex items-center justify-center text-xs">설문</div>
              <div className="bg-blue-100 h-8 rounded flex items-center justify-center text-xs">폼</div>
            </div>
          </div>
        )
      case 23: // 이미지 → 폼: [P1] 이미지 → [P2] 이미지,폼
        return (
          <div className="flex space-x-2 h-40">
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P1</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
            </div>
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P2</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-blue-100 h-10 rounded flex items-center justify-center text-xs">폼</div>
            </div>
          </div>
        )
      case 24: // 설문2개 → 폼: [P1] 이미지,설문,설문 → [P2] 이미지,폼
        return (
          <div className="flex space-x-2 h-40">
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P1</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-purple-100 h-7 rounded flex items-center justify-center text-xs">설문1</div>
              <div className="bg-purple-100 h-7 rounded flex items-center justify-center text-xs">설문2</div>
            </div>
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P2</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-blue-100 h-10 rounded flex items-center justify-center text-xs">폼</div>
            </div>
          </div>
        )
      case 25: // 이미지 → 설문2개+폼: [P1] 이미지 → [P2] 이미지,설문,설문,폼
        return (
          <div className="flex space-x-2 h-40">
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P1</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
            </div>
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="text-xs text-center text-gray-500">P2</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-purple-100 h-7 rounded flex items-center justify-center text-xs">설문1</div>
              <div className="bg-purple-100 h-7 rounded flex items-center justify-center text-xs">설문2</div>
              <div className="bg-blue-100 h-8 rounded flex items-center justify-center text-xs">폼</div>
            </div>
          </div>
        )

      // 3단계 템플릿
      case 31: // 이미지 → 설문 → 폼: [P1] 이미지 → [P2] 이미지,설문 → [P3] 이미지,폼
        return (
          <div className="flex space-x-1.5 h-40">
            <div className="flex-1 flex flex-col space-y-1">
              <div className="text-xs text-center text-gray-500">P1</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
            </div>
            <div className="flex-1 flex flex-col space-y-1">
              <div className="text-xs text-center text-gray-500">P2</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-purple-100 h-8 rounded flex items-center justify-center text-xs">설문</div>
            </div>
            <div className="flex-1 flex flex-col space-y-1">
              <div className="text-xs text-center text-gray-500">P3</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-blue-100 h-8 rounded flex items-center justify-center text-xs">폼</div>
            </div>
          </div>
        )
      case 32: // 설문 → 설문 → 폼: [P1] 이미지,설문 → [P2] 이미지,설문 → [P3] 이미지,폼
        return (
          <div className="flex space-x-1.5 h-40">
            <div className="flex-1 flex flex-col space-y-1">
              <div className="text-xs text-center text-gray-500">P1</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-purple-100 h-8 rounded flex items-center justify-center text-xs">설문</div>
            </div>
            <div className="flex-1 flex flex-col space-y-1">
              <div className="text-xs text-center text-gray-500">P2</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-purple-100 h-8 rounded flex items-center justify-center text-xs">설문</div>
            </div>
            <div className="flex-1 flex flex-col space-y-1">
              <div className="text-xs text-center text-gray-500">P3</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-blue-100 h-8 rounded flex items-center justify-center text-xs">폼</div>
            </div>
          </div>
        )
      case 33: // 이미지 → 설문2개 → 폼: [P1] 이미지 → [P2] 이미지,설문,설문 → [P3] 이미지,폼
        return (
          <div className="flex space-x-1.5 h-40">
            <div className="flex-1 flex flex-col space-y-1">
              <div className="text-xs text-center text-gray-500">P1</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
            </div>
            <div className="flex-1 flex flex-col space-y-1">
              <div className="text-xs text-center text-gray-500">P2</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-purple-100 h-7 rounded flex items-center justify-center text-xs">설문1</div>
              <div className="bg-purple-100 h-7 rounded flex items-center justify-center text-xs">설문2</div>
            </div>
            <div className="flex-1 flex flex-col space-y-1">
              <div className="text-xs text-center text-gray-500">P3</div>
              <div className="bg-gray-200 flex-1 rounded"></div>
              <div className="bg-blue-100 h-8 rounded flex items-center justify-center text-xs">폼</div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white p-3 rounded border border-gray-200 mb-3">
      {renderPreview()}
    </div>
  )
}
