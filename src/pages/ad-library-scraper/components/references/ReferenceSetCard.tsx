import { useState } from 'react'
import { X } from 'lucide-react'
import type { ReferenceSet } from '../../types/reference'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface Props {
  set: ReferenceSet
  isSelected: boolean
  onSelect: () => void
  onDelete: (id: string) => void
}

export function ReferenceSetCard({ set, isSelected, onSelect, onDelete }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`"${set.name}" 세트를 삭제하시겠습니까?`}
        description="이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        destructive
        onConfirm={() => onDelete(set.id)}
      />
      <div className="relative group">
        <button
          className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent ${isSelected ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}`}
          onClick={onSelect}
        >
          <span className="truncate">{set.name}</span>
        </button>
        <button
          className="absolute top-1/2 -translate-y-1/2 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={(e) => { e.stopPropagation(); setConfirmOpen(true) }}
          aria-label={`${set.name} 삭제`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </>
  )
}
