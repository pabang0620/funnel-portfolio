import { useState, useCallback, useRef } from 'react'

export function useSelection(items: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const lastSelectedIndexRef = useRef<number | null>(null)

  const toggle = useCallback(
    (id: string, index: number, shiftKey: boolean, ctrlKey: boolean) => {
      const lastIdx = lastSelectedIndexRef.current
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (shiftKey && lastIdx !== null) {
          const start = Math.min(lastIdx, index)
          const end = Math.max(lastIdx, index)
          for (let i = start; i <= end; i++) {
            if (items[i]) next.add(items[i])
          }
          return next
        }
        if (ctrlKey) {
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
          return next
        }
        if (next.has(id) && next.size === 1) {
          next.clear()
          return next
        }
        next.clear()
        next.add(id)
        return next
      })
      lastSelectedIndexRef.current = index
    },
    [items],
  )

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items))
  }, [items])

  const setAnchor = useCallback((index: number) => {
    lastSelectedIndexRef.current = index
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    lastSelectedIndexRef.current = null
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  )

  return { selectedIds, toggle, selectAll, setAnchor, clearSelection, isSelected }
}
