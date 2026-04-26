/**
 * 랜딩 페이지 실시간 미리보기 컴포넌트
 * 생성/편집 중인 랜딩 페이지를 데스크톱/모바일 뷰로 미리보기 제공
 * 반응형 디자인 확인을 위한 뷰포트 전환 기능 포함
 */
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMobileAlt, faDesktop, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
export default function LandingPreview({ formData, currentStep, onPrevStep, onNextStep, canProceed, isBulkEdit = false, imageCountPerPage = {}, onImageChange }) {

  const [currentPage, setCurrentPage] = useState(1)
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false)
  const [viewMode, setViewMode] = useState('pc') // 'pc' or 'mobile'
  const [imageUrls, setImageUrls] = useState({})
  const [selectedSurveyOptions, setSelectedSurveyOptions] = useState({}) // { surveyIndex: optionIndex } 형태로 선택된 인덱스 저장
  const [previewFormData, setPreviewFormData] = useState({
    name: '',
    phone1: '010',
    phone2: '',
    phone3: ''
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const [fileInputRefs, setFileInputRefs] = useState({})

  // 이미지가 변경될 때마다 URL 업데이트
  useEffect(() => {
    const urls = {}
    const objectURLs = [] // revoke를 위해 생성한 ObjectURL만 추적

    console.log("🖼️ LandingPreview: 이미지 URL 업데이트 시작", {
      formDataImages: formData.images,
      imageKeys: Object.keys(formData.images)
    });

    Object.keys(formData.images).forEach((key) => {
      const imageData = formData.images[key]
      if (imageData) {
        // File 객체인 경우만 createObjectURL 사용
        if (imageData instanceof File) {
          const objectURL = URL.createObjectURL(imageData)
          urls[key] = objectURL
          objectURLs.push(objectURL)
          console.log(`🖼️ File 객체 처리: ${key} → ${objectURL}`);
        }
        // 문자열(URL)인 경우 그대로 사용
        else if (typeof imageData === 'string') {
          urls[key] = imageData
          console.log(`🖼️ URL 문자열 처리: ${key} → ${imageData}`);
        }
      }
    })
    
    console.log("🖼️ 최종 imageUrls 설정:", urls);
    setImageUrls(urls)

    // 컴포넌트 언마운트 시 생성한 ObjectURL만 해제
    return () => {
      objectURLs.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [formData.images])

  // 혜택 기간 계산
  const calculateBenefitPeriod = () => {
    const today = new Date()
    let startDate, endDate

    if (formData.benefitPeriodType === 'week') {
      // 이번 주 (월요일 ~ 일요일)
      const dayOfWeek = today.getDay()
      const monday = new Date(today)
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      startDate = monday
      endDate = sunday
    } else if (formData.benefitPeriodType === 'month') {
      // 이번 달 (1일 ~ 마지막 날)
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    } else {
      // 기본값: 이번 달
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    }

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}. ${month}. ${day}`
    }

    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`
  }

  const getPageCount = () => {
    if (!formData.template) return 1
    return Math.floor(formData.template / 10)
  }

  const nextPage = () => {
    if (currentPage < getPageCount()) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  // 드래그앤드롭 핸들러 (특정 이미지 슬롯용)
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragging(false)
      }
      return newCounter
    })
  }

  const handleDrop = (e, pageNum, imageNum) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragCounter(0)

    if (!onImageChange) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]

      // 파일 크기 검증 (2MB)
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        alert('파일 크기는 2MB를 초과할 수 없습니다.')
        return
      }

      // 파일 타입 검증
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/ogg',
      ]
      if (!allowedTypes.includes(file.type)) {
        alert('지원하지 않는 파일 형식입니다.\n지원 형식: JPEG, PNG, GIF, WebP, MP4, WebM, OGG')
        return
      }

      const imageKey = `${pageNum}-${imageNum}`
      onImageChange(imageKey, file)
    }
  }

  // 파일 input 변경 핸들러
  const handleFileInputChange = (e, pageNum, imageNum) => {
    const file = e.target.files[0]
    if (!file || !onImageChange) return

    // 파일 크기 검증 (2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      alert('파일 크기는 2MB를 초과할 수 없습니다.')
      return
    }

    // 파일 타입 검증
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ]
    if (!allowedTypes.includes(file.type)) {
      alert('지원하지 않는 파일 형식입니다.\n지원 형식: JPEG, PNG, GIF, WebP, MP4, WebM, OGG')
      return
    }

    const imageKey = `${pageNum}-${imageNum}`
    onImageChange(imageKey, file)
  }

  // 파일 선택 트리거
  const triggerFileSelect = (pageNum, imageNum) => {
    if (!onImageChange) return
    const inputId = `file-input-${pageNum}-${imageNum}`
    const input = document.getElementById(inputId)
    if (input) {
      input.click()
    }
  }

  // 현재 페이지의 설문이 모두 완료되었는지 확인 (질문과 선택지 텍스트 입력 여부)
  const isCurrentPageSurveyComplete = () => {
    // 현재 페이지에 설문이 없으면 true (통과)
    if (!formData.surveyList || formData.surveyList.length === 0) {
      console.log('🔍 설문 체크: 설문 리스트 없음 - 통과')
      return true
    }

    // 현재 페이지의 설문만 필터링
    const currentPageSurveys = formData.surveyList.filter(survey => survey.pageNum === currentPage)
    
    // 현재 페이지에 설문이 없으면 true (통과)
    if (currentPageSurveys.length === 0) {
      console.log(`🔍 설문 체크: 페이지 ${currentPage}에 설문 없음 - 통과`)
      return true
    }

    console.log(`🔍 설문 체크: 페이지 ${currentPage}에 설문 ${currentPageSurveys.length}개 있음`)

    // 현재 페이지의 모든 설문의 질문과 선택지가 입력되었는지 확인
    for (let i = 0; i < currentPageSurveys.length; i++) {
      const survey = currentPageSurveys[i]
      
      // 질문 텍스트가 비어있으면 미완료
      if (!survey.questionText || survey.questionText.trim() === '') {
        console.log(`❌ 설문 체크: 설문 ${i + 1} 질문 미입력`)
        return false
      }

      // 모든 선택지의 텍스트가 입력되었는지 확인
      if (!survey.options || survey.options.length === 0) {
        console.log(`❌ 설문 체크: 설문 ${i + 1} 선택지 없음`)
        return false
      }

      // 옵션 개수만큼 선택지 텍스트가 모두 입력되었는지 확인
      const requiredOptionCount = survey.optionCount || 4
      for (let j = 0; j < requiredOptionCount; j++) {
        const option = survey.options[j]
        if (!option || !option.text || option.text.trim() === '') {
          console.log(`❌ 설문 체크: 설문 ${i + 1} 선택지 ${j + 1} 미입력`)
          return false
        }
      }
    }
    
    console.log('✅ 설문 체크: 모든 설문의 질문과 선택지 입력 완료')
    return true
  }

  // 설문 선택 핸들러 (미리보기용)
  const handleSurveySelect = (pageNum, surveyIndex, optionIndex) => {
    const surveyKey = `page${pageNum}_survey${surveyIndex}`
    setSelectedSurveyOptions({
      ...selectedSurveyOptions,
      [surveyKey]: optionIndex
    })
    // 자동 페이지 이동은 제거 - 질문과 선택지 입력 완료가 조건
  }

  const renderPartnerNotice = () => {
    const { serviceInfoClassName } = formData

    // 표시 안 함
    if (!serviceInfoClassName) {
      return null
    }

    return (
      <p className={`serviceInfoClassName ${serviceInfoClassName} mx-auto w-[90%]`} style={{ margin: '0 auto 15px', width: '90%' }}>
        본 서비스는 당사와 제휴된 전국 30여개 병,의원에서 제공되며,<br />상담 신청 정보를 기반으로 적합한 제휴 병,의원을 안내해드립니다.
      </p>
    )
  }

  // 레거시 푸터 HTML 생성 함수 (landing-pages와 동일한 구조 + 정렬 지원)
  const renderFooterContent = (footerClassName, footerDetail) => {
    // 정렬 추출 (-left, -right, 없으면 중앙)
    let footerAlign = 'center';
    if (footerClassName.endsWith('-left')) {
      footerAlign = 'left';
    } else if (footerClassName.endsWith('-right')) {
      footerAlign = 'right';
    }

    // 푸터 타입 추출 (정렬 제거)
    const baseClassName = footerClassName.replace(/-left|-right$/, '');
    const footerType = baseClassName.replace('footer-', '');

    // 정렬 클래스 생성
    const alignClass = `footer-align-${footerAlign}`;

    // \n을 <br/>로 변환
    const formattedDetail = footerDetail.replace(/\n/g, '<br/>');

    // 레거시 푸터들 (복잡한 구조)
    const legacyFooters = ['obsidian', 'capsule', 'chrome', 'concrete', 'pearl'];

    if (legacyFooters.includes(footerType)) {
      switch (footerType) {
        case 'obsidian':
          return (
            <div className={`footer-content ${alignClass}`}>
              <p className="notice-title">유의사항</p>
              <p className="notice-text" dangerouslySetInnerHTML={{ __html: formattedDetail }} />
            </div>
          );

        case 'chrome':
          return (
            <div className={`footer-content ${alignClass}`}>
              <div className="company-name">{formData.privacyPolicyName || '주식회사 로드랩스'}</div>
              <div className="disclaimer" dangerouslySetInnerHTML={{ __html: formattedDetail }} />
            </div>
          );

        case 'capsule':
          return (
            <div className={`footer-content ${alignClass}`}>
              <h3 className="footer-title">유의사항</h3>
              <p className="footer-disclaimer" dangerouslySetInnerHTML={{ __html: formattedDetail }} />
            </div>
          );

        case 'concrete':
          return (
            <div className={`footer-content ${alignClass}`}>
              {footerDetail.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          );

        case 'pearl':
          return (
            <div className={`footer-content ${alignClass}`}>
              <h4 className="notice-title">유의사항</h4>
              <p className="notice-text" dangerouslySetInnerHTML={{ __html: formattedDetail }} />
            </div>
          );

        default:
          return <p className="footerDetail" dangerouslySetInnerHTML={{ __html: formattedDetail }} />;
      }
    }

    // 기본 푸터: 단순 텍스트
    return <p className="footerDetail" dangerouslySetInnerHTML={{ __html: formattedDetail }} />;
  }

  const getPrivacyConsentClass = () => {
    const { consentStyle, privacyPolicyClassName } = formData

    // privacyPolicyClassName 우선 사용, 없으면 consentStyle 사용
    const styleValue = privacyPolicyClassName || consentStyle

    // 값에 따라 CSS 클래스명 반환
    if (!styleValue) {
      return 'consent-light' // 기본값
    }

    return `consent-${styleValue}`
  }

  const renderPrivacyPolicy = () => {
    const { privacyPolicy } = formData

    return (
      <div className="privacyPolicy">
        {privacyPolicy || '개인정보처리방침 내용이 없습니다.'}
      </div>
    )
  }

  const renderPage = (pageNum) => {
    const isLastPage = pageNum === getPageCount()
    const needsBottomPadding = isLastPage
      ? formData.buttonPosition === 'fixed'
      : formData.keepBtnLocate === 'fixed'

    return (
      <div key={pageNum} className="bg-white overflow-hidden mx-auto" style={{ maxWidth: viewMode === 'mobile' ? '375px' : '768px' }}>
        <div className={`space-y-3 ${needsBottomPadding ? 'pb-20' : ''}`}>
          {/* 이미지 영역 - 슬롯 기반 드래그앤드롭 */}
          <div className="space-y-2" style={{ marginBottom: '20px' }}>
            {(() => {
              // 우측 패널의 슬롯 개수 가져오기
              const slotCount = imageCountPerPage[pageNum] || 1

              // 슬롯 개수만큼 드롭존 생성
              return Array.from({ length: slotCount }, (_, i) => i + 1).map((imageNum) => {
                const imageKey = `${pageNum}-${imageNum}`
                const imageData = formData.images[imageKey]
                const hasImage = !!imageData

                // 이미지 URL 가져오기 (imageUrls, imageData 직접 사용, 또는 File 객체에서 URL 생성)
                const displayUrl = imageUrls[imageKey] || 
                  (typeof imageData === 'string' ? imageData : 
                  (imageData instanceof File ? URL.createObjectURL(imageData) : null))

                const isVideo = imageData instanceof File
                  ? imageData.type.startsWith('video/')
                  : (typeof imageData === 'string' && imageData.match(/\.(mp4|webm|ogg)$/i))

              // 현재 페이지의 등록된 이미지 키들 확인
              const pageImageKeys = Object.keys(formData.images).filter(key => key.startsWith(`${pageNum}-`))
              
              // 이미지 렌더링 (모든 단계에서)
                return (
                  <div
                    key={imageKey}
                    className="relative transition-all"
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, pageNum, imageNum)}
                  >
                    {displayUrl ? (
                      <>
                        {/* 이미지가 있는 경우 - 교체 가능 */}
                        <div className="bg-gray-200 overflow-hidden relative">
                          {isVideo ? (
                            <video
                              src={displayUrl}
                              autoPlay
                              {...(formData.imageAlts?.[imageKey] !== "false" && { loop: true })}
                              muted
                              playsInline
                              className="w-full h-auto"
                              title={formData.imageAlts?.[imageKey] || ''}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          ) : (
                            <img
                              src={displayUrl}
                              alt={formData.imageAlts?.[imageKey] || `페이지 ${pageNum} 이미지 ${imageNum}`}
                              title={formData.imageAlts?.[imageKey] || ''}
                              className="w-full h-auto"
                            />
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 이미지가 없는 경우 - 일괄수정 모드에서는 숨김 */}
                        {!isBulkEdit && (
                          <>
                            <div 
                              className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => triggerFileSelect(pageNum, imageNum)}
                            >
                              <div className="text-center">
                                <p className="text-2xl mb-1">📷</p>
                                <span className="text-gray-400 text-xs block">이미지 {imageNum} 미업로드</span>
                                <span className="text-gray-400 text-xs block">클릭하여 업로드</span>
                              </div>
                            </div>
                            {/* Hidden file input */}
                            <input
                              id={`file-input-${pageNum}-${imageNum}`}
                              type="file"
                              accept="image/*,video/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileInputChange(e, pageNum, imageNum)}
                            />
                          </>
                        )}
                      </>
                    )}
                  </div>
                )
            })
            })()}
          </div>

          {/* 템플릿별 컨텐츠 */}
          {renderTemplateContent(pageNum, isLastPage)}

          {/* surveyList 설문 표시 (현재 페이지의 설문만) */}
          {(() => {
            // 설문 데이터가 없으면 null 반환
            if (!formData.surveyList || formData.surveyList.length === 0) {
              return null
            }

            // 현재 페이지에 표시할 설문만 필터링
            const currentPageSurveys = formData.surveyList.filter(survey => survey.pageNum === pageNum)

            // 현재 페이지에 표시할 설문이 없으면 null 반환
            if (currentPageSurveys.length === 0) {
              return null
            }

            return (
              <div className="mx-auto w-[90%]">
                {currentPageSurveys.map((survey, surveyIndex) => {
                const isRadioType = survey.surveyDisplayType === 'radio'

                // surveySettings에서 값 가져오기
                const answerColor = formData.surveySettings?.answerColor || '#2c3e50'
                const numberColor = formData.surveySettings?.numberColor || '#3498db'
                const numberFormat = formData.surveySettings?.numberFormat || ''
                // 모바일/PC에 따라 폰트 크기 설정
                const numberFontSize = viewMode === 'mobile' ? '35px' : '60px'
                const typeFontSize = viewMode === 'mobile' ? '20px' : '35px'
                const radioAnswerFontSize = viewMode === 'mobile' ? '12px' : '18px'

                // 질문 번호 포맷 생성 (사용자 입력 기반)
                const getFormattedNumber = (index) => {
                  const num = index + 1
                  // 빈 문자열이면 숫자만 표시
                  if (!numberFormat || numberFormat.trim() === '') {
                    return `${num}`
                  }

                  // 그 외에는 형식 + 숫자 조합
                  return `${numberFormat}${num}`
                }

                // 색상 매핑 (hex → CSS) - 라디오형: accent 색상, 버튼형: 배경 색상
                const getColorClasses = (idx, isSelected) => {
                  const colorMap = {
                    '#9b59b6': {
                      accent: '#9b59b6',
                      buttonBg: isSelected ? 'bg-purple-600' : 'bg-gray-300',
                    },
                    '#3498db': {
                      accent: '#3498db',
                      buttonBg: isSelected ? 'bg-blue-500' : 'bg-gray-300',
                    },
                    '#27ae60': {
                      accent: '#27ae60',
                      buttonBg: isSelected ? 'bg-green-600' : 'bg-gray-300',
                    },
                    '#ff8c42': {
                      accent: '#ff8c42',
                      buttonBg: isSelected ? 'bg-orange-500' : 'bg-gray-300',
                    },
                    '#2c3e50': {
                      accent: '#2c3e50',
                      buttonBg: isSelected ? 'bg-gray-900' : 'bg-gray-300',
                    },
                    '#e91e63': {
                      accent: '#e91e63',
                      buttonBg: isSelected ? 'bg-pink-600' : 'bg-gray-300',
                    }
                  }
                  return colorMap[answerColor] || colorMap['#2c3e50']
                }

                // 질문 번호 색상 매핑
                const getNumberColorClass = () => {
                  const colorMap = {
                    '#9b59b6': 'text-purple-600',
                    '#3498db': 'text-blue-500',
                    '#27ae60': 'text-green-600',
                    '#ff8c42': 'text-orange-500',
                    '#2c3e50': 'text-gray-900',
                    '#e91e63': 'text-pink-600'
                  }
                  return colorMap[numberColor] || 'text-blue-500'
                }

                return (
                  <div key={surveyIndex} className="mb-6">
                    {/* 질문 */}
                    <div className="mb-3 text-left">
                      <span
                        className={`font-bold ${getNumberColorClass()}`}
                        style={{ fontSize: numberFontSize }}
                      >
                        {getFormattedNumber(surveyIndex)}
                      </span>
                      {survey.questionText ? (
                        <span
                          className="ml-2 font-semibold text-gray-800"
                          style={{ fontSize: typeFontSize }}
                        >
                          {survey.questionText}
                        </span>
                      ) : (
                        <span className="ml-2 font-medium text-gray-400" style={{ fontSize: typeFontSize }}>
                          질문을 입력하세요
                        </span>
                      )}
                    </div>

                    {/* 선택지 */}
                    {survey.options && survey.options.length > 0 && (
                      isRadioType ? (
                        // 라디오형: 가로 배치 (테두리 없음)
                        <div className="survey-answers-radio" style={{ '--answer-color': answerColor }}>
                          {survey.options.map((option, idx) => {
                            const surveyKey = `page${pageNum}_survey${surveyIndex}`
                            const isSelected = selectedSurveyOptions[surveyKey] === idx
                            return (
                              <label
                                key={idx}
                                className="survey-answer-option"
                              >
                                <input
                                  type="radio"
                                  name={`surveyList-${surveyKey}`}
                                  checked={isSelected}
                                  onChange={() => handleSurveySelect(pageNum, surveyIndex, idx)}
                                />
                                <span className={!option.text ? 'text-gray-400' : ''} style={{ fontSize: radioAnswerFontSize }}>
                                  {option.text || `선택지 ${idx + 1}`}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      ) : (
                        // 버튼형: 세로 배치
                        <div className="survey-answers-button" style={{ '--answer-color': answerColor }}>
                          {survey.options.map((option, idx) => {
                            const surveyKey = `page${pageNum}_survey${surveyIndex}`
                            const isChecked = selectedSurveyOptions[surveyKey] === idx
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSurveySelect(pageNum, surveyIndex, idx)}
                                className={`survey-answer-button ${isChecked ? 'selected' : ''}`}
                              >
                                {isChecked && <span className="check-mark">✓</span>}
                                <span className={`answer-text ${!option.text && !isChecked ? 'text-gray-400' : ''}`}>{option.text || `선택지 ${idx + 1}`}</span>
                              </button>
                            )
                          })}
                        </div>
                      )
                    )}
                  </div>
                )
              })}
            </div>
            )
          })()}

          {/* 마지막 페이지가 아니면: keepBtn 표시 (일반형만) - 일괄수정 모드에서는 숨김 */}
          {!isBulkEdit && !isLastPage && formData.keepBtnLocate !== 'fixed' && (
            <div className="mx-auto w-[90%] mb-5" style={{ maxWidth: '600px' }}>
              {formData.keepBtnImage ? (
                <div className="relative">
                  <img
                    src={formData.keepBtnImage}
                    alt="다음 단계"
                    className={`w-full h-auto ${isCurrentPageSurveyComplete() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    onClick={isCurrentPageSurveyComplete() ? nextPage : undefined}
                  />
                  {!isCurrentPageSurveyComplete() && (
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center rounded">
                      <span className="text-white text-sm font-medium bg-black bg-opacity-70 px-3 py-1 rounded">
                        질문과 선택지를 모두 입력해주세요
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-12 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">다음 버튼 이미지 미선택</span>
                </div>
              )}
            </div>
          )}

          {/* 마지막 페이지: 폼 */}
          {isLastPage && (
            <>
              {/* 혜택 기간 - 이름 입력란 위로 이동 */}
              {shouldShowBenefitPeriod() && (
                <div className="mx-auto w-[90%] mb-4" style={{ maxWidth: '600px' }}>
                  <p 
                    style={{ 
                      fontWeight: 'bold', 
                      fontSize: viewMode === 'mobile' ? '15px' : '18px',
                      lineHeight: viewMode === 'mobile' ? '19px' : '24px',
                      textAlign: 'center',
                      margin: 0,
                      color: '#333'
                    }}
                  >
                    혜택 기간: {calculateBenefitPeriod()}
                  </p>
                </div>
              )}

              {/* 폼 영역 */}
              <div className={`formStyleClassName ${getFormStyleClass()}`}>
                <div className="input-wrap">
                  <div className="input-user">
                    <label>이름</label>
                    <input
                      type="text"
                      value={previewFormData.name}
                      onChange={(e) => setPreviewFormData({ ...previewFormData, name: e.target.value })}
                      placeholder="입력*"
                    />
                  </div>
                  <div className="input-contact">
                    <label>연락처</label>
                    <div className="phone-wrap">
                      <input
                        type="text"
                        value="010"
                        readOnly
                      />
                      <input
                        type="text"
                        value={previewFormData.phone2}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setPreviewFormData({ ...previewFormData, phone2: value })
                        }}
                        placeholder="입력*"
                        maxLength={4}
                      />
                      <input
                        type="text"
                        value={previewFormData.phone3}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setPreviewFormData({ ...previewFormData, phone3: value })
                        }}
                        placeholder="입력*"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 일반형: 동의 문구, 개인정보처리방침, 제휴 안내, 신청 버튼 */}
              {formData.buttonPosition !== 'fixed' && (
                <>
                  {/* 개인정보 동의 문구 (체크박스 포함) */}
                  <div className={`consentClassName ${getPrivacyConsentClass()} mx-auto w-[90%]`}>
                    <label className="consent-text">
                      <input
                        type="checkbox"
                        className="consent-checkbox"
                        defaultChecked
                        style={{ marginRight: '5px' }}
                      />
                      개인정보수집에 동의하시는 분만 '신청하기'버튼을 눌러주세요
                    </label>
                    <button
                      onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                      className="consent-button"
                      type="button"
                    >
                      [{showPrivacyDetails ? '닫기' : '자세히보기'}]
                    </button>
                  </div>

                  {/* 개인정보처리방침 상세 (자세히보기 클릭 시만 표시) */}
                  {showPrivacyDetails && formData.privacyPolicy && renderPrivacyPolicy()}

                  {/* 제휴사 안내 문구 (스타일별 표시) */}
                  {renderPartnerNotice()}

                  {/* 신청 버튼 - 이미지 (일괄수정 모드에서는 숨김) */}
                  {!isBulkEdit && (
                    formData.buttonImage ? (
                      <div className="mx-auto w-[90%] mb-5" style={{ maxWidth: '600px' }}>
                        <img
                          src={formData.buttonImage}
                          alt="신청하기"
                          className="w-full h-auto cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="mx-auto w-[90%] mb-5" style={{ maxWidth: '600px' }}>
                        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-12 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">신청 버튼 이미지 미선택</span>
                        </div>
                      </div>
                    )
                  )}
                </>
              )}

              {/* 띄움형: 동의 문구, 개인정보처리방침, 제휴 안내를 페이지 내 표시 */}
              {formData.buttonPosition === 'fixed' && (
                <>
                  {/* 개인정보 동의 문구 (체크박스 포함) */}
                  <div className={`consentClassName ${getPrivacyConsentClass()} mx-auto w-[90%]`}>
                    <label className="consent-text">
                      <input
                        type="checkbox"
                        className="consent-checkbox"
                        defaultChecked
                        style={{ marginRight: '5px' }}
                      />
                      개인정보수집에 동의하시는 분만 '신청하기'버튼을 눌러주세요
                    </label>
                    <button
                      onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                      className="consent-button"
                      type="button"
                    >
                      [{showPrivacyDetails ? '닫기' : '자세히보기'}]
                    </button>
                  </div>

                  {/* 개인정보처리방침 상세 (자세히보기 클릭 시만 표시) */}
                  {showPrivacyDetails && formData.privacyPolicy && renderPrivacyPolicy()}

                  {/* 제휴사 안내 문구 (스타일별 표시) */}
                  {renderPartnerNotice()}
                </>
              )}
            </>
          )}

          {/* 푸터 - 모든 페이지에 표시 */}
          {formData.footerDetail && formData.footerClassName && (
            <footer className={`footerClassName ${formData.footerClassName}`}>
              {renderFooterContent(formData.footerClassName, formData.footerDetail)}
            </footer>
          )}
        </div>
      </div>
    )
  }

  const renderTemplateContent = (pageNum, isLastPage) => {
    // 새로운 템플릿 구조에서는 특별한 컨텐츠 없음 (설문은 surveyList로 처리)
    return null
  }

  const shouldShowBenefitPeriod = () => {
    // null이면 표시 안 함, "week"나 "month"일 때만 표시
    return formData.benefitPeriodType === "week" || formData.benefitPeriodType === "month"
  }

  const getFormStyleClass = () => {
    // 선택되지 않았을 때는 기본값 "light" 사용
    const style = formData.formStyle || 'light'

    // formStyleClassName을 반환 (CSS에서 정의된 클래스 사용)
    return `form-${style}`
  }

  const getButtonColor = () => {
    switch (formData.buttonColor) {
      case '검은색': return 'bg-black'
      case '파란색': return 'bg-blue-600'
      case '빨간색': return 'bg-red-600'
      case '녹색': return 'bg-green-600'
      case '주황색': return 'bg-orange-600'
      default: return 'bg-gray-800'
    }
  }

  const getBenefitPeriodStyleClass = () => {
    switch (formData.benefitPeriodStyle) {
      case '스타일 1':
        return 'bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4'
      case '스타일 2':
        return 'bg-yellow-100 border border-yellow-200 rounded-md p-3'
      case '스타일 3':
        return 'bg-gray-100 rounded p-2'
      default:
        return 'bg-yellow-50 border border-yellow-200 rounded-lg p-3'
    }
  }

  const getBenefitPeriodTextClass = () => {
    switch (formData.benefitPeriodStyle) {
      case '스타일 1':
        return 'text-xs text-yellow-800 font-bold'
      case '스타일 2':
        return 'text-xs text-yellow-700 font-medium'
      case '스타일 3':
        return 'text-xs text-gray-600'
      default:
        return 'text-xs text-yellow-700 font-medium'
    }
  }

  if (currentStep < 2) return null

  const pageCount = getPageCount()

  return (
    <div className="h-full flex flex-col bg-gray-200 p-4">
      {/* 상단: PC/모바일 전환 + 페이지 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        {/* 왼쪽: PC/모바일 전환 */}
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'mobile'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-400 text-white hover:bg-gray-500'
            }`}
            title="모바일"
          >
            <FontAwesomeIcon icon={faMobileAlt} className="text-sm" />
          </button>
          <button
            onClick={() => setViewMode('pc')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'pc'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-400 text-white hover:bg-gray-500'
            }`}
            title="PC"
          >
            <FontAwesomeIcon icon={faDesktop} className="text-sm" />
          </button>
        </div>

        {/* 오른쪽: 페이지 네비게이션 */}
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-gray-700 text-white rounded disabled:opacity-30 disabled:bg-gray-400 text-sm flex items-center gap-1 hover:bg-gray-800 transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              페이지
            </button>
            <span className="text-sm font-medium text-gray-700">
              {currentPage} / {pageCount}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === pageCount}
              className="px-3 py-1.5 bg-gray-700 text-white rounded disabled:opacity-30 disabled:bg-gray-400 text-sm flex items-center gap-1 hover:bg-gray-800 transition-colors"
            >
              페이지
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>
          </div>
        )}
      </div>

      {/* 미리보기 프레임 */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div
          className={`bg-white rounded shadow-xl border border-gray-300 relative ${viewMode === 'mobile' ? 'preview-mobile' : 'preview-pc'}`}
          style={{
            width: viewMode === 'mobile' ? '375px' : '1200px',
            height: viewMode === 'mobile' ? '812px' : '720px',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          <div className="h-full overflow-y-auto preview-scrollbar">
            {renderPage(currentPage)}
          </div>

          {/* 띄움형 버튼 (하단 고정) */}
          {/* 마지막 페이지가 아닐 때: keepBtn 띄움형 */}
          {currentPage < getPageCount() && formData.keepBtnLocate === 'fixed' && (
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="mx-auto" style={{ maxWidth: viewMode === 'mobile' ? '375px' : '768px' }}>
                <div className="mx-auto w-[90%]" style={{ maxWidth: '600px' }}>
                  {formData.keepBtnImage ? (
                    <div className="relative">
                      <img
                        src={formData.keepBtnImage}
                        alt="다음 단계"
                        className={`w-full h-auto ${isCurrentPageSurveyComplete() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                        onClick={isCurrentPageSurveyComplete() ? nextPage : undefined}
                      />
                      {!isCurrentPageSurveyComplete() && (
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center rounded">
                          <span className="text-white text-sm font-medium bg-black bg-opacity-70 px-3 py-1 rounded">
                            질문과 선택지를 모두 입력해주세요
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-12 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">다음 버튼 이미지 미선택</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 마지막 페이지일 때: 신청 버튼 띄움형 (일괄수정 모드에서는 숨김) */}
          {!isBulkEdit && currentPage === getPageCount() && formData.buttonPosition === 'fixed' && (
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="mx-auto" style={{ maxWidth: viewMode === 'mobile' ? '375px' : '768px' }}>
                {formData.buttonImage ? (
                  <div className="mx-auto w-[90%]" style={{ maxWidth: '600px' }}>
                    <img
                      src={formData.buttonImage}
                      alt="신청하기"
                      className="w-full h-auto cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="mx-auto w-[90%]" style={{ maxWidth: '600px' }}>
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-12 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">신청 버튼 이미지 미선택</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
