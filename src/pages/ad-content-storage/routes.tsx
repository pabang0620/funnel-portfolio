import { Routes, Route, Navigate } from 'react-router-dom'
import DemoLockPage from './DemoLockPage'
import SearchPage from './SearchPage'
import UploadPage from './UploadPage'
import AnalyticsPage from './AnalyticsPage'
import './ad-content-storage-theme.css'

export default function AdContentStorageRoutes() {
  return (
    <div className="ad-content-storage-app h-full">
      <Routes>
        <Route index element={<Navigate to="search" replace />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="upload/:folderId" element={<UploadPage />} />
        <Route path="dashboard" element={<DemoLockPage pageName="대시보드" />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="admin" element={<DemoLockPage pageName="사용자 관리" />} />
        <Route path="attribute-labels" element={<DemoLockPage pageName="속성 라벨" />} />
        <Route path="ad-code-mapping" element={<DemoLockPage pageName="광고코드 자동 입력" />} />
        <Route path="products" element={<DemoLockPage pageName="제품 관리" />} />
        <Route path="category-groups" element={<DemoLockPage pageName="카테고리 그룹" />} />
        <Route path="label-connections" element={<DemoLockPage pageName="라벨 연결" />} />
        <Route path="guide" element={<DemoLockPage pageName="가이드" />} />
        <Route path="*" element={<DemoLockPage pageName="페이지" />} />
      </Routes>
    </div>
  )
}
