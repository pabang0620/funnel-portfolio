import { Routes, Route, Navigate } from 'react-router-dom'
import './med-manager-theme.css'
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

export default function MedManagerRoutes() {
  return (
    <div className="med-manager-app" style={{ minHeight: '100%' }}>
      <Layout>
      <Routes>
        <Route index element={<Navigate to="main-report" replace />} />
        <Route path="main-report" element={<MainReportPage />} />
        <Route path="db-list" element={<CustomerDbPage />} />
        <Route path="create-code" element={<CreateCodePage />} />
        <Route path="tm-status" element={<TmStatusPage />} />
        {/* Pivot */}
        <Route path="pivot" element={<PivotPage />} />
        <Route path="admin/*" element={<LockedPage pageName="Admin Page" />} />
        <Route path="branch-list" element={<LockedPage pageName="Branch List" />} />
        <Route path="performance-report" element={<LockedPage pageName="Performance Report" />} />
        <Route path="ad-cost/*" element={<LockedPage pageName="Ad Cost Management" />} />
        <Route path="tm/search" element={<LockedPage pageName="TM Search & Assignment" />} />
        <Route path="tm/notice" element={<LockedPage pageName="TM Notices" />} />
        <Route path="tm/calendar" element={<LockedPage pageName="TM Booking Calendar" />} />
        <Route path="vacation" element={<LockedPage pageName="Vacation Calendar" />} />
        <Route path="code-list" element={<LockedPage pageName="Code List" />} />
        <Route path="*" element={<LockedPage pageName="Page not available in the demo version" />} />
      </Routes>
      </Layout>
    </div>
  )
}
