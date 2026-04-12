/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
// @ts-ignore
import { UserProvider } from './contexts/UserContext'
// @ts-ignore
import { ProductProvider } from './contexts/ProductContext'
// @ts-ignore
import Login from './pages/Login'
// @ts-ignore
import FileUploadPage from './pages/FileUploadPage'
// @ts-ignore
import FileListPage from './pages/FileListPage'
// @ts-ignore
import UserManagement from './pages/UserManagement'
import '@fortawesome/fontawesome-free/css/all.css'
import './funnelmance-cs-theme.css'

export default function FunnelmanceCsRoutes() {
  return (
    <div className="funnelmance-cs-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UserProvider>
        <ProductProvider>
          <Routes>
            <Route index element={<Navigate to="files" replace />} />
            <Route path="login" element={<Navigate to="/funnelmance-cs/files" replace />} />
            <Route path="upload" element={<FileUploadPage />} />
            <Route path="files" element={<FileListPage />} />
            <Route path="users" element={<UserManagement />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </ProductProvider>
      </UserProvider>
    </div>
  )
}
