import { useState } from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { cn } from '../../lib/utils';
import { useTeams } from '../../hooks/useTeams';
import type { Team } from '../../types';

interface TeamSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TeamSelect({ value, onChange, className }: TeamSelectProps) {
  const { teams, createTeam, deleteTeam } = useTeams();
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Only show active teams in the selector
  const activeTeams = teams.filter((team) => team.is_active);
  const selectedTeam = activeTeams.find((team) => team.id === value);

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;

    setIsCreating(true);
    try {
      const newTeam = await createTeam(newTeamName.trim());
      onChange(newTeam.id);
      setNewTeamName('');
      setIsAdding(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTeam(teamToDelete.id);
      if (value === teamToDelete.id) {
        onChange('');
      }
      setTeamToDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '팀 삭제에 실패했습니다. 해당 팀에 예약이 있으면 삭제할 수 없습니다.');
      setTeamToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTeam();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTeamName('');
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between font-normal", className)}
          >
            {selectedTeam ? selectedTeam.name : '팀을 선택하세요'}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="max-h-[300px] overflow-y-auto">
            {activeTeams.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                팀이 없습니다
              </div>
            ) : (
              <div className="p-1">
                {(Array.isArray(activeTeams) ? activeTeams : []).map((team) => (
                  <div
                    key={team.id}
                    className={cn(
                      'group relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                      value === team.id && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => {
                      onChange(team.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === team.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="flex-1">{team.name}</span>
                    <button
                      type="button"
                      className="ml-2 rounded p-0.5 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(false);
                        setTeamToDelete(team);
                      }}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t p-1">
            {isAdding ? (
              <div className="flex items-center gap-2 p-1">
                <Input
                  placeholder="팀 이름 입력"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="h-8"
                />
                <Button
                  size="sm"
                  onClick={handleAddTeam}
                  disabled={!newTeamName.trim() || isCreating}
                  className="h-8"
                >
                  {isCreating ? '...' : '추가'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTeamName('');
                  }}
                  className="h-8"
                >
                  취소
                </Button>
              </div>
            ) : (
              <button
                type="button"
                className="flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                새 팀 추가
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={!!teamToDelete} onOpenChange={(open) => !open && setTeamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>팀 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{teamToDelete?.name}" 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
