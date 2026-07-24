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
        <Route path="dashboard" element={<DemoLockPage pageName="Dashboard" />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="admin" element={<DemoLockPage pageName="User Management" />} />
        <Route path="attribute-labels" element={<DemoLockPage pageName="Attribute Labels" />} />
        <Route path="ad-code-mapping" element={<DemoLockPage pageName="Auto Ad-Code Mapping" />} />
        <Route path="products" element={<DemoLockPage pageName="Product Management" />} />
        <Route path="category-groups" element={<DemoLockPage pageName="Category Groups" />} />
        <Route path="label-connections" element={<DemoLockPage pageName="Label Connections" />} />
        <Route path="guide" element={<DemoLockPage pageName="Guide" />} />
        <Route path="*" element={<DemoLockPage pageName="Page" />} />
      </Routes>
    </div>
  )
}
