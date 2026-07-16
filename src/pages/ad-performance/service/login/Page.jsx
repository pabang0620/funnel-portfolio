import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../contexts/AuthContext'
import { loginUser } from './api'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await loginUser({ username, password })

      if (response.success) {
        // AuthContext를 통한 로그인 처리
        login(response.token, response.user)

        navigate('/executive-report')
      } else {
        setError(response.message || '로그인에 실패했습니다.')
      }
    } catch (err) {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <p className="login-group-name">Funnel GROUP</p>
          <h1 className="login-title">Ad Performance</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <div className="login-field">
            <label>ID</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your ID"
              disabled={isLoading}
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>

      <button
        className="login-help-button"
        onClick={() => setShowHelp(!showHelp)}
        title="도움말"
      >
        <FontAwesomeIcon icon={faQuestion} />
      </button>
      {showHelp && (
        <div className="login-help-tooltip">
          <p>신규 계정 생성이 필요하거나</p>
          <p>ID/비밀번호를 잊으셨다면</p>
          <p><strong>S, A 등급 관리자</strong>에게 문의하세요.</p>
        </div>
      )}
    </div>
  )
}

export default Login
