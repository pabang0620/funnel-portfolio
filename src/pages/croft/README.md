# Croft - 스마트팜 관리 시스템

## 프로젝트 개요
Croft는 스마트팜의 환경 데이터를 모니터링하고 관리하는 웹 기반 시스템입니다.
원본 프로젝트를 landing-maker 포트폴리오에 통합하여 더미 데이터로 작동하도록 변환했습니다.

## 기술 스택
- **Framework**: React 18
- **Routing**: React Router v7
- **Charting**: ECharts
- **UI**: Tailwind CSS
- **Date**: date-fns, react-datepicker
- **State Management**: React Query (@tanstack/react-query)

## 주요 기능

### 1. 통합 대시보드
- 전체 스마트팜 컨테이너 목록 및 상태 확인
- 각 컨테이너별 온도, 습도, CO2, 일사량 실시간 데이터 표시

### 2. 단일 온실 대시보드
- 선택한 컨테이너의 상세 환경 데이터 모니터링
- 실시간 차트 및 그래프 시각화

### 3. 온실 환경 분석
- **종합**: 전체 환경 데이터 통합 뷰
- **RTR (Root to Temperature Ratio)**: 뿌리-온도 비율 분석
- **DLI (Daily Light Integral)**: 일일 광량 적산치
- **VPD (Vapor Pressure Deficit)**: 포차 분석
- **Photo Period**: 광주기 관리

### 4. 매출 보고서
- 연도별 매출 데이터
- 3년/5년/10년 비교 보고서

### 5. 자원 사용량
- 물 사용량
- 전기 사용량
- 비료 사용량

### 6. 종합 보고서
- 생산량, 품질, 비용 분석
- 통계 및 인사이트

## 프로젝트 구조

```
croft/
├── Page.jsx                 # 메인 라우팅 컴포넌트
├── layout/                  # 레이아웃 컴포넌트
│   ├── Layout.jsx          # 전체 레이아웃
│   ├── NavBar/             # 상단 네비게이션
│   └── SideBar/            # 사이드바 메뉴
├── pages/                   # 페이지 컴포넌트
│   ├── GlobalDashBoard.jsx # 통합 대시보드
│   ├── SingleDashBoard.jsx # 단일 온실 대시보드
│   ├── SingleFarm/         # 온실 환경 분석 페이지
│   ├── SingleSales.jsx     # 매출 보고서
│   ├── SingleResource.jsx  # 자원 사용량
│   └── SingleReport.jsx    # 종합 보고서
├── component/               # 재사용 컴포넌트
│   ├── Charts/             # 차트 컴포넌트
│   ├── Graphs/             # 그래프 컴포넌트
│   └── utils/              # 유틸리티
│       ├── api/            # API 및 더미 데이터
│       ├── Data/           # 데이터 상수
│       └── Icons/          # 아이콘 컴포넌트
└── index.css               # 글로벌 스타일
```

## API 더미 데이터

모든 API 호출은 더미 데이터로 대체되었습니다.

**위치**: `component/utils/api/Charts/dummyData.jsx`

**제공 데이터**:
- `container-list`: 컨테이너 목록
- `dashboard`: 대시보드 데이터
- `chart-data`: 차트 데이터
- `sales`: 매출 데이터
- `resource`: 자원 사용 데이터
- `report`: 보고서 데이터
- `environment`: 환경 데이터

## 라우트 구조

```
/portfolio/croft/                              # 통합 대시보드
/portfolio/croft/dash                          # 단일 온실 대시보드
/portfolio/croft/dash/environment/total/:id    # 온실환경 종합
/portfolio/croft/dash/environment/RTR          # RTR 분석
/portfolio/croft/dash/environment/DLI          # DLI 분석
/portfolio/croft/dash/environment/VPD          # VPD 분석
/portfolio/croft/dash/environment/PP           # Photo Period
/portfolio/croft/global-report                 # 글로벌 리포트
/portfolio/croft/single-sales                  # 매출 보고서
/portfolio/croft/single-sales/years/:year      # N년 매출 비교
/portfolio/croft/single-resource               # 자원 사용량
/portfolio/croft/single-report                 # 종합 보고서
```

## 변경 사항

### 원본 프로젝트 대비 변경점

1. **API 통합**
   - Axios → 더미 데이터 함수로 변경
   - 모든 백엔드 호출 제거

2. **환경 변수 제거**
   - `process.env.PUBLIC_URL` → `/croft/assets`
   - `process.env.REACT_APP_BASE_API_KEY` → 제거

3. **라우팅 경로**
   - 절대 경로 → `/portfolio/croft/` prefix 추가
   - 상대 라우팅으로 변경

4. **파일 확장자**
   - JSX를 포함한 모든 `.js` → `.jsx`

5. **패키지 통합**
   - landing-maker의 package.json에 통합
   - 필요한 패키지만 추가 설치

## 설치 및 실행

```bash
# 패키지 설치 (이미 완료)
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 접속 방법

개발 서버 실행 후:
```
http://localhost:5173/portfolio/croft
```

## 주의사항

- 모든 데이터는 더미 데이터입니다
- 실제 API 연동은 포함되어 있지 않습니다
- 컴포넌트 간 navigate 경로는 `/portfolio/croft/` prefix가 필요합니다
