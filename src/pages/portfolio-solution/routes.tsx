import { Routes, Route, Navigate } from 'react-router-dom'
import './portfolio-solution-theme.css'
import DemoLock from '@/components/DemoLock'
// @ts-ignore — JSX file, no type declarations needed for demo
import Layout from './shared/Layout'
// @ts-ignore — JSX file, no type declarations needed for demo
import MainReportPage from './mainReport/index'
// @ts-ignore — JSX file, no type declarations needed for demo
import CustomerDbPage from './dbList/index'
import CreateCodePage from './createCode/index'
// @ts-ignore — JSX file, no type declarations needed for demo
import TmStatusPage from './tmStatus/index'
// @ts-ignore — JSX file, no type declarations needed for demo
import PivotPage from './pivot/index'

function LockedPage({ pageName }: { pageName: string }) {
  return <DemoLock projectName="Med Manager" pageName={pageName} />
}

export default function PortfolioSolutionRoutes() {
  return (
    <div className="portfolio-solution-app" style={{ minHeight: '100%' }}>
      <Layout>
      <Routes>
        <Route index element={<Navigate to="main-report" replace />} />
        <Route path="main-report" element={<MainReportPage />} />
        <Route path="db-list" element={<CustomerDbPage />} />
        <Route path="create-code" element={<CreateCodePage />} />
        <Route path="tm-status" element={<TmStatusPage />} />
        {/* Pivot */}
        <Route path="pivot" element={<PivotPage />} />
        <Route path="admin/*" element={<LockedPage pageName="관리자 페이지" />} />
        <Route path="branch-list" element={<LockedPage pageName="지점 리스트" />} />
        <Route path="performance-report" element={<LockedPage pageName="성과 리포트" />} />
        <Route path="ad-cost/*" element={<LockedPage pageName="광고비 관리" />} />
        <Route path="tm/search" element={<LockedPage pageName="TM 검색 및 분배" />} />
        <Route path="tm/notice" element={<LockedPage pageName="TM 공지사항" />} />
        <Route path="tm/calendar" element={<LockedPage pageName="TM 예약 달력" />} />
        <Route path="vacation" element={<LockedPage pageName="휴가 달력" />} />
        <Route path="code-list" element={<LockedPage pageName="코드 목록" />} />
        <Route path="*" element={<LockedPage pageName="데모 버전에서 제공되지 않는 페이지" />} />
      </Routes>
      </Layout>
    </div>
  )
}
