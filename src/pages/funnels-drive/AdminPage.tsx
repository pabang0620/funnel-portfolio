import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { UserPlus, Trash2, Shield, User, FolderOpen, ChevronRight, ChevronDown, Folder as FolderIcon } from 'lucide-react'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Skeleton } from './components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import AppLayout from './components/layout/AppLayout'
import CreateUserDialog from './components/admin/CreateUserDialog'
import DeleteConfirmDialog from './components/dialogs/DeleteConfirmDialog'
import { mockAuth, mockFolders } from '../../data/funnels-drive/mockService'
import { formatDate } from './lib/utils'
import { useAuth } from './contexts/AuthContext'
import type { User as UserType, Folder } from './types'

function flattenFolders(
  folders: Folder[],
  expandedIds: Set<string>,
  depth = 0
): Array<{ folder: Folder; depth: number; hasChildren: boolean }> {
  return folders.flatMap(f => {
    const hasChildren = (f.children ?? []).length > 0
    const row = { folder: f, depth, hasChildren }
    if (!hasChildren || !expandedIds.has(f.id)) return [row]
    return [row, ...flattenFolders(f.children ?? [], expandedIds, depth + 1)]
  })
}

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [roleChangeTarget, setRoleChangeTarget] = useState<UserType | null>(null)
  const [isRoleChanging, setIsRoleChanging] = useState(false)
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 15
  const totalPages = Math.ceil(users.length / PAGE_SIZE)
  const pagedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const fetchUsers = useCallback(() => {
    const sorted = [...mockAuth.getUsers()].sort((a, b) => a.role - b.role)
    setUsers(sorted)
  }, [])

  const loadUsers = useCallback(() => {
    setIsLoading(true)
    setPage(1)
    try {
      fetchUsers()
    } catch {
      toast.error('사용자 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [fetchUsers])

  const refreshUsers = useCallback(() => {
    try {
      fetchUsers()
    } catch {
      toast.error('사용자 목록을 불러오지 못했습니다.')
    }
  }, [fetchUsers])

  useEffect(() => { loadUsers() }, [loadUsers])

  function handleRoleChangeConfirm() {
    if (!roleChangeTarget) return
    const newRole = roleChangeTarget.role === 1 ? 2 : 1
    setIsRoleChanging(true)
    try {
      mockAuth.updateUserRole(roleChangeTarget.id, newRole)
      toast.success('역할이 변경되었습니다.')
      setRoleChangeTarget(null)
      refreshUsers()
    } catch {
      toast.error('역할 변경에 실패했습니다.')
    } finally {
      setIsRoleChanging(false)
    }
  }

  function handleDeleteUser() {
    if (!deleteUserId) return
    setIsDeleting(true)
    try {
      mockAuth.deleteUser(deleteUserId)
      toast.success('계정이 삭제되었습니다.')
      setDeleteUserId(null)
      refreshUsers()
    } catch {
      toast.error('계정 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const deleteTarget = users.find((u) => u.id === deleteUserId)

  const [folders, setFolders] = useState<Folder[]>([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const loadFolders = useCallback(() => {
    setFoldersLoading(true)
    try {
      const data = mockFolders.getFolderTree()
      setFolders(data)
    } catch {
      toast.error('폴더 목록을 불러오지 못했습니다.')
    } finally {
      setFoldersLoading(false)
    }
  }, [])

  function handleToggleAdminOnly(folder: Folder) {
    try {
      mockFolders.updateFolder(folder.id, { is_admin_only: !folder.is_admin_only })
      toast.success('폴더 설정이 변경되었습니다.')
      loadFolders()
    } catch {
      toast.error('폴더 설정 변경에 실패했습니다.')
    }
  }

  return (
    <AppLayout
      selectedFolderId={null}
      onFolderSelect={() => {}}
      onSidebarRefresh={() => {}}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <h1 className="font-semibold text-foreground">관리자 페이지</h1>
        </div>

        <div className="flex-1 overflow-auto p-3">
          <Tabs defaultValue="accounts">
            <TabsList>
              <TabsTrigger value="accounts">계정 관리</TabsTrigger>
              <TabsTrigger value="folders" onClick={() => { if (folders.length === 0) loadFolders() }}>폴더 관리</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-foreground">사용자 목록 ({users.length}명)</h2>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  계정 생성
                </Button>
              </div>

              {isLoading && (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded" />
                  ))}
                </div>
              )}

              {!isLoading && (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-secondary/50 text-muted-foreground">
                        <th className="px-4 py-1.5 text-left font-medium">아이디</th>
                        <th className="px-4 py-1.5 text-left font-medium">이름</th>
                        <th className="px-4 py-1.5 text-left font-medium">역할</th>
                        <th className="px-4 py-1.5 text-left font-medium hidden md:table-cell">생성일</th>
                        <th className="px-4 py-1.5 text-right font-medium">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.map((user) => (
                        <tr key={user.id} className="border-b last:border-b-0 hover:bg-accent">
                          <td className="px-4 py-1.5">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span>{user.username}</span>
                              {user.id === currentUser?.id && (
                                <Badge variant="outline" className="text-xs">나</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-1.5">{user.name}</td>
                          <td className="px-4 py-1.5">
                            <Badge variant={user.role === 1 ? 'default' : 'secondary'}>
                              {user.role === 1 ? '관리자' : '직원'}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {user.id !== currentUser?.id && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setRoleChangeTarget(user)}
                                    className="text-xs"
                                  >
                                    {user.role === 1 ? '직원으로 변경' : '관리자로 변경'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setDeleteUserId(user.id)}
                                    className="text-destructive border-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                  >
                    다음
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="folders" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">폴더 목록</h2>
                <Button size="sm" variant="outline" onClick={loadFolders}>
                  <FolderOpen className="w-4 h-4 mr-1" />
                  새로고침
                </Button>
              </div>

              {foldersLoading && (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded" />
                  ))}
                </div>
              )}

              {!foldersLoading && (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-secondary/50 text-muted-foreground">
                        <th className="px-4 py-2 text-left font-medium">폴더 이름</th>
                        <th className="px-4 py-2 text-left font-medium">공개 설정</th>
                        <th className="px-4 py-2 text-right font-medium">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flattenFolders(folders, expandedIds).map(({ folder, depth, hasChildren }) => (
                        <tr key={folder.id} className="border-b last:border-b-0 hover:bg-accent cursor-pointer" onClick={() => hasChildren && toggleExpand(folder.id)}>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1" style={{ paddingLeft: depth * 12 + 'px' }}>
                              <button
                                type="button"
                                className="w-4 h-4 flex items-center justify-center text-muted-foreground flex-shrink-0"
                                onClick={(e) => { e.stopPropagation(); hasChildren && toggleExpand(folder.id) }}
                              >
                                {hasChildren ? (
                                  expandedIds.has(folder.id)
                                    ? <ChevronDown className="w-3.5 h-3.5" />
                                    : <ChevronRight className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <FolderIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                              <span className="text-sm truncate">{folder.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-1.5">
                            {folder.is_admin_only && (
                              <Badge variant="secondary">관리자 전용</Badge>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleToggleAdminOnly(folder) }}
                            >
                              {folder.is_admin_only ? '전체 공개로' : '관리자 전용으로'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {flattenFolders(folders, expandedIds).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                            폴더가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={loadUsers}
      />

      <DeleteConfirmDialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="계정 삭제"
        description={`"${deleteTarget?.name ?? deleteTarget?.username}" 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        isLoading={isDeleting}
      />

      <DeleteConfirmDialog
        open={!!roleChangeTarget}
        onOpenChange={(open) => !open && setRoleChangeTarget(null)}
        onConfirm={handleRoleChangeConfirm}
        title="역할 변경"
        description={`"${roleChangeTarget?.name ?? roleChangeTarget?.username}"을(를) ${roleChangeTarget?.role === 1 ? '직원' : '관리자'}으로 변경하시겠습니까?`}
        isLoading={isRoleChanging}
      />
    </AppLayout>
  )
}
