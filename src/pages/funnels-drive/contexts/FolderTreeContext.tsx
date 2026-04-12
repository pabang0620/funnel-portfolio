import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { mockFolders } from '../../../data/funnels-drive/mockService'
import type { Folder } from '../types'

interface FolderTreeContextValue {
  folders: Folder[]
  isLoading: boolean
  refreshTree: () => Promise<void>
}

const FolderTreeContext = createContext<FolderTreeContextValue | null>(null)

export function FolderTreeProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshTree = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = mockFolders.getFolderTree()
      setFolders(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshTree()
  }, [refreshTree])

  return (
    <FolderTreeContext.Provider value={{ folders, isLoading, refreshTree }}>
      {children}
    </FolderTreeContext.Provider>
  )
}

export function useFolderTree(): FolderTreeContextValue {
  const ctx = useContext(FolderTreeContext)
  if (!ctx) throw new Error('useFolderTree must be used within FolderTreeProvider')
  return ctx
}
