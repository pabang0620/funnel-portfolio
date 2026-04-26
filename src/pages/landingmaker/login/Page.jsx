import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from './api'
import { Button } from '@/components/landingmaker/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/landingmaker/ui/card'
import { Input } from '@/components/landingmaker/ui/input'
import { Label } from '@/components/landingmaker/ui/label'
import { Checkbox } from '@/components/landingmaker/ui/checkbox'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('demo1234')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 입력값 검증
    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }

    try {
      setLoading(true)

      // 로그인 API 호출
      const response = await loginUser({
        username,
        password,
      })

      if (response.success) {
        // role 체크 (1, 2, 3만 허용)
        const userRole = response.data.user?.role
        if (![1, 2, 3].includes(userRole)) {
          setError('접근 권한이 없습니다. 관리자에게 문의하세요.')
          return
        }

        // 토큰을 localStorage에 저장
        localStorage.setItem('token', response.data.token)
        console.log('✅ 토큰 저장 완료:', response.data.token.substring(0, 20) + '...')

        // 사용자 정보 변환 (user_id -> userId)
        if (response.data.user) {
          const userData = {
            userId: response.data.user.user_id,
            username: response.data.user.username,
            name: response.data.user.name,
            role: response.data.user.role,
            hospital_name_id: response.data.user.hospital_name_id
          }
          console.log('✅ 변환된 사용자 정보:', userData)
          localStorage.setItem('user', JSON.stringify(userData))

          // localStorage에 제대로 저장되었는지 확인
          const savedUser = JSON.parse(localStorage.getItem('user'))
          console.log('✅ localStorage에 저장된 user:', savedUser)
          console.log('✅ userId:', savedUser.userId, '(타입:', typeof savedUser.userId + ')')
        }

        console.log('로그인 성공:', response.data.user)

        // 대시보드로 이동
        navigate('/portfolio/landingmaker')
      } else {
        setError(response.msg || '로그인에 실패했습니다.')
      }
    } catch (err) {
      console.error('로그인 오류:', err)

      // 에러 메시지 처리
      if (err.response?.data?.msg) {
        setError(err.response.data.msg)
      } else if (err.response?.status === 401) {
        setError('비밀번호가 일치하지 않습니다.')
      } else if (err.response?.status === 404) {
        setError('사용자를 찾을 수 없습니다.')
      } else if (err.response?.status === 403) {
        setError('비활성화된 계정입니다. 관리자에게 문의하세요.')
      } else {
        setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>관리자 계정 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  disabled={loading}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  로그인 상태 유지
                </Label>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
