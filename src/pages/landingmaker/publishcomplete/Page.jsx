import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PortfolioWidget from '@/components/landingmaker/PortfolioWidget'

export default function PublishComplete() {
  const navigate = useNavigate()
  const location = useLocation()

  // Authentication check - redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Redirecting to login...');
      navigate('/portfolio/landingmaker/login', { replace: true });
    }
  }, [navigate]);

  // state로 전달받은 실제 랜딩 번호 사용
  const landingNumber = location.state?.adNumber || '알 수 없음'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl w-full text-center">
        <div className="text-6xl mb-6">✅</div>

        <h1 className="text-3xl font-bold mb-8">
          랜딩 페이지가 생성되었습니다!
        </h1>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-gray-600 mb-3 font-medium">랜딩 번호:</p>
          <div className="text-4xl font-bold text-blue-600">
            {landingNumber}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/portfolio/landingmaker')}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            목록으로
          </button>
          <button
            onClick={() => navigate(`/portfolio/landingmaker/create/template/${landingNumber}`)}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            수정하기
          </button>
          <button
            onClick={() => navigate('/portfolio/landingmaker/create/template')}
            className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            새로 만들기
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>생성된 파일: front-end/dentevent/landing/{landingNumber}.html</p>
        </div>
      </div>

      <PortfolioWidget />
    </div>
  )
}
