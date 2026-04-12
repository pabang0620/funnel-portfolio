import { useState, useEffect } from 'react'
import { Check, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { getReferenceSets, createReferenceItem } from '../../../../data/ad-library-scraper/mockService'
import type { Ad } from '../../types/ad'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  ad: Ad
}

export function AddToReferenceDialog({ open, onOpenChange, ad }: Props) {
  const [sets, setSets] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setAdded(new Set())
    getReferenceSets(20, 0)
      .then(data => setSets(data.items.filter(s => !s.completed).map(s => ({ id: s.id, name: s.name }))))
      .catch(() => toast.error('세트를 불러오지 못했습니다'))
      .finally(() => setLoading(false))
  }, [open])

  async function handleAdd(setId: string) {
    if (added.has(setId) || adding === setId) return
    setAdding(setId)
    try {
      const url = ad.variants[0]?.content_url || ''
      await createReferenceItem(setId, url, null, String(ad.id))
      setAdded(prev => new Set(prev).add(setId))
      toast.success('레퍼런스에 추가되었습니다')
    } catch {
      toast.error('추가에 실패했습니다')
    } finally {
      setAdding(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>레퍼런스에 추가</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sets.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">세트가 없습니다</p>
        ) : (
          <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto -mx-1 px-1">
            {sets.map(set => (
              <button
                key={set.id}
                onClick={() => handleAdd(set.id)}
                disabled={adding === set.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left w-full disabled:opacity-50"
              >
                <span className="text-sm truncate">{set.name}</span>
                {adding === set.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                ) : added.has(set.id) ? (
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
