import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (url: string, note: string | null) => Promise<void>
}

export function AddItemDialog({ open, onOpenChange, onAdd }: Props) {
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onAdd(url, note.trim() || null)
      setUrl('')
      setNote('')
      onOpenChange(false)
    } catch {
      // 모달 유지
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setUrl('')
      setNote('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>레퍼런스 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ref-url">URL</Label>
            <Input
              id="ref-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ref-note">
              이유 <span className="text-muted-foreground text-xs">(선택)</span>
            </Label>
            <Textarea
              id="ref-note"
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
              placeholder="이 레퍼런스를 추가하는 이유를 적어주세요"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '추가 중...' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
