import type { FileItem, Folder, User } from '../../pages/portfolio-drive/types'
import foldersData from './folders.json'
import filesData from './files.json'
import trashData from './trash.json'
import usersData from './users.json'

// In-memory state
let foldersState: Folder[] = JSON.parse(JSON.stringify(foldersData)) as Folder[]
let filesState: FileItem[] = JSON.parse(JSON.stringify(filesData)) as FileItem[]
let trashState = JSON.parse(JSON.stringify(trashData)) as { files: FileItem[]; folders: Folder[] }
let usersState: User[] = JSON.parse(JSON.stringify(usersData)) as User[]

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function now(): string {
  return new Date().toISOString()
}

// --- Folder helpers ---
function flattenFolders(folders: Folder[]): Folder[] {
  return folders.flatMap(f => [f, ...flattenFolders(f.children ?? [])])
}

function findFolderById(id: string, folders: Folder[] = foldersState): Folder | null {
  for (const f of folders) {
    if (f.id === id) return f
    const found = findFolderById(id, f.children ?? [])
    if (found) return found
  }
  return null
}

function removeFolderById(id: string, folders: Folder[]): Folder[] {
  return folders
    .filter(f => f.id !== id)
    .map(f => ({ ...f, children: removeFolderById(id, f.children ?? []) }))
}

// --- Files API ---
export const mockFiles = {
  getFiles(folderId: string): FileItem[] {
    return filesState.filter(f => f.folder_id === folderId && !f.deleted_at)
  },

  createFile(data: Partial<FileItem> & { folder_id: string; file_name: string }): FileItem {
    const file: FileItem = {
      id: generateId(),
      folder_id: data.folder_id,
      file_name: data.file_name,
      s3_id: data.s3_id ?? generateId(),
      size: data.size ?? 0,
      mime_type: data.mime_type ?? null,
      created_date: data.created_date ?? now().slice(0, 10),
      creator: data.creator ?? null,
      event_name: data.event_name ?? null,
      uploaded_by: data.uploaded_by ?? 'u001',
      uploader_name: data.uploader_name ?? '홍길동',
      upload_date: now(),
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
      preview_url: data.preview_url ?? null,
    }
    filesState = [...filesState, file]
    return file
  },

  uploadFile(file: File, folderId: string): FileItem {
    const previewUrl = file.type.startsWith('image/') || file.type.startsWith('video/')
      ? URL.createObjectURL(file)
      : null
    return mockFiles.createFile({
      folder_id: folderId,
      file_name: file.name,
      size: file.size,
      mime_type: file.type || 'application/octet-stream',
      uploaded_by: 'u001',
      uploader_name: '홍길동',
      preview_url: previewUrl,
    })
  },

  renameFile(id: string, fileName: string): void {
    filesState = filesState.map(f =>
      f.id === id ? { ...f, file_name: fileName, updated_at: now() } : f
    )
  },

  moveFile(id: string, folderId: string): void {
    filesState = filesState.map(f =>
      f.id === id ? { ...f, folder_id: folderId, updated_at: now() } : f
    )
  },

  bulkMoveFiles(ids: string[], folderId: string): void {
    filesState = filesState.map(f =>
      ids.includes(f.id) ? { ...f, folder_id: folderId, updated_at: now() } : f
    )
  },

  deleteFile(id: string): void {
    const file = filesState.find(f => f.id === id)
    if (file) {
      filesState = filesState.filter(f => f.id !== id)
      trashState = {
        ...trashState,
        files: [...trashState.files, { ...file, deleted_at: now() }],
      }
    }
  },

  bulkDeleteFiles(ids: string[]): void {
    ids.forEach(id => mockFiles.deleteFile(id))
  },

  getDownloadUrl(id: string): string {
    const file = filesState.find(f => f.id === id)
    return file?.preview_url ?? `#download-${id}`
  },
}

