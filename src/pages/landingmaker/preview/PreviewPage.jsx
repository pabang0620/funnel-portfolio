import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LandingPreview from '@/components/landingmaker/LandingPreview'
import { getLanding } from '@/pages/landingmaker/templatecreate/api'

const PreviewPage = () => {
  const { adNumber } = useParams()
  const [previewData, setPreviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        setLoading(true)
        const response = await getLanding(adNumber)

        if (response.success) {
          const data = response.data

          // API 데이터를 LandingPreview가 기대하는 형식으로 변환
          const images = {}
          // imgUrl1~6을 페이지-슬롯 형식으로 변환
          ;[
            data.imgUrl1,
            data.imgUrl2,
            data.imgUrl3,
            data.imgUrl4,
            data.imgUrl5,
            data.imgUrl6,
          ].forEach((url, index) => {
            if (url) {
              const imgUrlIndex = index + 1
              const page = Math.ceil(imgUrlIndex / 2)
              const slot = ((imgUrlIndex - 1) % 2) + 1
              const key = `${page}-${slot}`
              images[key] = url
            }
          })

          // 페이지별 최대 이미지 번호 계산
          const imageCountByPage = {}
          Object.keys(images).forEach((key) => {
            const [pageNum, imageNum] = key.split('-').map(Number)
            if (!imageCountByPage[pageNum] || imageCountByPage[pageNum] < imageNum) {
              imageCountByPage[pageNum] = imageNum
            }
          })

          // 변환된 데이터 설정
          const transformedData = {
            ...data,
            images: images,
            imageCountPerPage: imageCountByPage,
            buttonImage: data.postBtnUrl || '',
            keepBtnImage: data.keepBtnUrl || ''
          }

          setPreviewData(transformedData)
        } else {
          setError('랜딩 데이터를 불러오는데 실패했습니다.')
        }
      } catch (err) {
        console.error('미리보기 데이터 로드 오류:', err)
        setError('미리보기를 여는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (adNumber) {
      fetchPreviewData()
    }
  }, [adNumber])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">미리보기 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            창 닫기
          </button>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            랜딩 페이지 미리보기 - {previewData.adNumber}
          </h1>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            창 닫기
          </button>
        </div>
      </div>

      {/* 미리보기 내용 */}
      <div className="max-w-7xl mx-auto">
        <LandingPreview
          formData={previewData}
          currentStep={2}
          onPrevStep={() => {}}
          onNextStep={() => {}}
          canProceed={true}
          isBulkEdit={false}
          imageCountPerPage={previewData.imageCountPerPage || {}}
        />
      </div>
    </div>
  )
}

export default PreviewPage
