import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import UtmBuilderRoutes from '@/pages/utm-builder/routes'
import HrHubRoutes from '@/pages/hr-hub/routes'
import AdContentStorageRoutes from '@/pages/ad-content-storage/routes'
import PortfolioEduRoutes from '@/pages/portfolio-edu/routes'
import PortfolioCsRoutes from '@/pages/portfolio-cs/routes'
import AdLibraryScraperRoutes from '@/pages/ad-library-scraper/routes'
import MeetingRoomRoutes from '@/pages/meeting-room/routes'
import PortfolioDriveRoutes from '@/pages/portfolio-drive/routes'
import MancewayRoutes from '@/pages/manceway/routes'
import PortfolioSolutionRoutes from '@/pages/portfolio-solution/routes'
import PortfolioLayout from '@/components/PortfolioLayout'
import { LandingMakerRoutes } from '@/pages/landingmaker/routes'
import { CroftRoutes } from '@/pages/croft/routes'
import { DriveWebRoutes } from '@/pages/driveweb/routes'
import { EliceRoutes } from '@/pages/elice/routes'

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
        <Route path="/portfolio-edu/*" element={
          <PortfolioLayout project="Edu Platform">
            <PortfolioEduRoutes />
          </PortfolioLayout>
        } />
        <Route path="/portfolio-cs/*" element={
          <PortfolioLayout project="CS Manager">
            <PortfolioCsRoutes />
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
        <Route path="/portfolio-drive/*" element={
          <PortfolioLayout project="File Hub">
            <PortfolioDriveRoutes />
          </PortfolioLayout>
        } />
        <Route path="/manceway/*" element={
          <PortfolioLayout project="Manceway">
            <MancewayRoutes />
          </PortfolioLayout>
        } />
        <Route path="/portfolio-solution/*" element={
          <PortfolioLayout project="Med Manager">
            <PortfolioSolutionRoutes />
          </PortfolioLayout>
        } />
        <Route path="/portfolio/landingmaker/*" element={
          <PortfolioLayout project="Landing Maker">
            <LandingMakerRoutes />
          </PortfolioLayout>
        } />
        <Route path="/portfolio/croft/*" element={
          <PortfolioLayout project="Croft Dashboard">
            <CroftRoutes />
          </PortfolioLayout>
        } />
        <Route path="/portfolio/driveweb/*" element={
          <PortfolioLayout project="DriveWeb">
            <DriveWebRoutes />
          </PortfolioLayout>
        } />
        <Route path="/portfolio/elice" element={
          <PortfolioLayout project="Elice">
            <EliceRoutes />
          </PortfolioLayout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
