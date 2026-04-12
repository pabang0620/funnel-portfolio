import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface PortfolioLayoutProps {
  project: string
  children: React.ReactNode
}

const PROJECTS = [
  { name: 'UTM Builder', path: '/utm-builder' },
  { name: 'HR Hub', path: '/hr-hub' },
  { name: 'Ad Content Storage', path: '/ad-content-storage' },
  { name: 'Funnel Edu', path: '/funnel-edu' },
  { name: 'Funnelmance CS', path: '/funnelmance-cs' },
  { name: 'Ad Library Scraper', path: '/ad-library-scraper' },
  { name: 'Meeting Room', path: '/meeting-room' },
  { name: 'Funnels Drive', path: '/funnels-drive' },
  { name: 'Manceway', path: '/manceway' },
  { name: 'Funnel Solution', path: '/funnelsolution' },
]

export default function PortfolioLayout({ children }: PortfolioLayoutProps) {
  const [expanded, setExpanded] = useState(false)
  const [demoListOpen, setDemoListOpen] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setExpanded(false)
        setDemoListOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentProject = PROJECTS.find(p => location.pathname.startsWith(p.path))

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <div style={{ height: '100%', overflow: 'auto' }}>{children}</div>

      {/* Fixed bottom-right floating widget */}
      <div
        ref={widgetRef}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        {/* Expanded panel */}
        {expanded && (
          <div
            style={{
              backgroundColor: '#111827',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              minWidth: '180px',
            }}
          >
            {/* 포트폴리오 */}
            <Link
              to="/"
              onClick={() => setExpanded(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#e5e7eb',
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1f2937')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ fontSize: '15px' }}>←</span>
              <span>포트폴리오</span>
            </Link>

            {/* 데모 버전 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#e5e7eb',
                fontSize: '13px',
              }}
            >
              <span
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '999px',
                  padding: '1px 8px',
                }}
              >
                🔒 데모 버전
              </span>
            </div>

            {/* 다른 데모 보기 */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDemoListOpen(prev => !prev)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                  fontSize: '13px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1f2937')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span>다른 데모 보기</span>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>{demoListOpen ? '▴' : '▾'}</span>
              </button>

              {demoListOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 4px)',
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    padding: '6px',
                    minWidth: '200px',
                  }}
                >
                  {PROJECTS.map(p => {
                    const isCurrent = currentProject?.path === p.path
                    return (
                      <Link
                        key={p.path}
                        to={p.path}
                        onClick={() => { setDemoListOpen(false); setExpanded(false) }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: isCurrent ? '#111827' : '#374151',
                          fontWeight: isCurrent ? 700 : 400,
                          textDecoration: 'none',
                          backgroundColor: isCurrent ? '#f3f4f6' : 'transparent',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.backgroundColor = '#f9fafb' }}
                        onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <span>{p.name}</span>
                        {isCurrent && <span style={{ color: '#16a34a', fontSize: '12px' }}>✓</span>}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toggle FAB */}
        <button
          onClick={() => { setExpanded(prev => !prev); setDemoListOpen(false) }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#111827',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'transform 0.2s, background 0.2s',
            transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
          title="포트폴리오 메뉴"
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1f2937')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#111827')}
        >
          {expanded ? '✕' : '☰'}
        </button>
      </div>
    </div>
  )
}
