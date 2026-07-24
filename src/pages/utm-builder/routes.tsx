import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import DemoLock from '@/components/DemoLock'
import { MasterDataProvider } from './contexts/MasterDataContext'
import { Layout } from './components/Layout'
import { UTMGenerator } from './UTMGenerator'
import { UTMHistory } from './UTMHistory'
import './utm-builder-theme.css'

function UtmBuilderLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isFullWidth = location.pathname.includes('/history')
  return <Layout fullWidth={isFullWidth}>{children}</Layout>
}

export default function UtmBuilderRoutes() {
  return (
    <div className="utm-builder-app" style={{ height: '100%' }}>
      <MasterDataProvider>
        <UtmBuilderLayout>
          <Routes>
            <Route index element={<Navigate to="create" replace />} />
            <Route path="create" element={<UTMGenerator />} />
            <Route path="history" element={<UTMHistory />} />
            <Route path="product" element={<DemoLock projectName="UTM Builder" pageName="Brand/Product Management" />} />
            <Route path="media" element={<DemoLock projectName="UTM Builder" pageName="Media Management" />} />
            <Route path="content-type" element={<DemoLock projectName="UTM Builder" pageName="Content Type Management" />} />
            <Route path="placement" element={<DemoLock projectName="UTM Builder" pageName="Placement/Slot Management" />} />
            <Route path="users" element={<DemoLock projectName="UTM Builder" pageName="User Management" />} />
            <Route path="*" element={<DemoLock projectName="UTM Builder" pageName="Page" />} />
          </Routes>
        </UtmBuilderLayout>
      </MasterDataProvider>
    </div>
  )
}
