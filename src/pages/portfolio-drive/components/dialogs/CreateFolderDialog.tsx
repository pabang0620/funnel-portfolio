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
import { Checkbox } from '../ui/checkbox'
import { mockFolders } from '../../../../data/portfolio-drive/mockService'
import { useAuth } from '../../contexts/AuthContext'

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId: string | null
  onSuccess: () => void
}

export default function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
  onSuccess,
}: CreateFolderDialogProps) {
  const { isAdmin } = useAuth()
  const [name, setName] = useState('')
  const [isAdminOnly, setIsAdminOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    try {
      mockFolders.createFolder({ name: name.trim(), parent_id: parentId, is_admin_only: isAdminOnly })
      toast.success('폴더가 생성되었습니다.')
      setName('')
      setIsAdminOnly(false)
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('폴더 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 폴더 만들기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="folder-name">폴더명</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="폴더명을 입력하세요"
              autoFocus
            />
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="admin-only"
                checked={isAdminOnly}
                onCheckedChange={(checked: boolean | 'indeterminate') => setIsAdminOnly(checked === true)}
              />
              <Label htmlFor="admin-only" className="cursor-pointer">
                관리자 전용 폴더
              </Label>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? '생성 중...' : '만들기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
