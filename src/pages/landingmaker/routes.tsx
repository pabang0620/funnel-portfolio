import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './dashboard/Page'
import Login from './login/Page'
import TemplateCreate from './templatecreate/Page'
import DomainManagement from './domainmanagement/Page'
import PublishComplete from './publishcomplete/Page'
import PreviewPage from './preview/PreviewPage'
import './landingmaker-theme.css'

export function LandingMakerRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="login" element={<Login />} />
      <Route path="dashboard" element={<Navigate to=".." replace />} />
      <Route path="create/template" element={<TemplateCreate />} />
      <Route path="create/template/:adNumber" element={<TemplateCreate />} />
      <Route path="bulk-edit/:domainUrl" element={<TemplateCreate mode="bulk-edit" />} />
      <Route path="publish/complete" element={<PublishComplete />} />
      <Route path="admin/domain" element={<DomainManagement />} />
      <Route path="preview/:adNumber" element={<PreviewPage />} />
    </Routes>
  )
}
