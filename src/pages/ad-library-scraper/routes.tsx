import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import './ad-library-scraper-theme.css'
import { AppLayout } from './components/layout/AppLayout'
import { KeywordsPage } from './pages/KeywordsPage'
import { ResultsPage } from './pages/ResultsPage'
import { LandingUrlsPage } from './pages/LandingUrlsPage'
import { BookmarksPage } from './pages/BookmarksPage'
import { ReferencesPage } from './pages/ReferencesPage'

export default function AdLibraryScraperRoutes() {
  return (
    <div className="ad-library-scraper-app" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppLayout>
        <Routes>
          <Route index element={<Navigate to="/ad-library-scraper/results" replace />} />
          <Route path="keywords" element={<KeywordsPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="landing-urls" element={<LandingUrlsPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="references" element={<ReferencesPage />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </div>
  )
}
