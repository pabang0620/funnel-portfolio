import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { mockAuth } from '../../../../data/file-hub/mockService'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [form, setForm] = useState({ username: '', name: '', password: '', role: 2 })
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      mockAuth.createUser(form)
      toast.success('계정이 생성되었습니다.')
      setForm({ username: '', name: '', password: '', role: 2 })
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('계정 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>계정 생성</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cu-username">아이디</Label>
            <Input
              id="cu-username"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cu-name">이름</Label>
            <Input
              id="cu-name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cu-password">비밀번호</Label>
            <Input
              id="cu-password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cu-role">역할</Label>
            <select
              id="cu-role"
              value={form.role}
              onChange={(e) => handleChange('role', Number(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value={2}>일반직원 (STAFF)</option>
              <option value={1}>관리자 (ADMIN)</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
