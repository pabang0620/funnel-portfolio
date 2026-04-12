import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import OrgChartPage from './pages/OrgChartPage'
import EmployeeListPage from './pages/EmployeeListPage'

export default function HrHubApp() {
  const [page, setPage] = useState<'org' | 'employees'>('employees')

  return (
    <div className="flex h-full">
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="flex-1 overflow-hidden">
        {page === 'org' && <OrgChartPage />}
        {page === 'employees' && <EmployeeListPage />}
      </main>
    </div>
  )
}
