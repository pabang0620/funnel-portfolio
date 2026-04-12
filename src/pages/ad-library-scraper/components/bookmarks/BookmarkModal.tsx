import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'

interface BookmarkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'manage'
  initialNote?: string | null
  onAdd: (note: string | null) => Promise<void>
  onDelete: () => Promise<void>
  onUpdateNote: (note: string | null) => Promise<void>
}

export function BookmarkModal({
  open, onOpenChange, mode, initialNote = '',
  onAdd, onDelete, onUpdateNote,
}: BookmarkModalProps) {
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setNote(initialNote ?? '')
      setEditing(false)
    }
  }, [open, initialNote])

  function handleOpenChange(val: boolean) {
    if (!val) setEditing(false)
    onOpenChange(val)
  }

  async function handleAdd() {
    setLoading(true)
    try {
      await onAdd(note.trim() || null)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await onDelete()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateNote() {
    setLoading(true)
    try {
      await onUpdateNote(note.trim() || null)
      setEditing(false)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? '북마크 추가' : '북마크 관리'}</DialogTitle>
        </DialogHeader>

        {mode === 'add' && (
          <>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="메모 (선택사항)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>취소</Button>
              <Button onClick={() => handleAdd().catch(() => {})} disabled={loading}>저장</Button>
            </DialogFooter>
          </>
        )}

        {mode === 'manage' && !editing && (
          <>
            {initialNote && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{initialNote}</p>
            )}
            <DialogFooter className="gap-2 flex-wrap">
              <Button variant="destructive" onClick={() => handleDelete().catch(() => {})} disabled={loading}>북마크 취소</Button>
              <Button variant="outline" onClick={() => { setNote(initialNote ?? ''); setEditing(true) }} disabled={loading}>
                이유 수정
              </Button>
            </DialogFooter>
          </>
        )}

        {mode === 'manage' && editing && (
          <>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="메모 (선택사항)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditing(false)} disabled={loading}>뒤로</Button>
              <Button onClick={() => handleUpdateNote().catch(() => {})} disabled={loading}>저장</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
