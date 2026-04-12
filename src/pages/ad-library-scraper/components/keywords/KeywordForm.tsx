import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { SOURCES_OPTIONS } from '../../lib/constants'

interface KeywordFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (keyword: string, sources: string) => void | Promise<void>
  initialValue?: string
  initialSources?: string
  mode: 'create' | 'edit'
}

export function KeywordForm({ open, onOpenChange, onSubmit, initialValue = '', initialSources, mode }: KeywordFormProps) {
  const [value, setValue] = useState(initialValue)
  const [sources, setSources] = useState(initialSources ?? 'google')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setValue(initialValue)
      setSources(initialSources ?? 'google')
    }
  }, [open, initialValue, initialSources])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(trimmed, sources)
      onOpenChange(false)
    } catch {
      // Keep dialog open on error — let parent handle error display
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '키워드 추가' : '키워드 수정'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              placeholder="키워드를 입력하세요"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              disabled={submitting}
            />
            <div className="pt-2">
              <Select value={sources} onValueChange={setSources}>
                <SelectTrigger>
                  <SelectValue placeholder="플랫폼 선택" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              취소
            </Button>
            <Button type="submit" disabled={!value.trim() || submitting}>
              {submitting ? '처리 중...' : mode === 'create' ? '추가' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
