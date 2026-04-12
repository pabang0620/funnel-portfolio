import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useUser()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      // email(ID)과 password로 로그인
      await login(username, password)
      navigate('/funnelmance-cs/upload')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        padding: '2.5rem',
        borderRadius: 'var(--radius)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--beige) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            FunnelMance CS
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              사용자명
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.875rem',
                border: '1px solid var(--border)',
                borderRadius: 'calc(var(--radius) - 0.125rem)',
                fontSize: '0.9375rem',
                backgroundColor: 'var(--input)',
                color: 'var(--foreground)',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              placeholder="사용자명을 입력하세요"
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.875rem',
                border: '1px solid var(--border)',
                borderRadius: 'calc(var(--radius) - 0.125rem)',
                fontSize: '0.9375rem',
                backgroundColor: 'var(--input)',
                color: 'var(--foreground)',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '0.875rem',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'calc(var(--radius) - 0.125rem)',
              color: 'var(--destructive)',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              border: 'none',
              borderRadius: 'calc(var(--radius) - 0.125rem)',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
              boxShadow: '0 4px 12px rgba(255, 112, 67, 0.25)'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login