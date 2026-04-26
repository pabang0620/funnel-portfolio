import { Link } from 'react-router-dom'

const COMPANY_PROJECTS = [
  {
    key: 'landingmaker',
    name: 'Landing Maker',
    path: '/portfolio/landingmaker',
    description: '퍼포먼스 마케터를 위한 랜딩 페이지 제작·관리 툴. 템플릿 기반으로 광고별 랜딩을 빠르게 생성하고 도메인 단위 일괄 편집까지 지원',
    tags: ['React', 'Node.js'],
  },
  {
    key: 'ad-library-scraper',
    name: 'Ad Library Scraper',
    path: '/ad-library-scraper',
    description: '경쟁사 광고 소재를 수집·저장하고 레퍼런스 시안으로 분류해 회의에서 바로 활용할 수 있는 광고 레퍼런스 관리 도구',
    tags: ['React', 'Python'],
  },
  {
    key: 'meeting-room',
    name: 'Meeting Room',
    path: '/meeting-room',
    description: '사내 회의실 실시간 예약 시스템. 슬랙 연동으로 예약 알림과 현황을 채널에서 바로 확인 가능',
    tags: ['React', 'Node.js'],
  },
  {
    key: 'portfolio-drive',
    name: 'File Hub',
    path: '/portfolio-drive',
    description: '구글 드라이브처럼 회사 자료를 업로드·분류·관리하는 사내 파일 스토리지. 폴더 구조와 드래그앤드롭으로 윈도우 탐색기처럼 사용 가능',
    tags: ['React', 'Python'],
  },
  {
    key: 'manceway',
    name: 'Manceway',
    path: '/manceway',
    description: '이커머스 제품 광고 성과 대시보드. 채널별 광고비·매출·이익을 한눈에 확인하고 마케팅 의사결정을 지원',
    tags: ['React', 'Node.js'],
  },
  {
    key: 'portfolio-solution',
    name: 'Med Manager',
    path: '/portfolio-solution',
    description: '병원 광고 대행 통합 관리 플랫폼. 광고로 유입된 리드 데이터 저장, 성과 보고, 광고비 조절, TM 콜 데이터 관리까지 병원 광고 운영 전반을 커버',
    tags: ['React', 'Node.js'],
  },
  {
    key: 'utm-builder',
    name: 'UTM Builder',
    path: '/utm-builder',
    description: 'Ad Content Storage에서 사용하는 광고 추적 키를 생성하는 도구. 채널·캠페인·소재별 UTM 파라미터를 표준화해 일관된 데이터 수집 기반을 제공',
    tags: ['React', 'Python'],
  },
  {
    key: 'hr-hub',
    name: 'HR Hub',
    path: '/hr-hub',
    description: '',
    tags: ['React', 'Python'],
  },
  {
    key: 'ad-content-storage',
    name: 'Ad Content Storage',
    path: '/ad-content-storage',
    description: '이커머스 제품 마케팅 파일을 저장·분류하는 에셋 관리 시스템. 방대한 광고 소재를 체계적으로 정리하고 채널별 성과도 함께 확인 가능',
    tags: ['React', 'Python'],
  },
  {
    key: 'portfolio-edu',
    name: 'Edu Platform',
    path: '/portfolio-edu',
    description: 'AI 교육·마케팅 교육·사내 교육 콘텐츠를 통합 관리하는 교육 플랫폼. 수강 현황 관리와 교육 자료 배포를 한 곳에서 운영',
    tags: ['React', 'Python'],
  },
  {
    key: 'portfolio-cs',
    name: 'CS Manager',
    path: '/portfolio-cs',
    description: '콜팀 상담 녹취록을 저장·관리하는 CS 플랫폼. 운영 시간 외에도 챗봇으로 대응할 수 있도록 연동 기반을 갖춰 24시간 고객 응대 체계 구축',
    tags: ['React', 'Python'],
  },
]

const OUTSOURCED_PROJECTS = [
  {
    key: 'driveweb',
    name: 'DriveWeb',
    path: '/portfolio/driveweb',
    description: '구글 드라이브 스타일의 웹 기반 파일 관리 인터페이스. 폴더 트리 탐색, 파일 업로드·다운로드, 공유 권한 관리 기능 제공',
    tags: ['React'],
  },
  {
    key: 'elice',
    name: 'Elice',
    path: '/portfolio/elice',
    description: '엘리스 교육 플랫폼의 5학년 과정 학습 인터페이스. 단계별 문제 풀이와 채점, 학습 진도 시각화를 제공하는 교육용 웹앱',
    tags: ['React'],
  },
  {
    key: 'croft',
    name: 'Croft Dashboard',
    path: '/portfolio/croft',
    description: '이커머스 광고 성과를 채널별·기간별로 분석하는 통합 대시보드. 글로벌·단일 뷰 전환과 드래그앤드롭 위젯으로 맞춤형 리포트 구성 가능',
    tags: ['React', 'ApexCharts'],
  },
]

interface Project {
  key: string
  name: string
  path: string
  description: string
  tags: string[]
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          {project.name}
        </h3>
        {project.description ? (
          <p className="text-sm text-gray-500 leading-relaxed">{project.description}</p>
        ) : (
          <p className="text-sm text-gray-300">—</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        to={project.path}
        className="inline-flex items-center justify-center w-full py-2 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        데모 보기
      </Link>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* 회사 프로젝트 섹션 */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">회사</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {COMPANY_PROJECTS.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPANY_PROJECTS.map((project) => (
              <ProjectCard key={project.key} project={project} />
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* 외주 프로젝트 섹션 */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">외주</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
              {OUTSOURCED_PROJECTS.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OUTSOURCED_PROJECTS.map((project) => (
              <ProjectCard key={project.key} project={project} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
