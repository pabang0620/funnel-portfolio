import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import DailyQuotePopup from './ui/DailyQuotePopup'
import { getTodayQuote } from '../api/dailyQuote'
import './Layout.css'

function Layout({ children, rightPanel }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(() => {
    const saved = localStorage.getItem('rightPanelCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // 오늘의 명언 상태
  const [showQuote, setShowQuote] = useState(false)
  const [todayQuote, setTodayQuote] = useState(null)

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    localStorage.setItem('rightPanelCollapsed', JSON.stringify(isRightPanelCollapsed))
  }, [isRightPanelCollapsed])

  // 오늘의 명언 표시 로직
  useEffect(() => {
    const checkAndShowQuote = async () => {
      const today = new Date().toISOString().split('T')[0]
      const lastShown = localStorage.getItem('dailyQuote_lastShown')

      // 오늘 이미 표시했으면 스킵
      if (lastShown === today) return

      try {
        // 사용자 정보에서 role, team 가져오기 (localStorage에서)
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : {}

        const response = await getTodayQuote(user.role, user.team)

        if (response.success && response.data) {
          setTodayQuote(response.data)
          setShowQuote(true)
          localStorage.setItem('dailyQuote_lastShown', today)
        }
      } catch (error) {
        console.error('오늘의 명언 로드 실패:', error)
      }
    }

    checkAndShowQuote()
  }, [])

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const handleRightPanelToggle = () => {
    setIsRightPanelCollapsed(!isRightPanelCollapsed)
  }


  return (
    <div className="layout-container">
      {showQuote && todayQuote && (
        <DailyQuotePopup
          quote={todayQuote}
          onClose={() => setShowQuote(false)}
        />
      )}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapsed={setIsSidebarCollapsed} />
      <div className={`layout-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isRightPanelCollapsed || !rightPanel ? 'right-panel-collapsed' : ''}`}>
        <button
          className={`sidebar-toggle-btn ${isSidebarCollapsed ? 'collapsed' : ''}`}
          onClick={handleSidebarToggle}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d={isSidebarCollapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {rightPanel && (
          <button
            className={`right-panel-toggle-btn ${isRightPanelCollapsed ? 'collapsed' : ''}`}
            onClick={handleRightPanelToggle}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d={isRightPanelCollapsed ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <main className="layout-main">
          {children}
        </main>
      </div>
      {rightPanel && (
        <aside className={`layout-right-panel ${isRightPanelCollapsed ? 'collapsed' : ''}`}>
          {rightPanel}
        </aside>
      )}
    </div>
  )
}

export default Layout
