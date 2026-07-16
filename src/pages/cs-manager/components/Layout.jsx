import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

function Layout({ children, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, currentUser, currentUserInfo, isAdmin } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen')
    return saved ? JSON.parse(saved) : true
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  const handleLogout = () => {
    logout()
    navigate('/cs-manager')
  }

  const isActive = (path) => location.pathname === path || location.pathname === `/cs-manager${path}`

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex' }}>
      {/* 사이드바 */}
      <aside style={{
        width: sidebarOpen ? '220px' : '60px',
        backgroundColor: 'var(--card)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        padding: sidebarOpen ? '1rem' : '0.6rem',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
        zIndex: 100
      }}>
        {/* 토글 버튼 (원형) */}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            left: sidebarOpen ? '200px' : '45px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: 'var(--muted-foreground)',
            transition: 'all 0.3s ease',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          title={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card)'
            e.currentTarget.style.color = 'var(--muted-foreground)'
          }}
        >
          <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`} style={{ position: 'relative', top: '1px' }}></i>
        </button>

        {/* 헤더 영역 (사이드바 내부) */}
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          paddingTop: sidebarOpen ? '0rem' : '1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          height: '2.5rem'
        }}>
          {!sidebarOpen && (
            <i className="fas fa-phone" style={{
              color: 'var(--accent)',
              fontSize: '1.1rem',
              flexShrink: 0,
              width: '1.2rem'
            }}></i>
          )}
          {sidebarOpen && (
            <h1 style={{
              margin: 0,
              color: 'var(--foreground)',
              fontWeight: '700',
              fontSize: '1rem',
              whiteSpace: 'nowrap'
            }}>
              CS Manager
            </h1>
          )}
        </div>

        {/* 메인 네비게이션 */}
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.25rem' }}>
              <Link
                to="/cs-manager/upload"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/cs-manager/upload')
                }}
                title={!sidebarOpen ? '파일 업로드' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  gap: '0.5rem',
                  padding: sidebarOpen ? '0.6rem 0.8rem' : '0.6rem',
                  color: isActive('/upload') ? 'var(--accent)' : 'var(--muted-foreground)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  backgroundColor: isActive('/upload') ? 'var(--muted)' : 'transparent',
                  border: isActive('/upload') ? '1px solid var(--accent)' : '1px solid transparent',
                  fontWeight: isActive('/upload') ? '600' : '500',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  width: sidebarOpen ? 'auto' : '100%'
                }}
              >
                <i className="fas fa-upload" style={{ width: '16px', textAlign: 'center', flexShrink: 0, fontSize: '1rem' }}></i>
                {sidebarOpen && <span>파일 업로드</span>}
              </Link>
            </li>
            <li style={{ marginBottom: '0.25rem' }}>
              <Link
                to="/cs-manager/files"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/cs-manager/files')
                }}
                title={!sidebarOpen ? '파일 탐색기' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  gap: '0.5rem',
                  padding: sidebarOpen ? '0.6rem 0.8rem' : '0.6rem',
                  color: isActive('/files') ? 'var(--accent)' : 'var(--muted-foreground)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  backgroundColor: isActive('/files') ? 'var(--muted)' : 'transparent',
                  border: isActive('/files') ? '1px solid var(--accent)' : '1px solid transparent',
                  fontWeight: isActive('/files') ? '600' : '500',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  width: sidebarOpen ? 'auto' : '100%'
                }}
              >
                <i className="fas fa-folder-open" style={{ width: '16px', textAlign: 'center', flexShrink: 0, fontSize: '1rem' }}></i>
                {sidebarOpen && <span>파일 탐색기</span>}
              </Link>
            </li>
            <li style={{ marginBottom: '0.25rem' }}>
              <Link
                to="/cs-manager/users"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/cs-manager/users')
                }}
                title={!sidebarOpen ? '유저 관리' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  gap: '0.5rem',
                  padding: sidebarOpen ? '0.6rem 0.8rem' : '0.6rem',
                  color: isActive('/users') ? 'var(--accent)' : 'var(--muted-foreground)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  backgroundColor: isActive('/users') ? 'var(--muted)' : 'transparent',
                  border: isActive('/users') ? '1px solid var(--accent)' : '1px solid transparent',
                  fontWeight: isActive('/users') ? '600' : '500',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  width: sidebarOpen ? 'auto' : '100%'
                }}
              >
                <i className="fas fa-users" style={{ width: '16px', textAlign: 'center', flexShrink: 0, fontSize: '1rem' }}></i>
                {sidebarOpen && <span>유저 관리</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {/* 계정 정보 (하단) */}
        <div style={{ marginTop: 'auto', position: 'relative' }}>
          {sidebarOpen ? (
            <>
              {/* 계정 정보 카드 (사이드바 열림) */}
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--muted)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <i className={`fas ${isAdmin ? 'fa-crown' : 'fa-user'}`} style={{
                      color: isAdmin ? 'var(--accent)' : 'var(--primary)',
                      fontSize: '1.1rem'
                    }}></i>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--foreground)', fontSize: '0.9rem' }}>
                        {currentUserInfo?.name || '사용자'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                        @{currentUser || 'unknown'}
                      </div>
                    </div>
                  </div>
                  {/* 세로 점 메뉴 버튼 */}
                  <button
                    onClick={toggleUserMenu}
                    style={{
                      padding: '0.4rem',
                      backgroundColor: 'transparent',
                      color: 'var(--muted-foreground)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--background)'
                      e.target.style.color = 'var(--foreground)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = 'var(--muted-foreground)'
                    }}
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>

              {/* 드롭다운 메뉴 */}
              {userMenuOpen && (
                <>
                  {/* 배경 오버레이 */}
                  <div
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 999
                    }}
                  />
                  {/* 메뉴 */}
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    right: 0,
                    marginBottom: '0.5rem',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    zIndex: 1000
                  }}>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleLogout()
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'transparent',
                        color: 'var(--destructive)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--muted)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            /* 점 메뉴 버튼만 표시 (사이드바 닫힘) */
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
            }}>
              {/* 세로 점 메뉴 버튼 */}
              <button
                onClick={toggleUserMenu}
                title="메뉴"
                style={{
                  padding: '0.6rem 0.4rem',
                  backgroundColor: 'transparent',
                  color: 'var(--muted-foreground)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)'
                  e.currentTarget.style.color = 'var(--foreground)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--muted-foreground)'
                }}
              >
                <i className="fas fa-ellipsis-v"></i>
                {userMenuOpen && (
                  <>
                    {/* 배경 오버레이 */}
                    <div
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 999
                      }}
                    />
                    {/* 메뉴 */}
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      top: 'auto',
                      left: '50%',
                      right: 'auto',
                      transform: 'translateX(-50%)',
                      marginBottom: '0.5rem',
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      overflow: 'hidden',
                      zIndex: 1000,
                      minWidth: sidebarOpen ? '120px' : 'auto'
                    }}>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          handleLogout()
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: 'transparent',
                          color: 'var(--destructive)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          textAlign: 'left',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--muted)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <i className="fas fa-sign-out-alt" style={{ flexShrink: 0 }}></i>
                        {sidebarOpen && <span>로그아웃</span>}
                      </button>
                    </div>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main style={{
        marginLeft: sidebarOpen ? '220px' : '60px',
        padding: '2rem',
        backgroundColor: 'var(--background)',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
        width: `calc(100vw - ${sidebarOpen ? '220px' : '60px'})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '85%',
          height: '85vh'
        }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout