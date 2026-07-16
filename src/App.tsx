import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import UtmBuilderRoutes from '@/pages/utm-builder/routes'
import HrHubRoutes from '@/pages/hr-hub/routes'
import AdContentStorageRoutes from '@/pages/ad-content-storage/routes'
import EduPlatformRoutes from '@/pages/edu-platform/routes'
import CsManagerRoutes from '@/pages/cs-manager/routes'
import AdLibraryScraperRoutes from '@/pages/ad-library-scraper/routes'
import MeetingRoomRoutes from '@/pages/meeting-room/routes'
import FileHubRoutes from '@/pages/file-hub/routes'
import AdPerformanceRoutes from '@/pages/ad-performance/routes'
import MedManagerRoutes from '@/pages/med-manager/routes'
import PortfolioLayout from '@/components/PortfolioLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/utm-builder/*" element={
          <PortfolioLayout project="UTM Builder">
            <UtmBuilderRoutes />
          </PortfolioLayout>
        } />
        <Route path="/hr-hub/*" element={
          <PortfolioLayout project="HR Hub">
            <HrHubRoutes />
          </PortfolioLayout>
        } />
        <Route path="/ad-content-storage/*" element={
          <PortfolioLayout project="Ad Content Storage">
            <AdContentStorageRoutes />
          </PortfolioLayout>
        } />
        <Route path="/edu-platform/*" element={
          <PortfolioLayout project="Edu Platform">
            <EduPlatformRoutes />
          </PortfolioLayout>
        } />
        <Route path="/cs-manager/*" element={
          <PortfolioLayout project="CS Manager">
            <CsManagerRoutes />
          </PortfolioLayout>
        } />
        <Route path="/ad-library-scraper/*" element={
          <PortfolioLayout project="Ad Library Scraper">
            <AdLibraryScraperRoutes />
          </PortfolioLayout>
        } />
        <Route path="/meeting-room/*" element={
          <PortfolioLayout project="Meeting Room">
            <MeetingRoomRoutes />
          </PortfolioLayout>
        } />
        <Route path="/file-hub/*" element={
          <PortfolioLayout project="File Hub">
            <FileHubRoutes />
          </PortfolioLayout>
        } />
        <Route path="/ad-performance/*" element={
          <PortfolioLayout project="Ad Performance">
            <AdPerformanceRoutes />
          </PortfolioLayout>
        } />
        <Route path="/med-manager/*" element={
          <PortfolioLayout project="Med Manager">
            <MedManagerRoutes />
          </PortfolioLayout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
