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
            <Route path="product" element={<DemoLock projectName="UTM Builder" pageName="브랜드/제품 관리" />} />
            <Route path="media" element={<DemoLock projectName="UTM Builder" pageName="매체 관리" />} />
            <Route path="content-type" element={<DemoLock projectName="UTM Builder" pageName="콘텐츠타입 관리" />} />
            <Route path="placement" element={<DemoLock projectName="UTM Builder" pageName="지면/구좌 관리" />} />
            <Route path="users" element={<DemoLock projectName="UTM Builder" pageName="사용자 관리" />} />
            <Route path="*" element={<DemoLock projectName="UTM Builder" pageName="페이지" />} />
          </Routes>
        </UtmBuilderLayout>
      </MasterDataProvider>
    </div>
  )
}
