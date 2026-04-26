import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import { AuthProvider } from './contexts/AuthContext'
import { FolderTreeProvider } from './contexts/FolderTreeContext'
import DrivePage from './DrivePage'
import AdminPage from './AdminPage'
import SearchPage from './SearchPage'
import TrashPage from './TrashPage'
import './portfolio-drive-theme.css'

export default function PortfolioDriveRoutes() {
  return (
    <AuthProvider>
      <FolderTreeProvider>
        <div className="portfolio-drive-app h-full">
          <Routes>
            <Route index element={<DrivePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="trash" element={<TrashPage />} />
          </Routes>
          <Toaster />
        </div>
      </FolderTreeProvider>
    </AuthProvider>
  )
}