// --- Folders API ---
export const mockFolders = {
  getFolderTree(): Folder[] {
    return JSON.parse(JSON.stringify(foldersState)) as Folder[]
  },

  getFolders(parentId?: string): Folder[] {
    const all = flattenFolders(foldersState)
    if (parentId) {
      return all.filter(f => f.parent_id === parentId && !f.deleted_at)
    }
    return foldersState.filter(f => !f.parent_id && !f.deleted_at)
  },

  createFolder(data: { name: string; parent_id: string | null; is_admin_only: boolean }): Folder {
    const folder: Folder = {
      id: generateId(),
      name: data.name,
      parent_id: data.parent_id,
      is_admin_only: data.is_admin_only,
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
      children: [],
    }

    if (!data.parent_id) {
      foldersState = [...foldersState, folder]
    } else {
      function insertInto(folders: Folder[]): Folder[] {
        return folders.map(f => {
          if (f.id === data.parent_id) {
            return { ...f, children: [...(f.children ?? []), folder] }
          }
          return { ...f, children: insertInto(f.children ?? []) }
        })
      }
      foldersState = insertInto(foldersState)
    }
    return folder
  },

  updateFolder(id: string, data: { name?: string; is_admin_only?: boolean }): void {
    function updateIn(folders: Folder[]): Folder[] {
      return folders.map(f => {
        if (f.id === id) {
          return { ...f, ...data, updated_at: now() }
        }
        return { ...f, children: updateIn(f.children ?? []) }
      })
    }
    foldersState = updateIn(foldersState)
  },

  deleteFolder(id: string): void {
    const folder = findFolderById(id)
    if (folder) {
      foldersState = removeFolderById(id, foldersState)
      trashState = {
        ...trashState,
        folders: [...trashState.folders, { ...folder, deleted_at: now(), children: [] }],
      }
    }
  },

  moveFolder(id: string, parentId: string | null): void {
    const folder = findFolderById(id)
    if (!folder) return
    foldersState = removeFolderById(id, foldersState)
    const updated = { ...folder, parent_id: parentId, updated_at: now() }
    if (!parentId) {
      foldersState = [...foldersState, updated]
    } else {
      function insertInto(folders: Folder[]): Folder[] {
        return folders.map(f => {
          if (f.id === parentId) {
            return { ...f, children: [...(f.children ?? []), updated] }
          }
          return { ...f, children: insertInto(f.children ?? []) }
        })
      }
      foldersState = insertInto(foldersState)
    }
  },

  bulkDeleteFolders(ids: string[]): void {
    ids.forEach(id => mockFolders.deleteFolder(id))
  },

  bulkMoveFolders(ids: string[], parentId: string | null): void {
    ids.forEach(id => mockFolders.moveFolder(id, parentId))
  },
}

// --- Search API ---
export const mockSearch = {
  search(q: string): { files: FileItem[]; folders: Folder[] } {
    const lq = q.toLowerCase()
    const files = filesState.filter(
      f => !f.deleted_at && f.file_name.toLowerCase().includes(lq)
    )
    const allFolders = flattenFolders(foldersState)
    const folders = allFolders.filter(
      f => !f.deleted_at && f.name.toLowerCase().includes(lq)
    )
    return { files, folders }
  },
}

// --- Trash API ---
export const mockTrash = {
  getTrash() {
    return { ...trashState }
  },

  restoreFile(id: string): void {
    const file = trashState.files.find(f => f.id === id)
    if (file) {
      trashState = {
        ...trashState,
        files: trashState.files.filter(f => f.id !== id),
      }
      filesState = [...filesState, { ...file, deleted_at: null }]
    }
  },

  restoreFolder(id: string): void {
    const folder = trashState.folders.find(f => f.id === id)
    if (folder) {
      trashState = {
        ...trashState,
        folders: trashState.folders.filter(f => f.id !== id),
      }
      const restored = { ...folder, deleted_at: null, children: [] }
      if (!restored.parent_id) {
        foldersState = [...foldersState, restored]
      } else {
        function insertInto(folders: Folder[]): Folder[] {
          return folders.map(f => {
            if (f.id === restored.parent_id) {
              return { ...f, children: [...(f.children ?? []), restored] }
            }
            return { ...f, children: insertInto(f.children ?? []) }
          })
        }
        foldersState = insertInto(foldersState)
      }
    }
  },

  deleteFile(id: string): void {
    trashState = {
      ...trashState,
      files: trashState.files.filter(f => f.id !== id),
    }
  },

  deleteFolder(id: string): void {
    trashState = {
      ...trashState,
      folders: trashState.folders.filter(f => f.id !== id),
    }
  },

  emptyTrash(): void {
    trashState = { files: [], folders: [] }
  },
}

// --- Users/Auth API ---
export const mockAuth = {
  currentUser: usersState[0] as User,

  getUsers(): User[] {
    return [...usersState]
  },

  createUser(data: { username: string; name: string; password: string; role: number }): User {
    const user: User = {
      id: generateId(),
      username: data.username,
      name: data.name,
      role: (data.role as 1 | 2),
      created_at: now(),
      updated_at: now(),
    }
    usersState = [...usersState, user]
    return user
  },

  updateUserRole(userId: string, role: number): void {
    usersState = usersState.map(u =>
      u.id === userId ? { ...u, role: role as 1 | 2, updated_at: now() } : u
    )
  },

  deleteUser(userId: string): void {
    usersState = usersState.filter(u => u.id !== userId)
  },
}

export type { FileItem, Folder, User }
