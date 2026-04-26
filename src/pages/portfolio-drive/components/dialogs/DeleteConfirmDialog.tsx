import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  isLoading?: boolean
  destructive?: boolean
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = '삭제 확인',
  description = '휴지통으로 이동하시겠습니까?',
  isLoading = false,
  destructive = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {destructive && (
          <div className="flex justify-center mb-2">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle className={destructive ? 'text-destructive font-bold text-center' : ''}>
            {title}
          </DialogTitle>
          {destructive && (
            <p className="text-destructive font-bold text-sm text-center">
              ⚠️ 이 작업은 되돌릴 수 없습니다.
            </p>
          )}
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '삭제 중...' : destructive ? '영구 삭제' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
