import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useTeams } from '../../hooks/useTeams';
import type { Team } from '../../types';

interface TeamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  team?: Team;
}

export function TeamFormDialog({ open, onOpenChange, mode, team }: TeamFormDialogProps) {
  const { createTeam, updateTeam } = useTeams();
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && team) {
        setName(team.name);
        setDisplayOrder(team.display_order);
      } else {
        setName('');
        setDisplayOrder('');
      }
      setError(null);
    }
  }, [open, mode, team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('팀 이름을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createTeam(name.trim());
      } else if (mode === 'edit' && team) {
        await updateTeam(team.id, {
          name: name.trim(),
          display_order: typeof displayOrder === 'number' ? displayOrder : undefined,
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '작업에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '새 팀 추가' : '팀 수정'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? '새로운 팀을 추가합니다.' : '팀 정보를 수정합니다.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">팀 이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="팀 이름을 입력하세요"
                autoFocus
              />
            </div>

            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="display_order">표시 순서</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="표시 순서를 입력하세요"
                  min="1"
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : mode === 'create' ? '추가' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
