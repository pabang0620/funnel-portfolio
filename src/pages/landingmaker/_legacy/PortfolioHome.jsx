import { useNavigate } from 'react-router-dom'

const BASE = 'https://funnel-portfolio.vercel.app'

const COMPANY = [
  {
    id: 'landingmaker',
    title: 'Landing Maker',
    description: '광고 랜딩 페이지를 템플릿 기반으로 빠르게 생성하고 도메인별로 일괄 편집·발행하는 랜딩 제작 시스템',
    tags: ['React', 'Python'],
    path: '/portfolio/landingmaker',
    external: false,
  },
  {
    id: 'ad-library-scraper',
    title: 'Ad Library Scraper',
    description: '경쟁사 광고 소재를 수집·저장하고 레퍼런스 시안으로 분류해 회의에서 바로 활용할 수 있는 광고 레퍼런스 관리 도구',
    tags: ['React', 'Python'],
    path: `${BASE}/ad-library-scraper`,
    external: true,
  },
  {
    id: 'meeting-room',
    title: 'Meeting Room',
    description: '사내 회의실 실시간 예약 시스템. 슬랙 연동으로 예약 알림과 현황을 채널에서 바로 확인 가능',
    tags: ['React', 'Node.js'],
    path: `${BASE}/meeting-room`,
    external: true,
  },
  {
    id: 'funnels-drive',
    title: 'File Hub',
    description: '구글 드라이브처럼 회사 자료를 업로드·분류·관리하는 사내 파일 스토리지. 폴더 구조와 드래그앤드롭으로 윈도우 탐색기처럼 사용 가능',
    tags: ['React', 'Python'],
    path: `${BASE}/funnels-drive`,
    external: true,
  },
  {
    id: 'manceway',
    title: 'Manceway',
    description: '이커머스 제품 광고 성과 대시보드. 채널별 광고비·매출·이익을 한눈에 확인하고 마케팅 의사결정을 지원',
    tags: ['React', 'Node.js'],
    path: `${BASE}/manceway`,
    external: true,
  },
  {
    id: 'funnelsolution',
    title: 'Med Manager',
    description: '병원 광고 대행 통합 관리 플랫폼. 광고로 유입된 리드 데이터 저장, 성과 보고, 광고비 조절, TM 콜 데이터 관리까지 병원 광고 운영 전반을 커버',
    tags: ['React', 'Node.js'],
    path: `${BASE}/funnelsolution`,
    external: true,
  },
  {
    id: 'utm-builder',
    title: 'UTM Builder',
    description: 'Ad Content Storage에서 사용하는 광고 추적 키를 생성하는 도구. 채널·캠페인·소재별 UTM 파라미터를 표준화해 일관된 데이터 수집 기반을 제공',
    tags: ['React', 'Python'],
    path: `${BASE}/utm-builder`,
    external: true,
  },
  {
    id: 'hr-hub',
    title: 'HR Hub',
    description: '',
    tags: ['React', 'Python'],
    path: `${BASE}/hr-hub`,
    external: true,
  },
  {
    id: 'ad-content-storage',
    title: 'Ad Content Storage',
    description: '이커머스 제품 마케팅 파일을 저장·분류하는 에셋 관리 시스템. 방대한 광고 소재를 체계적으로 정리하고 채널별 성과도 함께 확인 가능',
    tags: ['React', 'Python'],
    path: `${BASE}/ad-content-storage`,
    external: true,
  },
  {
    id: 'funnel-edu',
    title: 'Edu Platform',
    description: 'AI 교육·마케팅 교육·사내 교육 콘텐츠를 통합 관리하는 교육 플랫폼. 수강 현황 관리와 교육 자료 배포를 한 곳에서 운영',
    tags: ['React', 'Python'],
    path: `${BASE}/funnel-edu`,
    external: true,
  },
  {
    id: 'funnelmance-cs',
    title: 'CS Manager',
    description: '콜팀 상담 녹취록을 저장·관리하는 CS 플랫폼. 운영 시간 외에도 챗봇으로 대응할 수 있도록 연동 기반을 갖춰 24시간 고객 응대 체계 구축',
    tags: ['React', 'Python'],
    path: `${BASE}/funnelmance-cs`,
    external: true,
  },
]

const FREELANCE = [
  {
    id: 'driveweb',
    title: 'DriveWeb',
    description: '운행일지 관리 시스템',
    tags: ['React', 'Node.js'],
    path: '/portfolio/driveweb',
    external: false,
  },
  {
    id: 'elice',
    title: 'Elice Math',
    description: '초등 5학년 수학 문제 플랫폼',
    tags: ['React'],
    path: '/portfolio/elice',
    external: false,
  },
  {
    id: 'croft',
    title: 'Croft',
    description: '스마트팜 모니터링 대시보드',
    tags: ['React'],
    path: '/portfolio/croft',
    external: false,
  },
]

function ProjectCard({ item, onNavigate }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
          {item.external && (
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </div>
        {item.description ? (
          <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
        ) : (
          <p className="text-sm text-gray-300">—</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={() => onNavigate(item)}
        className="inline-flex items-center justify-center w-full py-2 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        데모 보기
      </button>
    </div>
  )
}

export default function PortfolioHome() {
  const navigate = useNavigate()

  function handleNavigate(item) {
    if (item.external) {
      window.open(item.path, '_blank')
    } else {
      navigate(item.path)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-14">

        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">회사</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {COMPANY.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPANY.map((item) => (
              <ProjectCard key={item.id} item={item} onNavigate={handleNavigate} />
            ))}
          </div>
        </section>

        <div className="border-t border-gray-100" />

        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">외주</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
              {FREELANCE.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FREELANCE.map((item) => (
              <ProjectCard key={item.id} item={item} onNavigate={handleNavigate} />
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
