/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Routes, Route, Navigate } from 'react-router-dom'
import './manceway-theme.css'
// @ts-ignore
import { AuthProvider } from './contexts/AuthContext'
// @ts-ignore
import { PermissionsProvider } from './contexts/PermissionsContext'
// @ts-ignore
import ExecutiveReport from './service/executiveReport/Page'
// @ts-ignore
import MarketingReport from './service/marketingreport/Page'
// @ts-ignore
import MediaOperations from './service/mediaoperations/Page'
import DemoLock from '@/components/DemoLock'

export default function MancewayRoutes() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <div className="manceway-app" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route index element={<Navigate to="executive-report" replace />} />
            <Route path="executive-report" element={<ExecutiveReport />} />
            <Route path="marketing-report" element={<MarketingReport />} />
            <Route path="media-operations" element={<MediaOperations />} />
            <Route path="data-entry-status" element={<DemoLock projectName="Manceway" pageName="데이터 입력 현황" />} />
            <Route path="data-entry-history" element={<DemoLock projectName="Manceway" pageName="데이터 입력 이력" />} />
          </Routes>
        </div>
      </PermissionsProvider>
    </AuthProvider>
  )
}
