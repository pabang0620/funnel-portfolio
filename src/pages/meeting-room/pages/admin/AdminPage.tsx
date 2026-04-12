import { useState, useMemo, useRef } from 'react';
import { Plus, Network, Edit2, Check, X, Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Loading } from '../../components/ui/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { TeamFormDialog } from '../../components/admin/TeamFormDialog';
import { RoomFormDialog } from '../../components/admin/RoomFormDialog';
import { OrgChartDialog } from '../../components/admin/OrgChartDialog';
import { useTeams } from '../../hooks/useTeams';
import { useRooms } from '../../hooks/useRooms';
import { uploadRoomImage } from '../../lib/api_stub';
import { getImageUrl } from '../../lib/utils';
import type { Team, Room } from '../../types';

export function AdminPage() {
  const { teams, loading: teamsLoading, error: teamsError, updateTeam } = useTeams();
  const { rooms, loading: roomsLoading, error: roomsError, createRoom, updateRoom } = useRooms();

  const [isAuthenticated] = useState(true); // Demo: always authenticated
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [showOrgChart, setShowOrgChart] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('admin-active-tab') || 'teams';
  });

  // Team editing state
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamOrder, setEditTeamOrder] = useState('');
  const [editTeamActive, setEditTeamActive] = useState<boolean>(true);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [teamEditError, setTeamEditError] = useState<string | null>(null);

  // Room editing state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomFloor, setEditRoomFloor] = useState('');
  const [editRoomCapacity, setEditRoomCapacity] = useState('');
  const [editRoomDescription, setEditRoomDescription] = useState('');
  const [editRoomImage, setEditRoomImage] = useState('');
  const [editRoomActive, setEditRoomActive] = useState<boolean>(true);
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [selectedRoomImageFile, setSelectedRoomImageFile] = useState<File | null>(null);
  const [roomImagePreview, setRoomImagePreview] = useState<string | null>(null);
  const roomImageInputRef = useRef<HTMLInputElement>(null);
  const [roomEditError, setRoomEditError] = useState<string | null>(null);

  const teamStats = useMemo(() => {
    const activeTeams = teams.filter((team) => team.is_active);
    return {
      total: teams.length,
      active: activeTeams.length,
      inactive: teams.length - activeTeams.length,
    };
  }, [teams]);

  const roomStats = useMemo(() => {
    const activeRooms = rooms.filter((room) => room.is_active);
    return {
      total: rooms.length,
      active: activeRooms.length,
      inactive: rooms.length - activeRooms.length,
    };
  }, [rooms]);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return a.display_order - b.display_order;
    });
  }, [teams]);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return a.floor.localeCompare(b.floor) || a.name.localeCompare(b.name);
    });
  }, [rooms]);

  // Team handlers
  const handleEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditTeamName(team.name);
    setEditTeamOrder(team.display_order.toString());
    setEditTeamActive(team.is_active);
  };

  const handleSaveTeam = async (teamId: string) => {
    if (!editTeamName.trim()) {
      setTeamEditError('팀 이름을 입력해주세요');
      return;
    }

    setTeamEditError(null);
    setIsSavingTeam(true);
    try {
      await updateTeam(teamId, {
        name: editTeamName.trim(),
        display_order: parseInt(editTeamOrder) || undefined,
        is_active: editTeamActive,
      });
      setEditingTeamId(null);
    } catch (err) {
      setTeamEditError(err instanceof Error ? err.message : '수정에 실패했습니다');
    } finally {
      setIsSavingTeam(false);
    }
  };

  const handleCancelTeam = () => {
    setEditingTeamId(null);
    setEditTeamName('');
    setEditTeamOrder('');
    setEditTeamActive(true);
    setTeamEditError(null);
  };

  // Tab handler
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('admin-active-tab', value);
  };

  // Room handlers
  const handleEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setEditRoomName(room.name);
    setEditRoomFloor(room.floor);
    setEditRoomCapacity(room.capacity?.toString() || '');
    setEditRoomDescription(room.description || '');
    setEditRoomImage(room.image_url || '');
    setEditRoomActive(room.is_active);
    setSelectedRoomImageFile(null);
    setRoomImagePreview(null);
  };

  const handleSaveRoom = async (roomId: string) => {
    if (!editRoomName.trim() || !editRoomFloor.trim()) {
      setRoomEditError('회의실 이름과 층을 입력해주세요');
      return;
    }

    setRoomEditError(null);
    setIsSavingRoom(true);
    try {
      let finalImageUrl = editRoomImage;

      // 새 이미지가 선택되었으면 먼저 업로드
      if (selectedRoomImageFile) {
        console.log('이미지 업로드 시작:', selectedRoomImageFile.name);
        const uploadResult = await uploadRoomImage(selectedRoomImageFile);
        finalImageUrl = uploadResult.filename;
        console.log('이미지 업로드 성공:', uploadResult);
      }

      await updateRoom(roomId, {
        name: editRoomName.trim(),
        floor: editRoomFloor.trim(),
        capacity: editRoomCapacity ? parseInt(editRoomCapacity) : undefined,
        description: editRoomDescription.trim() || undefined,
        image_url: finalImageUrl.trim() || undefined,
        is_active: editRoomActive,
      });
      setEditingRoomId(null);
      setSelectedRoomImageFile(null);
      setRoomImagePreview(null);
    } catch (err) {
      setRoomEditError(err instanceof Error ? err.message : '수정에 실패했습니다');
      console.error('수정 실패:', err);
    } finally {
      setIsSavingRoom(false);
    }
  };

  const handleCancelRoom = () => {
    setEditingRoomId(null);
    setEditRoomName('');
    setEditRoomFloor('');
    setEditRoomCapacity('');
    setEditRoomDescription('');
    setEditRoomImage('');
    setEditRoomActive(true);
    setSelectedRoomImageFile(null);
    setRoomImagePreview(null);
    setRoomEditError(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setRoomEditError('파일 크기는 5MB 이하여야 합니다');
      if (roomImageInputRef.current) roomImageInputRef.current.value = '';
      return;
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setRoomEditError('JPG, PNG, WEBP 형식만 업로드 가능합니다');
      if (roomImageInputRef.current) roomImageInputRef.current.value = '';
      return;
    }

    setSelectedRoomImageFile(file);

    // 로컬 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setRoomImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Demo mode: skip auth guard
  void isAuthenticated;

  if (teamsLoading || roomsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
        <p className="text-sm text-muted-foreground">팀과 회의실을 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="teams">팀 관리</TabsTrigger>
          <TabsTrigger value="rooms">회의실 관리</TabsTrigger>
        </TabsList>

        {/* 팀 관리 탭 */}
        <TabsContent value="teams">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">팀 관리</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowOrgChart(true)}>
                  <Network className="mr-2 h-4 w-4" />
                  조직도
                </Button>
                <Button size="sm" onClick={() => setShowTeamDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  새 팀
                </Button>
              </div>
            </div>

            {/* Dashboard */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">대시보드</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">전체 팀</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{teamStats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">활성 팀</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-green-600">{teamStats.active}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">비활성 팀</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-gray-500">{teamStats.inactive}</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Team List */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">팀 목록</h3>
              {teamEditError && (
                <div className="text-sm text-destructive mb-2">{teamEditError}</div>
              )}
              {teamsError ? (
                <div className="text-sm text-destructive">{teamsError}</div>
              ) : sortedTeams.length === 0 ? (
                <div className="border rounded-lg p-8 text-center bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-3">등록된 팀이 없습니다</p>
                  <Button size="sm" onClick={() => setShowTeamDialog(true)}>
                    첫 팀 추가하기
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">상태</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">팀 이름</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">순서</th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedTeams.map((team) => (
                        <tr key={team.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            {editingTeamId === team.id ? (
                              <Select
                                value={editTeamActive ? 'active' : 'inactive'}
                                onValueChange={(value) => setEditTeamActive(value === 'active')}
                              >
                                <SelectTrigger className="h-8 w-24 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">활성</SelectItem>
                                  <SelectItem value="inactive">비활성</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={team.is_active ? 'default' : 'secondary'} className="text-xs">
                                {team.is_active ? '활성' : '비활성'}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingTeamId === team.id ? (
                              <Input
                                value={editTeamName}
                                onChange={(e) => setEditTeamName(e.target.value)}
                                className="h-8 text-sm max-w-xs"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-medium">{team.name}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingTeamId === team.id ? (
                              <Input
                                type="number"
                                value={editTeamOrder}
                                onChange={(e) => setEditTeamOrder(e.target.value)}
                                className="h-8 text-sm w-20"
                                min="1"
                              />
                            ) : (
                              <span className="text-sm text-muted-foreground">{team.display_order}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              {editingTeamId === team.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleSaveTeam(team.id)}
                                    disabled={isSavingTeam}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={handleCancelTeam}
                                    disabled={isSavingTeam}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleEditTeam(team)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* 회의실 관리 탭 */}
        <TabsContent value="rooms">
          {/* Hidden file input for image upload */}
          <input
            ref={roomImageInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">회의실 관리</h2>
              <Button size="sm" onClick={() => setShowRoomDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                새 회의실
              </Button>
            </div>

            {/* Dashboard */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">대시보드</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">전체 회의실</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{roomStats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">활성 회의실</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-green-600">{roomStats.active}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">비활성 회의실</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-gray-500">{roomStats.inactive}</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Room List */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">회의실 목록</h3>
              {roomEditError && (
                <div className="text-sm text-destructive mb-2">{roomEditError}</div>
              )}
              {roomsError ? (
                <div className="text-sm text-destructive">{roomsError}</div>
              ) : sortedRooms.length === 0 ? (
                <div className="border rounded-lg p-8 text-center bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-3">등록된 회의실이 없습니다</p>
                  <Button size="sm" onClick={() => setShowRoomDialog(true)}>
                    첫 회의실 추가하기
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">이미지</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">상태</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">회의실</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">층</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">수용인원</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">설명</th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedRooms.map((room) => (
                        <tr key={room.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            {editingRoomId === room.id ? (
                              <div
                                className="h-16 w-24 rounded border-2 border-dashed cursor-pointer hover:border-primary hover:bg-accent/50 transition-all relative group"
                                onClick={() => roomImageInputRef.current?.click()}
                                title="클릭하여 이미지 선택"
                              >
                                {(roomImagePreview || editRoomImage) ? (
                                  <>
                                    <img
                                      src={roomImagePreview || getImageUrl(editRoomImage) || ''}
                                      alt="Preview"
                                      className="h-full w-full object-cover rounded"
                                      onError={(e) => {
                                        console.error('이미지 로드 실패:', e.currentTarget.src);
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                      <Upload className="h-6 w-6 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
                                    <Upload className="h-6 w-6 mb-1 group-hover:text-primary transition-colors" />
                                    <span className="text-[10px]">선택</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              room.image_url ? (
                                <img
                                  src={getImageUrl(room.image_url) || ''}
                                  alt={room.name}
                                  className="h-16 w-24 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="h-16 w-24 bg-muted rounded border flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingRoomId === room.id ? (
                              <Select
                                value={editRoomActive ? 'active' : 'inactive'}
                                onValueChange={(value) => setEditRoomActive(value === 'active')}
                              >
                                <SelectTrigger className="h-8 w-24 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">활성</SelectItem>
                                  <SelectItem value="inactive">비활성</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={room.is_active ? 'default' : 'secondary'} className="text-xs">
                                {room.is_active ? '활성' : '비활성'}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingRoomId === room.id ? (
                              <Input
                                value={editRoomName}
                                onChange={(e) => setEditRoomName(e.target.value)}
                                className="h-8 text-sm max-w-xs"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-medium">{room.name}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingRoomId === room.id ? (
                              <Input
                                value={editRoomFloor}
                                onChange={(e) => setEditRoomFloor(e.target.value)}
                                className="h-8 text-sm w-20"
                              />
                            ) : (
                              <span className="text-sm text-muted-foreground">{room.floor}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingRoomId === room.id ? (
                              <Input
                                type="number"
                                value={editRoomCapacity}
                                onChange={(e) => setEditRoomCapacity(e.target.value)}
                                className="h-8 text-sm w-20"
                                min="1"
                              />
                            ) : (
                              <span className="text-sm text-muted-foreground">{room.capacity || '-'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingRoomId === room.id ? (
                              <Input
                                value={editRoomDescription}
                                onChange={(e) => setEditRoomDescription(e.target.value)}
                                className="h-8 text-sm max-w-xs"
                              />
                            ) : (
                              <span className="text-sm text-muted-foreground">{room.description || '-'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              {editingRoomId === room.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleSaveRoom(room.id)}
                                    disabled={isSavingRoom}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={handleCancelRoom}
                                    disabled={isSavingRoom}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleEditRoom(room)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <TeamFormDialog
        open={showTeamDialog}
        onOpenChange={setShowTeamDialog}
        mode="create"
      />

      <RoomFormDialog
        open={showRoomDialog}
        onOpenChange={setShowRoomDialog}
        mode="create"
        onCreateRoom={createRoom}
        onUpdateRoom={updateRoom}
      />

      <OrgChartDialog
        open={showOrgChart}
        onOpenChange={setShowOrgChart}
      />
    </div>
  );
}
