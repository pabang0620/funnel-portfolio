import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const PROJECTS = [
  { name: 'Landing Maker', path: '/portfolio/landingmaker' },
  { name: 'Ad Library Scraper', path: '/ad-library-scraper' },
  { name: 'Meeting Room', path: '/meeting-room' },
  { name: 'File Hub', path: '/funnels-drive' },
  { name: 'Manceway', path: '/manceway' },
  { name: 'Med Manager', path: '/funnelsolution' },
  { name: 'UTM Builder', path: '/utm-builder' },
  { name: 'HR Hub', path: '/hr-hub' },
  { name: 'Ad Content Storage', path: '/ad-content-storage' },
  { name: 'Edu Platform', path: '/funnel-edu' },
  { name: 'CS Manager', path: '/funnelmance-cs' },
  { name: 'DriveWeb', path: '/portfolio/driveweb' },
  { name: 'Elice Math', path: '/portfolio/elice' },
  { name: 'Croft', path: '/portfolio/croft' },
]

export default function PortfolioWidget() {
  const [expanded, setExpanded] = useState(false)
  const [demoListOpen, setDemoListOpen] = useState(false)
  const widgetRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handleClickOutside(e) {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setExpanded(false)
        setDemoListOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleProjectClick(project) {
    setExpanded(false)
    setDemoListOpen(false)
    navigate(project.path)
  }

  const currentProject = PROJECTS.find(p => location.pathname.startsWith(p.path))

  return (
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
      {expanded && (
        <div style={{
          backgroundColor: '#111827',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          minWidth: '180px',
        }}>
          {/* 포트폴리오로 */}
          <button
            onClick={() => { navigate('/'); setExpanded(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px',
              color: '#e5e7eb', fontSize: '13px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              transition: 'background 0.15s', textAlign: 'left', width: '100%',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f2937'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '15px' }}>←</span>
            <span>포트폴리오</span>
          </button>

          {/* 데모 버전 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
            <span style={{
              backgroundColor: '#fbbf24', color: '#000',
              fontSize: '11px', fontWeight: 600,
              borderRadius: '999px', padding: '1px 8px',
            }}>
              데모 버전
            </span>
          </div>

          {/* 다른 데모 보기 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDemoListOpen(prev => !prev)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '8px',
                padding: '8px 12px', borderRadius: '8px',
                color: '#e5e7eb', fontSize: '13px',
                background: 'transparent', border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f2937'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>다른 데모 보기</span>
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>{demoListOpen ? '▴' : '▾'}</span>
            </button>

            {demoListOpen && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 4px)',
                right: 0,
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                padding: '6px',
                minWidth: '200px',
                maxHeight: '320px',
                overflowY: 'auto',
              }}>
                {PROJECTS.map(p => {
                  const isCurrent = currentProject?.path === p.path
                  return (
                    <button
                      key={p.path}
                      onClick={() => handleProjectClick(p)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 12px', borderRadius: '6px',
                        fontSize: '13px',
                        color: isCurrent ? '#111827' : '#374151',
                        fontWeight: isCurrent ? 700 : 400,
                        backgroundColor: isCurrent ? '#f3f4f6' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        transition: 'background 0.1s', textAlign: 'left',
                      }}
                      onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.backgroundColor = '#f9fafb' }}
                      onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <span>{p.name}</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '8px', flexShrink: 0 }}>
                        {isCurrent ? '✓' : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB 버튼 */}
      <button
        onClick={() => { setExpanded(prev => !prev); setDemoListOpen(false) }}
        style={{
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: '#111827', color: '#fff',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
          transition: 'transform 0.2s, background 0.2s',
          transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f2937'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#111827'}
      >
        {expanded ? '✕' : '☰'}
      </button>
    </div>
  )
}
