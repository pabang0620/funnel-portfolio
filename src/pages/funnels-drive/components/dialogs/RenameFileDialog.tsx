import { useState, useEffect } from 'react'
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
import { mockFiles } from '../../../../data/funnels-drive/mockService'

interface RenameFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string
  currentName: string
  onSuccess: () => void
}

export default function RenameFileDialog({
  open,
  onOpenChange,
  fileId,
  currentName,
  onSuccess,
}: RenameFileDialogProps) {
  const [name, setName] = useState(currentName)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) setName(currentName)
  }, [open, currentName])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || name.trim() === currentName) return
    setIsLoading(true)
    try {
      mockFiles.renameFile(fileId, name.trim())
      toast.success('파일명이 변경되었습니다.')
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error('파일명 변경에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>파일 이름 변경</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rename-file">파일명</Label>
            <Input
              id="rename-file"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim() || name.trim() === currentName}>
              {isLoading ? '변경 중...' : '변경'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
