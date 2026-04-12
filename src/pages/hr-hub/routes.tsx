import { Routes, Route, Navigate } from 'react-router-dom'
import HrHubApp from './HrHubApp'
import './hr-hub-theme.css'

export default function HrHubRoutes() {
  return (
    <div className="hr-hub-app" style={{ height: '100%' }}>
      <Routes>
        <Route index element={<Navigate to="employees" replace />} />
        <Route path="employees" element={<HrHubApp />} />
        <Route path="org-chart" element={<HrHubApp />} />
        <Route path="*" element={<HrHubApp />} />
      </Routes>
    </div>
  )
}
