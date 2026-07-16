export interface Project {
  key: string // matches route folder name, e.g. 'utm-builder'
  name: string // display name, e.g. 'UTM Builder'
  path: string // real route, e.g. '/utm-builder'
  description: string // one-line card description
  tag: string // single category chip
}

export const PROJECTS: Project[] = [
  {
    key: 'utm-builder',
    name: 'UTM Builder',
    path: '/utm-builder',
    description:
      'Ad Content Storage에서 사용하는 광고 추적 키를 생성하는 도구. 채널·캠페인·소재별 UTM 파라미터를 표준화해 일관된 데이터 수집 기반을 제공',
    tag: 'Marketing',
  },
  {
    key: 'hr-hub',
    name: 'HR Hub',
    path: '/hr-hub',
    // TODO(review): confirm HR Hub description
    description: '조직도·인사정보 관리 대시보드',
    tag: 'Internal',
  },
  {
    key: 'ad-content-storage',
    name: 'Ad Content Storage',
    path: '/ad-content-storage',
    description:
      '이커머스 제품 마케팅 파일을 저장·분류하는 에셋 관리 시스템. 방대한 광고 소재를 체계적으로 정리하고 채널별 성과도 함께 확인 가능',
    tag: 'AI',
  },
  {
    key: 'funnel-edu',
    name: 'Edu Platform',
    path: '/funnel-edu',
    description:
      'AI 교육·마케팅 교육·사내 교육 콘텐츠를 통합 관리하는 교육 플랫폼. 수강 현황 관리와 교육 자료 배포를 한 곳에서 운영',
    tag: 'Education',
  },
  {
    key: 'funnelmance-cs',
    name: 'CS Manager',
    path: '/funnelmance-cs',
    description:
      '콜팀 상담 녹취록을 저장·관리하는 CS 플랫폼. 운영 시간 외에도 챗봇으로 대응할 수 있도록 연동 기반을 갖춰 24시간 고객 응대 체계 구축',
    tag: 'Support',
  },
  {
    key: 'ad-library-scraper',
    name: 'Ad Library Scraper',
    path: '/ad-library-scraper',
    description:
      '경쟁사 광고 소재를 수집·저장하고 레퍼런스 시안으로 분류해 회의에서 바로 활용할 수 있는 광고 레퍼런스 관리 도구',
    tag: 'Data',
  },
  {
    key: 'meeting-room',
    name: 'Meeting Room',
    path: '/meeting-room',
    description: '사내 회의실 실시간 예약 시스템. 슬랙 연동으로 예약 알림과 현황을 채널에서 바로 확인 가능',
    tag: 'Internal',
  },
  {
    key: 'funnels-drive',
    name: 'File Hub',
    path: '/funnels-drive',
    description:
      '구글 드라이브처럼 회사 자료를 업로드·분류·관리하는 사내 파일 스토리지. 폴더 구조와 드래그앤드롭으로 윈도우 탐색기처럼 사용 가능',
    tag: 'Infra',
  },
  {
    key: 'manceway',
    name: 'Manceway',
    path: '/manceway',
    description: '이커머스 제품 광고 성과 대시보드. 채널별 광고비·매출·이익을 한눈에 확인하고 마케팅 의사결정을 지원',
    tag: 'Analytics',
  },
  {
    key: 'funnelsolution',
    name: 'Med Manager',
    path: '/funnelsolution',
    description:
      '병원 광고 대행 통합 관리 플랫폼. 광고로 유입된 리드 데이터 저장, 성과 보고, 광고비 조절, TM 콜 데이터 관리까지 병원 광고 운영 전반을 커버',
    tag: 'Ops',
  },
]
